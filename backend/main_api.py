import os
import sys
import base64
import subprocess
import json
from io import BytesIO

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

# --- Path and Module Setup ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Now we can import our modules
from backend.latex_resume_generator.agents.resume_parser import (
    ResumeParser
)
from backend.latex_resume_generator.agents.latex_generator import (
    LaTeXGenerator
)
from backend.latex_resume_generator.agents.markdown_generator import (
    MarkdownGenerator
)
from backend.latex_resume_generator.utils.pdf_reader import (
    extract_text_from_pdf
)
from backend.latex_resume_generator.schemas.resume_schema import ResumeSchema

# --- Helper Function for PDF Compilation ---
def compile_latex_to_pdf(latex_file_path: str, output_dir: str):
    """Compiles a .tex file to a .pdf using pdflatex."""
    try:
        # Use env to bypass Cursor's environment interference and set proper PATH
        command = [
            "env", "-i", "PATH=/usr/bin:/bin:/usr/local/bin", 
            "/usr/bin/pdflatex", "-output-directory", output_dir, 
            "-interaction=nonstopmode", latex_file_path
        ]
        process = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
        return True, process.stdout
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
        log = getattr(e, 'stdout', '') + "\n" + getattr(e, 'stderr', '')
        if isinstance(e, FileNotFoundError):
            log = "pdflatex command not found. Please install a LaTeX distribution (e.g., TeX Live)."
        # Even if there are LaTeX warnings/errors, check if PDF was created
        if isinstance(e, subprocess.CalledProcessError) and e.returncode == 1:
            # Check if PDF exists despite errors (common with LaTeX warnings)
            pdf_path = os.path.join(output_dir, os.path.splitext(os.path.basename(latex_file_path))[0] + ".pdf")
            if os.path.exists(pdf_path):
                return True, log  # PDF was created despite warnings
        return False, log

# --- FastAPI App Initialization ---
app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # More permissive setting for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Request/Response ---
class InitialGenerationResponse(BaseModel):
    json_str: str
    markdown_str: str

class MarkdownInput(BaseModel):
    markdown_str: str

class MarkdownResponse(BaseModel):
    markdown_str: str

class FinalGenerationResponse(BaseModel):
    latex_str: str
    pdf_b64: str

class ResumeDataInput(BaseModel):
    resume_data_json: str

# --- Full Text Builder ---
def get_full_resume_text(resume_data: dict, pdf_text: str) -> str:
    """Gathers all form data and PDF text into a single string for the parser."""
    text_parts = []
    
    # Personal Info
    pi = resume_data.get('personal_info', {})
    text_parts.append(f"Name: {pi.get('name', '')}")
    text_parts.append(f"Email: {pi.get('email', '')}")
    text_parts.append(f"Phone: {pi.get('phone', '')}")
    text_parts.append(f"Location: {pi.get('location', '')}")
    text_parts.append(f"LinkedIn: {pi.get('linkedin_url', '')}")
    text_parts.append(f"GitHub: {pi.get('github_url', '')}")
    
    # Summary
    if resume_data.get('summary'):
        text_parts.append(f"\n--- Summary ---\n{resume_data['summary']}")

    # Experience
    if resume_data.get('experience'):
        text_parts.append("\n--- Experience ---")
        for exp in resume_data['experience']:
            text_parts.append(f"\nCompany: {exp.get('company', '')}")
            text_parts.append(f"Position: {exp.get('position', '')}")
            text_parts.append(f"Dates: {exp.get('start_date', '')} - {exp.get('end_date', '')}")
            if exp.get('responsibilities'):
                text_parts.append("Responsibilities:\n" + "\n".join([f"- {r}" for r in exp['responsibilities']]))

    # Education
    if resume_data.get('education'):
        text_parts.append("\n--- Education ---")
        for edu in resume_data['education']:
            text_parts.append(f"\nInstitution: {edu.get('institution', '')}")
            text_parts.append(f"Degree: {edu.get('degree', '')}")
            text_parts.append(f"Dates: {edu.get('start_date', '')} - {edu.get('end_date', '')}")
        
    # Projects
    if resume_data.get('projects'):
        text_parts.append("\n--- Projects ---")
        for proj in resume_data['projects']:
            text_parts.append(f"\nProject: {proj.get('name', '')}")
            text_parts.append(f"Description: {proj.get('description', '')}")
            if proj.get('technologies'):
                 text_parts.append("Technologies:\n" + "\n".join([f"- {t}" for t in proj['technologies']]))

    # Skills
    if resume_data.get('skills'):
        skills = resume_data['skills']
        text_parts.append("\n--- Skills ---")
        if skills.get('technical'):
            text_parts.append(f"Technical Skills: {', '.join(skills['technical'])}")
        if skills.get('soft'):
            text_parts.append(f"Soft Skills: {', '.join(skills['soft'])}")
    
    # Add PDF text if it exists
    if pdf_text:
        text_parts.append(f"\n--- Resume from PDF ---\n{pdf_text}")
        
    return "\n".join(text_parts).strip()

