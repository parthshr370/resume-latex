import os
import sys
import base64
import subprocess
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from io import BytesIO

# --- Path and Module Setup ---
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Now we can import our modules
from resume.latex_resume_generator.agents.resume_parser import ResumeParser
from resume.latex_resume_generator.agents.latex_generator import LaTeXGenerator
from resume.latex_resume_generator.utils.pdf_reader import extract_text_from_pdf
from resume.latex_resume_generator.main import ResumeGenerator # For compile_latex-like logic

# --- Helper Function for PDF Compilation ---
def compile_latex_to_pdf(latex_file_path: str, output_dir: str):
    """Compiles a .tex file to a .pdf using pdflatex."""
    try:
        command = ["pdflatex", "-output-directory", output_dir, "-interaction=nonstopmode", latex_file_path]
        process = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
        return True, process.stdout
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
        log = getattr(e, 'stdout', '') + "\n" + getattr(e, 'stderr', '')
        if isinstance(e, FileNotFoundError):
            log = "pdflatex command not found. Please install a LaTeX distribution (e.g., TeX Live)."
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
class ResumeData(BaseModel):
    personal_info: dict
    summary: str
    experience: list
    education: list
    projects: list
    skills: dict

class GenerationResponse(BaseModel):
    json_str: str
    latex_str: str
    pdf_b64: str

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

# --- API Endpoint ---
@app.post("/api/generate-resume", response_model=GenerationResponse)
async def generate_resume(
    resume_data_json: str = Form(...),
    file: UploadFile = File(None)
):
    """
    Receives resume data and an optional PDF file, processes them, 
    and returns the generated resume files.
    """
    try:
        # Load API Key
        load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="API_KEY not found on server.")

        resume_data = json.loads(resume_data_json)
        
        # Extract text from PDF if provided
        pdf_text = ""
        if file:
            contents = await file.read()
            pdf_text = extract_text_from_pdf(BytesIO(contents))

        # Get the full text for the parser
        full_resume_text = get_full_resume_text(resume_data, pdf_text)
        
        # --- AI Processing ---
        parser = ResumeParser(api_key=api_key)
        parsed_data = parser.parse(full_resume_text)
        
        latex_generator = LaTeXGenerator(api_key=api_key)
        latex_content = latex_generator.generate(parsed_data)
        
        # --- File Saving and PDF Compilation ---
        output_dir = os.path.join(PROJECT_ROOT, "resume", "latex_resume_generator", "output")
        os.makedirs(output_dir, exist_ok=True)
        
        json_path = os.path.join(output_dir, "resume_structured.json")
        tex_path = os.path.join(output_dir, "resume.tex")
        pdf_path = os.path.join(output_dir, "resume.pdf")

        with open(json_path, "w") as f:
            json.dump(parsed_data, f, indent=4)
        with open(tex_path, "w") as f:
            f.write(latex_content)
        
        pdf_b64 = ""
        success, log = compile_latex_to_pdf(tex_path, output_dir)
        if success and os.path.exists(pdf_path):
           with open(pdf_path, "rb") as pdf_file:
               pdf_b64 = base64.b64encode(pdf_file.read()).decode('utf-8')
        elif not success:
            print(f"PDF Compilation Failed:\n{log}") # Log error to backend console
        
        return GenerationResponse(
            json_str=json.dumps(parsed_data, indent=4),
            latex_str=latex_content,
            pdf_b64=pdf_b64
        )

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

# --- Root Endpoint for Health Check ---
@app.get("/")
def read_root():
    return {"message": "Resume Generator API is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 