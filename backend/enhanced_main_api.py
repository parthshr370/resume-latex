import os
import sys
import base64
import subprocess
import json
import shutil
from io import BytesIO
from typing import Optional, Dict, Any
import logging

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from rich.console import Console
from rich.logging import RichHandler
from rich import print as rprint
from rich.panel import Panel
from rich.table import Table

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

# --- Rich Console and Logging Setup ---
console = Console()
logging.basicConfig(
    level="INFO",
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(console=console, rich_tracebacks=True)],
)
logger = logging.getLogger("rich")

console.print(Panel.fit("[bold green]Enhanced Resume Generator API Started[/]", border_style="blue"))

# --- Helper Function for PDF Compilation ---
def compile_latex_to_pdf(latex_file_path: str, output_dir: str, engine: str = "pdflatex"):
    """Compiles a .tex file to a .pdf using a specified engine."""
    try:
        # Run the specified engine twice to resolve references
        for _ in range(2):
            command = [
                "env", "-i", "PATH=/usr/bin:/bin:/usr/local/bin", 
                f"/usr/bin/{engine}", "-output-directory", output_dir, 
                "-interaction=nonstopmode", latex_file_path
            ]
            process = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
        return True, process.stdout
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError) as e:
        log = getattr(e, 'stdout', '') + "\n" + getattr(e, 'stderr', '')
        if isinstance(e, FileNotFoundError):
            log = f"{engine} command not found. Please install a LaTeX distribution (e.g., TeX Live)."
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
    with console.status("[bold yellow]Processing /api/parse-and-enhance...") as status:
        try:
            # --- Logging Request Details ---
            request_panel = Panel(
                f"[bold]Source:[/bold] {'PDF Upload' if file else 'JSON Data'}\n"
                f"[bold]Enhance Mode:[/bold] {enhance}",
                title="[cyan]Incoming Request: /api/parse-and-enhance[/cyan]",
                border_style="cyan"
            )
            console.print(request_panel)
            
            status.update("[yellow]Loading environment variables...")
            load_dotenv()
            api_key = os.getenv("API_KEY")
            if not api_key:
                logger.error("API_KEY not found on server.")
                raise HTTPException(status_code=500, detail="API_KEY not found on server.")
            
            status.update("[yellow]Parsing resume data...")
            logger.info("Step 1: Parsing resume data...")
            if file:
                contents = await file.read()
                pdf_text = extract_text_from_pdf(BytesIO(contents))
                if not pdf_text.strip():
                    logger.error("Could not extract text from PDF.")
                    raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
                parser = ResumeParser(api_key=api_key)
                parsed_data = parser.parse(pdf_text)
            elif resume_data_json:
                parsed_data = json.loads(resume_data_json)
            else:
                logger.error("Either file or resume_data_json must be provided.")
                raise HTTPException(status_code=400, detail="Either file or resume_data_json must be provided.")
            logger.info("✅ Parsing complete.")
            
            original_json = json.dumps(parsed_data, indent=2)
            
            if enhance:
                status.update("[yellow]Enhancing resume with AI...")
                logger.info("Step 2: Enhancing resume content...")
                enhancer = ResumeEnhancer(api_key=api_key)
                enhanced_data = enhancer.enhance(parsed_data)
                logger.info("✅ Enhancement complete.")
            else:
                logger.info("Step 2: Skipping enhancement.")
                enhanced_data = parsed_data
            
            status.update("[yellow]Generating Markdown content...")
            logger.info("Step 3: Generating Markdown...")
            markdown_generator = EnhancedMarkdownGenerator(api_key=api_key)
            markdown_content = markdown_generator.generate(enhanced_data)
            logger.info("✅ Markdown generation complete.")

            console.print(Panel("[bold green]Request successfully completed[/bold green]", border_style="green"))
            return EnhancedGenerationResponse(
                original_json=original_json,
                enhanced_json=json.dumps(enhanced_data, indent=2),
                markdown_str=markdown_content
            )

        except json.JSONDecodeError:
            logger.error("Invalid JSON format in resume_data_json.")
            raise HTTPException(status_code=400, detail="Invalid JSON format in resume_data_json.")
        except Exception as e:
            logger.exception(f"Error in parse_and_enhance: {e}")
            raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-enhanced-latex", response_model=EnhancedFinalGenerationResponse)