# --- API Endpoints ---

@app.post("/api/parse-resume", response_model=ResumeSchema)
async def parse_resume_from_pdf(file: UploadFile = File(...)):
    """
    Receives a PDF file, extracts text, parses it, and returns structured JSON.
    """
    try:
        load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API_KEY not found on server.")

        contents = await file.read()
        pdf_text = extract_text_from_pdf(BytesIO(contents))

        if not pdf_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")

        parser = ResumeParser(api_key=api_key)
        parsed_data = parser.parse(pdf_text)

        # Validate with Pydantic model before returning
        return ResumeSchema(**parsed_data)

    except Exception as e:
        print(f"An unexpected error occurred in /api/parse-resume: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


@app.post("/api/generate-markdown", response_model=MarkdownResponse)
async def generate_markdown_from_json(
    resume_data_json: str = Form(...)
):
    """
    Receives resume data as JSON, validates it, and generates a Markdown string.
    """
    try:
        load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API_KEY not found on server.")
        
        # Parse the JSON string from the form data
        resume_data = json.loads(resume_data_json)
        
        # Validate data with our Pydantic schema
        validated_data = ResumeSchema(**resume_data)

        markdown_generator = MarkdownGenerator(api_key=api_key)
        # We pass the validated data dictionary to the generator
        markdown_content = markdown_generator.generate(validated_data.dict())
        
        return MarkdownResponse(markdown_str=markdown_content)

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in resume_data_json.")
    except Exception as e:
        print(f"An unexpected error occurred in /api/generate-markdown: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


@app.post("/api/generate-latex", response_model=FinalGenerationResponse)
async def generate_latex_from_markdown(data: MarkdownInput):
    """
    Receives Markdown content, generates LaTeX and a PDF, 
    and returns the final files.
    """
    try:
        # Load API Key
        load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API_KEY not found on server.")

        # 1. Generate the full LaTeX document from Markdown
        latex_generator = LaTeXGenerator(api_key=api_key)
        final_latex_content = latex_generator.generate(data.markdown_str)

        # 2. Save the LaTeX content to a temporary file
        output_dir = os.path.join(PROJECT_ROOT, "backend", "latex_resume_generator", "output")
        os.makedirs(output_dir, exist_ok=True)
        
        # Clean up old files
        for f in os.listdir(output_dir):
            os.remove(os.path.join(output_dir, f))

        temp_latex_path = os.path.join(output_dir, "resume.tex")
        with open(temp_latex_path, "w") as f:
            f.write(final_latex_content)

        # 3. Compile the .tex file
        success, log = compile_latex_to_pdf(temp_latex_path, output_dir)
        
        pdf_path = os.path.join(output_dir, "resume.pdf")

        if not success or not os.path.exists(pdf_path):
            error_detail = {
                "message": "Failed to compile LaTeX to PDF.",
                "log": log,
                "latex_code": final_latex_content
            }
            # Log the full error for debugging on the server
            print(f"LaTeX Compilation Error: {log}")
            # Raise HTTPException with the detailed error message
            raise HTTPException(status_code=500, detail=error_detail)

        # 4. Read the generated PDF and encode it
        with open(pdf_path, "rb") as pdf_file:
            pdf_b64 = base64.b64encode(pdf_file.read()).decode('utf-8')

        return FinalGenerationResponse(
            latex_str=final_latex_content,
            pdf_b64=pdf_b64
        )
    
    except HTTPException as e:
        # Re-raise HTTPExceptions to not mask them
        raise e
    except Exception as e:
        print(f"An unexpected error occurred in /api/generate-latex: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

# --- Enhanced API Endpoints ---

class EnhancedGenerationResponse(BaseModel):
    original_json: str
    enhanced_json: str
    markdown_str: str

@app.post("/api/parse-and-enhance", response_model=EnhancedGenerationResponse)
async def parse_and_enhance_resume(
    file: Optional[UploadFile] = File(None),
    resume_data_json: Optional[str] = Form(None),
    enhance: bool = Form(True)
):
    """
    Parses a resume from PDF or JSON and optionally enhances it with AI.
    """
    try:
        load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API_KEY not found on server.")

        # Parse resume data
        if file:
            # Parse from PDF
            contents = await file.read()
            pdf_text = extract_text_from_pdf(BytesIO(contents))
            
            if not pdf_text.strip():
                raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
            
            parser = ResumeParser(api_key=api_key)
            parsed_data = parser.parse(pdf_text)
        elif resume_data_json:
            # Parse from provided JSON
            parsed_data = json.loads(resume_data_json)
        else:
            raise HTTPException(status_code=400, detail="Either file or resume_data_json must be provided.")
        
        # Store original data
        original_json = json.dumps(parsed_data, indent=2)
        
        # Enhance if requested
        if enhance:
            try:
                from backend.latex_resume_generator.agents.resume_enhancer import ResumeEnhancer
                from backend.latex_resume_generator.agents.enhanced_markdown_generator import EnhancedMarkdownGenerator
                
                enhancer = ResumeEnhancer(api_key=api_key)
                enhanced_data = enhancer.enhance(parsed_data)
                
                # Generate enhanced markdown
                markdown_generator = EnhancedMarkdownGenerator(api_key=api_key)
                markdown_content = markdown_generator.generate(enhanced_data)
            except ImportError:
                # Fallback to basic generation if enhanced modules not available
                enhanced_data = parsed_data
                markdown_generator = MarkdownGenerator(api_key=api_key)
                markdown_content = markdown_generator.generate(ResumeSchema(**enhanced_data).dict())
        else:
            enhanced_data = parsed_data
            markdown_generator = MarkdownGenerator(api_key=api_key)
            markdown_content = markdown_generator.generate(ResumeSchema(**enhanced_data).dict())
        
        return EnhancedGenerationResponse(
            original_json=original_json,
            enhanced_json=json.dumps(enhanced_data, indent=2),
            markdown_str=markdown_content
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in resume_data_json.")
    except Exception as e:
        print(f"Error in parse_and_enhance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-enhanced-latex", response_model=FinalGenerationResponse)
async def generate_enhanced_latex(
    markdown_str: str = Form(...),
    enhanced_data_json: str = Form(...),
    style_preferences: Optional[str] = Form(None)
):
    """
    Generates enhanced LaTeX and PDF from markdown and data.
    """
    try:
        load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API_KEY not found on server.")
        
        try:
            from backend.latex_resume_generator.agents.enhanced_latex_generator import EnhancedLaTeXGenerator
            
            # Parse enhanced data
            enhanced_data = json.loads(enhanced_data_json)
            
            # Parse style preferences if provided
            style_prefs = json.loads(style_preferences) if style_preferences else None
            
            # Generate enhanced LaTeX
            latex_generator = EnhancedLaTeXGenerator(api_key=api_key)
            
            # First, get the template content
            template_path = os.path.join(
                PROJECT_ROOT, "backend", "latex_resume_generator", "templates", "enhanced_resume_template.tex"
            )
            with open(template_path, 'r') as f:
                template_content = f.read()
            
            # Generate the document content
            latex_content = latex_generator.generate(markdown_str, style_prefs)
            
            # Combine template and content
            final_latex_content = template_content.replace(
                "% CONTENT SECTIONS - TO BE FILLED BY GENERATOR",
                latex_content
            ).replace(
                "% The generator will insert appropriate sections here based on the enhanced resume data",
                ""
            )
            
        except ImportError:
            # Fallback to basic LaTeX generation
            latex_generator = LaTeXGenerator(api_key=api_key)
            final_latex_content = latex_generator.generate(markdown_str)

        # Save and compile
        output_dir = os.path.join(PROJECT_ROOT, "backend", "latex_resume_generator", "output")
        os.makedirs(output_dir, exist_ok=True)
        
        # Clean up old files
        for f in os.listdir(output_dir):
            if f.endswith(('.tex', '.pdf', '.aux', '.log', '.out')):
                os.remove(os.path.join(output_dir, f))
        
        temp_latex_path = os.path.join(output_dir, "enhanced_resume.tex")
        with open(temp_latex_path, "w") as f:
            f.write(final_latex_content)
        
        # Compile to PDF
        success, log = compile_latex_to_pdf(temp_latex_path, output_dir)
        
        pdf_path = os.path.join(output_dir, "enhanced_resume.pdf")
        
        if not success or not os.path.exists(pdf_path):
            error_detail = {
                "message": "Failed to compile LaTeX to PDF.",
                "log": log,
                "latex_code": final_latex_content
            }
            print(f"LaTeX Compilation Error: {log}")
            raise HTTPException(status_code=500, detail=error_detail)
        
        # Read and encode PDF
        with open(pdf_path, "rb") as pdf_file:
            pdf_b64 = base64.b64encode(pdf_file.read()).decode('utf-8')
        
        return FinalGenerationResponse(
            latex_str=final_latex_content,
            pdf_b64=pdf_b64
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_enhanced_latex: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- Root Endpoint for Health Check ---
@app.get("/")
def read_root():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 
    uvicorn.run(app, host="0.0.0.0", port=8000) 