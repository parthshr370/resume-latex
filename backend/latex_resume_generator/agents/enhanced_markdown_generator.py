import json
from pathlib import Path
from typing import Dict, Any, List
from rich import print

from langchain_google_genai import ChatGoogleGenerativeAI

class EnhancedMarkdownGenerator:
    """
    Generates professional Markdown from enhanced resume data with dynamic sections.
    """
    
    def __init__(self, api_key: str):
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.5,
            google_api_key=api_key,
        )
        
        prompt_path = Path(__file__).parent.parent / "prompts" / "enhanced_markdown_generation_prompt.txt"
        with open(prompt_path, 'r') as f:
            self.prompt_template = f.read()
    
    def generate(self, enhanced_resume_data: Dict[str, Any]) -> str:
        """
        Converts enhanced resume data to professional Markdown format.
        Handles dynamic sections and categories intelligently.
        """
        print("[bold blue]Generating enhanced Markdown from structured data...[/bold blue]")
        
        try:
            # Prepare the prompt with the enhanced data
            final_prompt = self.prompt_template.replace(
                "{enhanced_resume_json}", json.dumps(enhanced_resume_data, indent=2)
            )
            
            response = self.model.invoke(final_prompt)
            markdown_content = response.content
            
            # Clean up any code block markers
            if markdown_content.strip().startswith("```markdown"):
                markdown_content = markdown_content.split("```markdown")[1].split("```")[0].strip()
            elif markdown_content.strip().startswith("```"):
                markdown_content = markdown_content.strip()[3:-3].strip()
            
            print("[bold green]Successfully generated enhanced Markdown content.[/bold green]")
            return markdown_content
            
        except Exception as e:
            print(f"[bold red]Error generating enhanced Markdown:[/bold red] {e}")
            raise
    
    def format_skills_section(self, skills_categories: List[Dict[str, Any]]) -> str:
        """
        Formats the dynamic skills categories into Markdown.
        """
        markdown_lines = ["## Technical Skills", ""]
        
        for category in skills_categories:
            category_name = category.get('category_name', 'Skills')
            skills = category.get('skills', [])
            
            # Format as: **Category**: skill1, skill2, skill3
            if skills:
                markdown_lines.append(f"**{category_name}**: {', '.join(skills)}")
                markdown_lines.append("")
        
        return '\n'.join(markdown_lines)
    
    def format_project_section(self, projects: List[Dict[str, Any]]) -> str:
        """
        Formats enhanced projects with detailed bullet points.
        """
        markdown_lines = ["## Projects", ""]
        
        for project in projects:
            # Project header with context if available
            header = f"### {project['name']}"
            if project.get('context'):
                header += f" | *{project['context']}*"
            markdown_lines.append(header)
            markdown_lines.append("")
            
            # Brief description
            if project.get('brief_description'):
                markdown_lines.append(f"*{project['brief_description']}*")
                markdown_lines.append("")
            
            # Detailed points
            for point in project.get('detailed_points', []):
                markdown_lines.append(f"- {point}")
            
            # Technologies
            if project.get('technologies'):
                markdown_lines.append(f"- **Technologies**: {', '.join(project['technologies'])}")
            
            # Outcomes
            for outcome in project.get('outcomes', []):
                markdown_lines.append(f"- **Impact**: {outcome}")
            
            markdown_lines.append("")
        
        return '\n'.join(markdown_lines) 