async def generate_enhanced_latex(
    markdown_str: str = Form(...),
    enhanced_data_json: str = Form(...),
    template_name: str = Form("jakes_resume"),
    style_preferences: Optional[str] = Form(None)
):
    """
    Generates enhanced LaTeX and PDF from markdown and data.
    """
    with console.status("[bold yellow]Processing /api/generate-enhanced-latex...") as status:
        try:
            # --- Logging Request Details ---
            table = Table(title="[cyan]Incoming Request: /api/generate-enhanced-latex[/cyan]", border_style="cyan")
            table.add_column("Parameter", style="bold")
            table.add_column("Value")
            table.add_row("Template Name", template_name)
            table.add_row("Markdown Length", f"{len(markdown_str)} chars")
            table.add_row("Style Preferences", str(style_preferences))
            console.print(table)

            status.update("[yellow]Loading environment variables...")
            load_dotenv()
            api_key = os.getenv("API_KEY")
            if not api_key:
                logger.error("API_KEY not found on server.")
                raise HTTPException(status_code=500, detail="API_KEY not found on server.")
            
            enhanced_data = json.loads(enhanced_data_json)
            style_prefs = json.loads(style_preferences) if style_preferences else None
            
            status.update(f"[yellow]Step 1: Generating LaTeX for template '{template_name}'...")
            logger.info(f"Step 1: Generating LaTeX for template '{template_name}'...")
            latex_generator = EnhancedLaTeXGenerator(api_key=api_key)
            
            template_dir = os.path.join(PROJECT_ROOT, "backend", "latex_resume_generator", "templates", template_name)
            template_path = os.path.join(template_dir, "template.tex")
            with open(template_path, 'r') as f:
                template_content = f.read()

            engine = "pdflatex"
            config_path = os.path.join(template_dir, 'template.cfg')
            if os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    for line in f:
                        if line.startswith('engine='):
                            engine = line.strip().split('=')[1]
                            logger.info(f"Found custom engine '{engine}' for template '{template_name}'")
                            break
            
            full_latex = latex_generator.generate(
                markdown_content=markdown_str, 
                style_preferences=style_prefs, 
                template_name=template_name
            )
            logger.info("✅ LaTeX generation complete.")
            
            status.update("[yellow]Step 2: Preparing output directory...")
            logger.info("Step 2: Preparing output directory...")
            output_dir = os.path.join(PROJECT_ROOT, "backend", "latex_resume_generator", "output", template_name)
            os.makedirs(output_dir, exist_ok=True)
            
            for f in os.listdir(output_dir):
                if f.endswith(('.tex', '.pdf', '.aux', '.log', '.out')):
                    os.remove(os.path.join(output_dir, f))
            
            for item in os.listdir(template_dir):
                if item.endswith(('.cls', '.sty')):
                    shutil.copy(os.path.join(template_dir, item), output_dir)
            
            temp_latex_path = os.path.join(output_dir, "enhanced_resume.tex")
            with open(temp_latex_path, "w") as f:
                f.write(full_latex)
            logger.info("✅ Output directory prepared.")

            status.update(f"[yellow]Step 3: Compiling PDF using '{engine}'...")
            logger.info(f"Step 3: Compiling PDF using '{engine}'...")
            success, log = compile_latex_to_pdf(temp_latex_path, output_dir, engine)
            
            pdf_path = os.path.join(output_dir, "enhanced_resume.pdf")
            
            if not success or not os.path.exists(pdf_path):
                error_detail = {"message": "Failed to compile LaTeX to PDF.", "log": log, "latex_code": full_latex}
                logger.error(f"LaTeX Compilation Error: {log}")
                raise HTTPException(status_code=500, detail=error_detail)
            
            logger.info("✅ PDF compilation successful.")
            
            status.update("[yellow]Step 4: Encoding PDF...")
            logger.info("Step 4: Encoding PDF...")
            with open(pdf_path, "rb") as pdf_file:
                pdf_b64 = base64.b64encode(pdf_file.read()).decode('utf-8')
            logger.info("✅ PDF encoded successfully.")

            console.print(Panel("[bold green]Request successfully completed[/bold green]", border_style="green"))
            return EnhancedFinalGenerationResponse(
                latex_str=full_latex,
                pdf_b64=pdf_b64,
                enhanced_data=enhanced_data
            )
        
        except HTTPException:
            raise
        except Exception as e:
            logger.exception(f"Error in generate_enhanced_latex: {e}")
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