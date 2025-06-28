import os
from dotenv import load_dotenv
from .agents.latex_generator import LaTeXGenerator
from .schemas.resume_schema import ResumeSchema

class ResumeGenerator:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        self.api_key = os.getenv("API_KEY")
        if not self.api_key:
            raise ValueError("API_KEY not found in environment variables.")

    def process_resume(self, resume_data: ResumeSchema, output_dir: str = "backend/latex_resume_generator/output") -> tuple[str, str, str, str]:
        """
        Processes resume data to generate a LaTeX file and structured JSON.

        Args:
            resume_data: A Resume object containing the structured resume data.
            output_dir: The directory to save the output files.

        Returns:
            A tuple containing the paths to the structured JSON file, the generated LaTeX file,
            the LaTeX content, and the structured JSON content.
        """
        # Ensure the output directory exists
        os.makedirs(output_dir, exist_ok=True)

        # Generate LaTeX from structured data
        latex_generator = LaTeXGenerator(api_key=self.api_key)
        latex_content = latex_generator.generate(resume_data.model_dump())

        # Define output file paths
        structured_json_path = os.path.join(output_dir, "resume_structured.json")
        latex_output_path = os.path.join(output_dir, "resume.tex")

        # Save the structured data to a JSON file
        with open(structured_json_path, "w") as f:
            f.write(resume_data.model_dump_json(indent=4))

        # Save the generated LaTeX content
        with open(latex_output_path, "w") as f:
            f.write(latex_content)

        return structured_json_path, latex_output_path, latex_content, resume_data.model_dump_json()

def main():
    # Example usage with a Resume object
    resume_data = ResumeSchema(
        personal_info={
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "123-456-7890",
            "location": "San Francisco, CA",
            "linkedin_url": "linkedin.com/in/johndoe",
            "github_url": "github.com/johndoe"
        },
        summary="A summary about John Doe.",
        education=[
            {
                "institution": "University of California",
                "degree": "MS in Computer Science",
                "start_date": "2020",
                "end_date": "2024",
            }
        ],
        experience=[
            {
                "company": "Tech Corp",
                "position": "Software Engineer",
                "start_date": "2022",
                "end_date": "Present",
                "responsibilities": ["Did something cool", "Did another cool thing"],
            }
        ],
        projects=[],
        skills={
            "technical": ["Python", "JavaScript"],
            "soft": ["Communication", "Leadership"]
        }
    )
    generator = ResumeGenerator()
    generator.process_resume(resume_data, output_dir="backend/latex_resume_generator/output")

if __name__ == "__main__":
    main() 