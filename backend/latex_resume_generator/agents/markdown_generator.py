import json
from pathlib import Path
from typing import Dict, Any
from rich import print

from langchain_google_genai import ChatGoogleGenerativeAI

class MarkdownGenerator:
    def __init__(self, api_key: str):
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            google_api_key=api_key,
        )
        
        prompt_path = Path(__file__).parent.parent / "prompts" / "markdown_generation_prompt.txt"
        with open(prompt_path, 'r') as f:
            self.prompt_template = f.read()
        
    def generate(self, resume_data: Dict[str, Any]) -> str:
        """Converts structured resume data to Markdown format."""
        print("Generating Markdown from structured data...")
        
        try:
            final_prompt = self.prompt_template.replace(
                "{resume_json}", json.dumps(resume_data, indent=2)
            )
            
            response = self.model.invoke(final_prompt)
            markdown_content = response.content
            
            # Clean up potential markdown code block fences
            if markdown_content.strip().startswith("```markdown"):
                markdown_content = markdown_content.split("```markdown")[1].split("```")[0].strip()
            elif markdown_content.strip().startswith("```"):
                 markdown_content = markdown_content.strip()[3:-3].strip()


            print("[bold green]Successfully generated Markdown content.[/bold green]")
            return markdown_content
            
        except Exception as e:
            print(f"[bold red]Error generating Markdown:[/bold red] {e}")
            raise

if __name__ == '__main__':
    import os
    from dotenv import load_dotenv

    # Load API key from the root .env file
    dotenv_path = Path(__file__).parent.parent.parent.parent / ".env"
    load_dotenv(dotenv_path=dotenv_path)
    api_key = os.getenv("API_KEY")
    if not api_key:
        raise ValueError("API_KEY not found in .env file. Please create one in the project root.")

    # Sample structured resume data
    sample_data = {
        "personal_info": {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "555-123-4567",
            "location": "New York, NY",
            "linkedin_url": "https://linkedin.com/in/janedoe",
            "github_url": "https://github.com/janedoe"
        },
        "summary": "A highly motivated software engineer with expertise in Python and cloud computing.",
        "experience": [
            {
                "company": "Innovate Inc.",
                "position": "Senior Developer",
                "start_date": "2021",
                "end_date": "Present",
                "responsibilities": [
                    "Led the development of a new cloud-native platform.",
                    "Mentored a team of 4 junior developers."
                ]
            }
        ],
        "education": [
            {
                "institution": "State University",
                "degree": "B.S. in Computer Science",
                "start_date": "2017",
                "end_date": "2021"
            }
        ],
        "projects": [
            {
                "name": "Personal Portfolio",
                "description": "A responsive website to showcase personal projects.",
                "technologies": ["React", "Node.js", "Vercel"]
            }
        ],
        "skills": {
            "technical": ["Python", "JavaScript", "AWS", "Docker"],
            "soft": ["Communication", "Teamwork"]
        }
    }

    # Generate and print the markdown
    markdown_generator = MarkdownGenerator(api_key=api_key)
    markdown_output = markdown_generator.generate(sample_data)
    
    print("--- GENERATED MARKDOWN ---")
    print(markdown_output) 