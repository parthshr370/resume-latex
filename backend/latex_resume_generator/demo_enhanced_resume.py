"""
Demonstration of the Enhanced Resume Generation System
This script shows how minimal input is intelligently expanded into a professional resume.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from rich import print

# Load environment variables
load_dotenv()
api_key = os.getenv("API_KEY")

# Import enhanced agents
from agents.resume_enhancer import ResumeEnhancer
from agents.enhanced_markdown_generator import EnhancedMarkdownGenerator
from agents.enhanced_latex_generator import EnhancedLaTeXGenerator

def demo_enhanced_resume():
    """
    Demonstrates how minimal resume input is enhanced into a professional document.
    """
    
    # Minimal input - similar to what a user might provide
    minimal_resume = {
        "personal_info": {
            "name": "Alex Chen",
            "email": "alex.chen@example.com",
            "phone": "555-123-4567",
            "location": "San Francisco, CA",
            "linkedin_url": "linkedin.com/in/alexchen",
            "github_url": "github.com/alexchen",
            "twitter_url": "twitter.com/alexchen_dev"
        },
        "summary": "AI engineer working on multi-agent systems",
        "experience": [
            {
                "company": "TechCorp AI",
                "position": "Senior AI Engineer",
                "start_date": "2022",
                "end_date": "Present",
                "responsibilities": [
                    "Built multi-agent customer service system",
                    "Improved response time using caching"
                ]
            },
            {
                "company": "DataSystems Inc",
                "position": "Machine Learning Engineer",
                "start_date": "2020",
                "end_date": "2022",
                "responsibilities": [
                    "Developed recommendation engine",
                    "Worked on NLP models"
                ]
            }
        ],
        "projects": [
            {
                "name": "AgentFlow",
                "description": "Multi-agent orchestration framework",
                "technologies": ["Python", "LangChain", "FastAPI"]
            },
            {
                "name": "SmartCache",
                "description": "Intelligent caching for LLM responses",
                "technologies": ["Redis", "Python", "Docker"]
            }
        ],
        "education": [
            {
                "institution": "Stanford University",
                "degree": "MS in Computer Science",
                "start_date": "2018",
                "end_date": "2020"
            }
        ],
        "skills": {
            "technical": ["Python", "LangChain", "PyTorch", "Docker", "Kubernetes", "FastAPI", 
                         "Redis", "PostgreSQL", "AWS", "GCP", "Git", "CI/CD"],
            "soft": ["Leadership", "Communication", "Problem Solving"]
        }
    }
    
    print("[bold blue]Original Minimal Resume Data:[/bold blue]")
    print(json.dumps(minimal_resume, indent=2))
    print("\n" + "="*80 + "\n")
    
    # Step 1: Enhance the resume
    print("[bold green]Step 1: Enhancing resume with AI...[/bold green]")
    enhancer = ResumeEnhancer(api_key=api_key)
    enhanced_resume = enhancer.enhance(minimal_resume)
    
    print("[bold blue]Enhanced Resume Data:[/bold blue]")
    print(json.dumps(enhanced_resume, indent=2))
    print("\n" + "="*80 + "\n")
    
    # Step 2: Generate enhanced markdown
    print("[bold green]Step 2: Generating enhanced Markdown...[/bold green]")
    markdown_generator = EnhancedMarkdownGenerator(api_key=api_key)
    markdown_content = markdown_generator.generate(enhanced_resume)
    
    print("[bold blue]Generated Markdown:[/bold blue]")
    print(markdown_content)
    print("\n" + "="*80 + "\n")
    
    # Step 3: Generate LaTeX
    print("[bold green]Step 3: Generating LaTeX code...[/bold green]")
    latex_generator = EnhancedLaTeXGenerator(api_key=api_key)
    latex_content = latex_generator.generate(markdown_content)
    
    # Save outputs
    output_dir = Path("output")
    output_dir.mkdir(exist_ok=True)
    
    # Save enhanced JSON
    with open(output_dir / "enhanced_resume.json", "w") as f:
        json.dump(enhanced_resume, f, indent=2)
    
    # Save markdown
    with open(output_dir / "enhanced_resume.md", "w") as f:
        f.write(markdown_content)
    
    # Save LaTeX
    with open(output_dir / "enhanced_resume.tex", "w") as f:
        # Load template
        template_path = Path(__file__).parent / "templates" / "enhanced_resume_template.tex"
        with open(template_path, 'r') as template_file:
            template = template_file.read()
        
        # Insert generated content
        full_latex = template.replace(
            "% CONTENT SECTIONS - TO BE FILLED BY GENERATOR",
            latex_content
        ).replace(
            "% The generator will insert appropriate sections here based on the enhanced resume data",
            ""
        )
        f.write(full_latex)
    
    print(f"[bold green]✓ Enhanced resume saved to {output_dir}/[/bold green]")
    print(f"  - enhanced_resume.json")
    print(f"  - enhanced_resume.md")
    print(f"  - enhanced_resume.tex")
    
    # Demonstrate project enhancement
    print("\n" + "="*80 + "\n")
    print("[bold yellow]Bonus: Demonstrating project enhancement from minimal input[/bold yellow]")
    
    minimal_project = {
        "name": "RAG Pipeline",
        "brief_idea": "Built a retrieval system for documents",
        "technologies": ["Python", "ChromaDB", "OpenAI"]
    }
    
    print("[bold blue]Minimal project input:[/bold blue]")
    print(json.dumps(minimal_project, indent=2))
    
    enhanced_project = enhancer.enhance_project_description(
        minimal_project["name"],
        minimal_project["brief_idea"],
        minimal_project["technologies"]
    )
    
    print("\n[bold blue]Enhanced project output:[/bold blue]")
    print(json.dumps(enhanced_project, indent=2))
    
    # Demonstrate skill categorization
    print("\n" + "="*80 + "\n")
    print("[bold yellow]Bonus: Demonstrating intelligent skill categorization[/bold yellow]")
    
    flat_skills = [
        "Python", "JavaScript", "React", "Node.js", "Docker", "Kubernetes",
        "AWS", "GCP", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas",
        "Git", "CI/CD", "Agile", "Leadership", "Communication"
    ]
    
    print("[bold blue]Flat skill list:[/bold blue]")
    print(flat_skills)
    
    categorized = enhancer.categorize_skills(flat_skills, "Full-stack AI Engineer")
    
    print("\n[bold blue]Intelligently categorized skills:[/bold blue]")
    for category in categorized:
        print(f"\n[bold]{category['category_name']}:[/bold]")
        print(f"  {', '.join(category['skills'])}")


if __name__ == "__main__":
    demo_enhanced_resume() 