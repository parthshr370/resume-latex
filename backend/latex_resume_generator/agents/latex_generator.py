import json
from pathlib import Path
from typing import Dict, Any
from rich import print

from langchain_google_genai import ChatGoogleGenerativeAI

# A safe, unique placeholder for our template
PLACEHOLDER = "__RESUME_JSON_GOES_HERE__"

class LaTeXGenerator:
    def __init__(self, api_key: str):
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.3, # Lower temperature for more deterministic LaTeX output
            google_api_key=api_key,
        )
        
        prompt_path = Path(__file__).parent.parent / "prompts" / "markdown_to_latex_prompt.txt"
        with open(prompt_path, 'r') as f:
            self.prompt_template = f.read()
        
    def generate(self, markdown_content: str) -> str:
        """Converts Markdown resume content to LaTeX format."""
        print("Generating LaTeX from Markdown content...")
        
        try:
            final_prompt = self.prompt_template.replace(
                "{markdown_resume}", markdown_content
            )
            
            response = self.model.invoke(final_prompt)
            
            latex_code = response.content
            
            if latex_code.strip().startswith("```latex"):
                latex_code = latex_code.split("```latex")[1].split("```")[0].strip()

            print("[bold green]Successfully generated LaTeX code from Markdown.[/bold green]")
            return latex_code
            
        except Exception as e:
            print(f"[bold red]Error generating LaTeX from Markdown:[/bold red] {e}")
            raise 