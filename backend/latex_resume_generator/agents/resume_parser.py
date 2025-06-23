import json
from rich import print
from pathlib import Path
from typing import Dict, Any

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from resume.latex_resume_generator.schemas.resume_schema import Resume

class ResumeParser:
    def __init__(self, api_key: str):
        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            google_api_key=api_key,
        )
        
        # Set up a Pydantic parser
        self.parser = PydanticOutputParser(pydantic_object=Resume)
        
        # Load prompt template
        prompt_path = Path(__file__).parent.parent / "prompts" / "resume_parsing_prompt.txt"
        with open(prompt_path, 'r') as f:
            template = f.read()
        
        # Create the prompt with the parser's format instructions
        prompt = ChatPromptTemplate.from_template(
            template,
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
        # Create the chain
        self.chain = prompt | model | self.parser
        
    def parse(self, resume_text: str) -> Dict[str, Any]:
        """Convert raw resume text to structured JSON format."""
        print("Parsing resume text to structured JSON...")
        
        try:
            # Run the chain
            parsed_resume = self.chain.invoke({"resume_text": resume_text})
            
            # Convert Pydantic object to dict for downstream use
            structured_data = parsed_resume.model_dump()
            
            print("[bold green]Successfully parsed resume text to JSON.[/bold green]")
            return structured_data
            
        except Exception as e:
            print(f"[bold red]Error parsing resume text:[/bold red] {e}")
            raise 