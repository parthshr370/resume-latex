import os
import sys
import base64
import subprocess
import json
from io import BytesIO
from typing import Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# --- Path and Module Setup ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Import enhanced modules
from backend.latex_resume_generator.agents.resume_parser import ResumeParser
from backend.latex_resume_generator.agents.resume_enhancer import ResumeEnhancer
from backend.latex_resume_generator.agents.enhanced_markdown_generator import EnhancedMarkdownGenerator
from backend.latex_resume_generator.agents.enhanced_latex_generator import EnhancedLaTeXGenerator
from backend.latex_resume_generator.utils.pdf_reader import extract_text_from_pdf
from backend.latex_resume_generator.schemas.resume_schema import ResumeSchema
from backend.latex_resume_generator.schemas.enhanced_resume_schema import EnhancedResumeSchema

# --- Helper Function for PDF Compilation ---
def compile_latex_to_pdf(latex_file_path: str, output_dir: str):
    """Compiles a .tex file to a .pdf using pdflatex."""
    try:
        # Run pdflatex twice to resolve references
        for _ in range(2):
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
        # Check if PDF was created despite errors
        if isinstance(e, subprocess.CalledProcessError) and e.returncode == 1:
            pdf_path = os.path.join(output_dir, os.path.splitext(os.path.basename(latex_file_path))[0] + ".pdf")
            if os.path.exists(pdf_path):
                return True, log
        return False, log

# --- FastAPI App Initialization ---
app = FastAPI(title="Enhanced Resume Generator API")

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class EnhancedGenerationResponse(BaseModel):
    original_json: str
    enhanced_json: str
    markdown_str: str

class EnhancedFinalGenerationResponse(BaseModel):
    latex_str: str
    pdf_b64: str
    enhanced_data: Dict[str, Any]

# --- API Endpoints ---

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
            enhancer = ResumeEnhancer(api_key=api_key)
            enhanced_data = enhancer.enhance(parsed_data)
        else:
            enhanced_data = parsed_data
        
        # Generate enhanced markdown
        markdown_generator = EnhancedMarkdownGenerator(api_key=api_key)
        markdown_content = markdown_generator.generate(enhanced_data)
        
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


@app.post("/api/generate-enhanced-latex", response_model=EnhancedFinalGenerationResponse)
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
        full_latex = template_content.replace(
            "% CONTENT SECTIONS - TO BE FILLED BY GENERATOR",
            latex_content
        ).replace(
            "% The generator will insert appropriate sections here based on the enhanced resume data",
            ""
        )
        
        # Save and compile
        output_dir = os.path.join(PROJECT_ROOT, "backend", "latex_resume_generator", "output")
        os.makedirs(output_dir, exist_ok=True)
        
        # Clean up old files
        for f in os.listdir(output_dir):
            if f.endswith(('.tex', '.pdf', '.aux', '.log', '.out')):
                os.remove(os.path.join(output_dir, f))
        
        temp_latex_path = os.path.join(output_dir, "enhanced_resume.tex")
        with open(temp_latex_path, "w") as f:
            f.write(full_latex)
        
        # Compile to PDF
        success, log = compile_latex_to_pdf(temp_latex_path, output_dir)
        
        pdf_path = os.path.join(output_dir, "enhanced_resume.pdf")
        
        if not success or not os.path.exists(pdf_path):
            error_detail = {
                "message": "Failed to compile LaTeX to PDF.",
                "log": log,
                "latex_code": full_latex
            }
            print(f"LaTeX Compilation Error: {log}")
            raise HTTPException(status_code=500, detail=error_detail)
        
        # Read and encode PDF
        with open(pdf_path, "rb") as pdf_file:
            pdf_b64 = base64.b64encode(pdf_file.read()).decode('utf-8')
        
        return EnhancedFinalGenerationResponse(
            latex_str=full_latex,
            pdf_b64=pdf_b64,
            enhanced_data=enhanced_data
        )
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate_enhanced_latex: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Enhanced Resume Generator API",
        "endpoints": [
            "/api/parse-and-enhance",
            "/api/generate-enhanced-latex"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 