import json
import os
from pathlib import Path
from typing import Dict, Any

from rich import print
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from dotenv import load_dotenv

from backend.latex_resume_generator.schemas.resume_schema import ResumeSchema


class ResumeParser:
    def __init__(self, api_key: str):
        # Initialize the model
        model = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            temperature=0.7,
            google_api_key=api_key,
        )
        
        # Set up a Pydantic parser
        self.parser = PydanticOutputParser(pydantic_object=ResumeSchema)

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


if __name__ == "__main__":
    # Load environment variables from .env file
    dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
    load_dotenv(dotenv_path=dotenv_path)
    API_KEY = os.getenv("API_KEY")

    if not API_KEY:
        raise ValueError("API_KEY not found in environment variables.")

    # Example usage
    resume_parser = ResumeParser(api_key=API_KEY)

    # You can replace this with actual resume text
    sample_resume_text = """
    John Doe
    Software Engineer
    ...
    """

    parsed_resume = resume_parser.parse(sample_resume_text)
    print(parsed_resume)
    print(type(parsed_resume))

    # Save the parsed resume to a JSON file
    output_path = os.path.join(
        os.path.dirname(__file__), "..", "output", "resume_structured.json"
    )
    with open(output_path, "w") as f:
        json.dump(parsed_resume, f, indent=4)

    print(f"Parsed resume saved to {output_path}") 