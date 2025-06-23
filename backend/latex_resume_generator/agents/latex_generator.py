import json
from pathlib import Path
from typing import Dict, Any
from rich import print

from langchain_google_genai import ChatGoogleGenerativeAI

# A safe, unique placeholder for our template
PLACEHOLDER = "__RESUME_JSON_GOES_HERE__"

class LaTeXGenerator:
    def __init__(self, api_key: str):
        # Initialize the model directly
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            google_api_key=api_key,
        )
        
        # Load the raw prompt content from file
        prompt_path = Path(__file__).parent.parent / "prompts" / "latex_generation_prompt.txt"
        with open(prompt_path, 'r') as f:
            # We replace our variable {resume_json} with the safe placeholder
            self.raw_prompt_template = f.read().replace("{resume_json}", PLACEHOLDER)
        
    def generate(self, resume_data: Dict[str, Any]) -> str:
        """Converts structured resume data to LaTeX format by directly invoking the model."""
        print("Generating LaTeX from structured data...")
        
        try:
            # Prepare the final prompt by replacing the placeholder with the actual JSON data
            final_prompt = self.raw_prompt_template.replace(
                PLACEHOLDER, json.dumps(resume_data, indent=2)
            )
            
            # Directly invoke the model with the final prompt string
            response = self.model.invoke(final_prompt)
            
            # The response from the model is an AIMessage object. We need its content.
            latex_code = response.content
            
            # A simple cleanup to remove markdown code blocks if the model adds them
            if latex_code.strip().startswith("```latex"):
                latex_code = latex_code.split("```latex")[1].split("```")[0].strip()

            print("[bold green]Successfully generated LaTeX code.[/bold green]")
            return latex_code
            
        except Exception as e:
            print(f"[bold red]Error generating LaTeX:[/bold red] {e}")
            raise 