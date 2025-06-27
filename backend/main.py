from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from resume.latex_resume_generator.schemas.resume_schema import Resume
from resume.latex_resume_generator.main import ResumeGenerator

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/generate-resume/")
async def generate_resume(resume_data: Resume):
    generator = ResumeGenerator()
    # The ResumeGenerator expects text, but we have structured data.
    # We will need to adapt the generator, but for now, we'll serialize the data.
    latex_content, _, _, _ = generator.process_resume(resume_data.model_dump_json(), "output")
    return {"latex_content": latex_content} 