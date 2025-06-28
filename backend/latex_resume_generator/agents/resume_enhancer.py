import json
from pathlib import Path
from typing import Dict, Any, List
from rich import print

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from backend.latex_resume_generator.schemas.enhanced_resume_schema import EnhancedResumeSchema


class ResumeEnhancer:
    """
    An intelligent agent that enhances resume content by:
    - Expanding project descriptions from minimal input
    - Organizing skills into dynamic, contextual categories
    - Enhancing experience descriptions with quantifiable achievements
    - Adding relevant sections based on the content
    """
    
    def __init__(self, api_key: str):
        # Initialize the model with higher temperature for creative enhancement
        self.model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.8,
            google_api_key=api_key,
        )
        
        # Set up a Pydantic parser for the enhanced schema
        self.parser = PydanticOutputParser(pydantic_object=EnhancedResumeSchema)
        
        # Load the enhancement prompt
        prompt_path = Path(__file__).parent.parent / "prompts" / "resume_enhancement_prompt.txt"
        with open(prompt_path, 'r') as f:
            template = f.read()
        
        # Create the prompt with parser's format instructions
        self.prompt = ChatPromptTemplate.from_template(
            template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
        # Create the chain
        self.chain = self.prompt | self.model | self.parser
    
    def enhance(self, basic_resume_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes basic resume data and intelligently enhances it.
        
        Args:
            basic_resume_data: Basic resume information that may have minimal details
            
        Returns:
            Enhanced resume data with expanded descriptions and dynamic sections
        """
        print("[bold blue]Enhancing resume content with AI...[/bold blue]")
        
        try:
            # Run the enhancement chain
            enhanced_resume = self.chain.invoke({
                "basic_resume_json": json.dumps(basic_resume_data, indent=2)
            })
            
            # Convert to dict
            enhanced_data = enhanced_resume.model_dump()
            
            print("[bold green]Successfully enhanced resume content![/bold green]")
            return enhanced_data
            
        except Exception as e:
            print(f"[bold red]Error enhancing resume:[/bold red] {e}")
            raise
    
    def enhance_project_description(self, project_name: str, brief_idea: str, technologies: List[str]) -> Dict[str, Any]:
        """
        Takes a minimal project description and expands it intelligently.
        """
        prompt = f"""
        Given this project information:
        - Name: {project_name}
        - Brief idea: {brief_idea}
        - Technologies: {', '.join(technologies)}
        
        Create a professional, detailed project description suitable for a resume. Include:
        1. A one-line description of what the project does
        2. 3-5 detailed bullet points covering:
           - Technical implementation details
           - Challenges solved
           - Architecture/design decisions
           - Quantifiable impact or outcomes
        3. Any measurable outcomes
        
        Use crisp, professional language with action verbs. Be specific about technical details.
        Format as JSON with keys: brief_description, detailed_points, outcomes
        """
        
        response = self.model.invoke(prompt)
        return json.loads(response.content)
    
    def categorize_skills(self, skills_list: List[str], role_context: str) -> List[Dict[str, Any]]:
        """
        Takes a flat list of skills and organizes them into intelligent categories
        based on the role context.
        """
        prompt = f"""
        Given this list of skills: {', '.join(skills_list)}
        And this role context: {role_context}
        
        Organize these skills into meaningful categories that make sense for this person's profile.
        Go beyond just "technical" and "soft" skills. Create categories like:
        - LLM & AI Frameworks
        - Data Processing & Analysis
        - Languages
        - Developer Tools
        - Domain-Specific Skills
        - Research & Documentation
        - etc.
        
        Return as JSON list where each item has:
        - category_name: The category name
        - skills: List of skills in that category
        
        Make sure every skill is categorized appropriately.
        """
        
        response = self.model.invoke(prompt)
        return json.loads(response.content) 