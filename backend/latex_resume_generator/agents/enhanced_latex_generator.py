import json
from pathlib import Path
from typing import Dict, Any
from rich import print

from langchain_google_genai import ChatGoogleGenerativeAI

class EnhancedLaTeXGenerator:
    """
    Generates professional LaTeX code from enhanced Markdown content.
    Produces output similar to high-quality technical resumes.
    """
    
    def __init__(self, api_key: str):
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.2,  # Very low temperature for consistent LaTeX
            google_api_key=api_key,
        )
        
        # Load the enhanced LaTeX generation prompt
        prompt_path = Path(__file__).parent.parent / "prompts" / "enhanced_latex_generation_prompt.txt"
        with open(prompt_path, 'r') as f:
            self.prompt_template = f.read()
        
        # Load the LaTeX template
        template_path = Path(__file__).parent.parent / "templates" / "enhanced_resume_template.tex"
        with open(template_path, 'r') as f:
            self.latex_template = f.read()
    
    def generate(self, markdown_content: str, style_preferences: Dict[str, Any] = None) -> str:
        """
        Converts enhanced Markdown resume to professional LaTeX format.
        
        Args:
            markdown_content: The enhanced Markdown resume
            style_preferences: Optional styling preferences (font, colors, etc.)
            
        Returns:
            Complete LaTeX document ready for compilation
        """
        print("[bold blue]Generating enhanced LaTeX from Markdown...[/bold blue]")
        
        try:
            # Prepare the prompt
            final_prompt = self.prompt_template.replace(
                "{markdown_resume}", markdown_content
            ).replace(
                "{latex_template}", self.latex_template
            )
            
            # Add style preferences if provided
            if style_preferences:
                style_info = f"\nStyle preferences: {json.dumps(style_preferences, indent=2)}"
                final_prompt += style_info
            
            response = self.model.invoke(final_prompt)
            latex_code = response.content
            
            # Clean up code block markers if present
            if latex_code.strip().startswith("```latex"):
                latex_code = latex_code.split("```latex")[1].split("```")[0].strip()
            elif latex_code.strip().startswith("```"):
                latex_code = latex_code.strip()[3:-3].strip()
            
            print("[bold green]Successfully generated enhanced LaTeX code.[/bold green]")
            return latex_code
            
        except Exception as e:
            print(f"[bold red]Error generating enhanced LaTeX:[/bold red] {e}")
            raise
    
    def validate_latex(self, latex_code: str) -> bool:
        """
        Basic validation to ensure LaTeX code has required structure.
        """
        required_elements = [
            r"\documentclass",
            r"\begin{document}",
            r"\end{document}",
            r"\section",
        ]
        
        for element in required_elements:
            if element not in latex_code:
                print(f"[bold yellow]Warning: Missing {element} in LaTeX code[/bold yellow]")
                return False
        
        return True 