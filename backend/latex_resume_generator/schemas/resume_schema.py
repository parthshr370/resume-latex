from pydantic import BaseModel, Field
from typing import List, Optional

class PersonalInfo(BaseModel):
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    location: str = Field(..., description="City and state, e.g., San Francisco, CA")
    linkedin_url: Optional[str] = Field(None, description="URL of LinkedIn profile")
    github_url: Optional[str] = Field(None, description="URL of GitHub profile")

class Experience(BaseModel):
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Job title")
    start_date: str = Field(..., description="Start date of employment")
    end_date: str = Field(..., description="End date of employment (or 'Present')")
    responsibilities: List[str] = Field(..., description="List of key responsibilities and accomplishments")

class Project(BaseModel):
    name: str = Field(..., description="Name of the project")
    description: str = Field(..., description="Brief description of the project")
    technologies: List[str] = Field(..., description="List of technologies used in the project")

class Education(BaseModel):
    institution: str = Field(..., description="Name of the university or institution")
    degree: str = Field(..., description="Degree obtained")
    start_date: str = Field(..., description="Start date of education")
    end_date: str = Field(..., description="End date of education or graduation date")

class Skills(BaseModel):
    technical: List[str] = Field(..., description="List of technical skills")
    soft: List[str] = Field(..., description="List of soft skills")

class ResumeSchema(BaseModel):
    personal_info: PersonalInfo = Field(..., alias='personal_info')
    summary: str = Field(..., description="Brief professional summary")
    experience: List[Experience] = Field(..., description="List of professional experiences")
    projects: List[Project] = Field(..., description="List of projects")
    education: List[Education] = Field(..., description="List of educational qualifications")
    skills: Skills = Field(..., description="Technical and soft skills") 