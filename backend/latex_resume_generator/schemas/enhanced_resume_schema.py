from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class PersonalInfo(BaseModel):
    name: str = Field(..., description="Full name")
    email: str = Field(..., description="Email address")
    phone: str = Field(..., description="Phone number")
    location: Optional[str] = Field(None, description="City and state, e.g., San Francisco, CA")
    linkedin_url: Optional[str] = Field(None, description="URL of LinkedIn profile")
    github_url: Optional[str] = Field(None, description="URL of GitHub profile")
    twitter_url: Optional[str] = Field(None, description="URL of Twitter profile")
    website_url: Optional[str] = Field(None, description="Personal website or portfolio URL")
    other_links: Optional[Dict[str, str]] = Field(None, description="Other relevant links")

class Experience(BaseModel):
    company: str = Field(..., description="Company name")
    position: str = Field(..., description="Job title")
    location: Optional[str] = Field(None, description="Job location")
    start_date: str = Field(..., description="Start date of employment")
    end_date: str = Field(..., description="End date of employment (or 'Present')")
    responsibilities: List[str] = Field(..., description="List of key responsibilities and accomplishments")
    technologies_used: Optional[List[str]] = Field(None, description="Technologies used in this role")
    key_achievements: Optional[List[str]] = Field(None, description="Quantifiable achievements")

class EnhancedProject(BaseModel):
    name: str = Field(..., description="Name of the project")
    context: Optional[str] = Field(None, description="Context (e.g., 'Research Project', 'Open Source Contribution')")
    brief_description: str = Field(..., description="One-line description of what the project does")
    detailed_points: List[str] = Field(..., description="Detailed bullet points about implementation, challenges, and impact")
    technologies: List[str] = Field(..., description="List of technologies used in the project")
    outcomes: Optional[List[str]] = Field(None, description="Measurable outcomes or impacts")
    links: Optional[Dict[str, str]] = Field(None, description="Links to demo, repository, paper, etc.")

class Education(BaseModel):
    institution: str = Field(..., description="Name of the university or institution")
    degree: str = Field(..., description="Degree obtained")
    location: Optional[str] = Field(None, description="Institution location")
    start_date: str = Field(..., description="Start date of education")
    end_date: str = Field(..., description="End date of education or graduation date")
    gpa: Optional[str] = Field(None, description="GPA if notable")
    relevant_coursework: Optional[List[str]] = Field(None, description="Relevant courses")
    achievements: Optional[List[str]] = Field(None, description="Academic achievements, honors")

class DynamicSkillCategory(BaseModel):
    category_name: str = Field(..., description="Name of the skill category")
    skills: List[str] = Field(..., description="List of skills in this category")
    proficiency_levels: Optional[Dict[str, str]] = Field(None, description="Optional proficiency levels for skills")

class Publication(BaseModel):
    title: str = Field(..., description="Publication title")
    venue: str = Field(..., description="Conference, journal, or platform")
    date: str = Field(..., description="Publication date")
    authors: Optional[List[str]] = Field(None, description="List of authors")
    link: Optional[str] = Field(None, description="Link to publication")

class Certification(BaseModel):
    name: str = Field(..., description="Certification name")
    issuer: str = Field(..., description="Issuing organization")
    date: str = Field(..., description="Date obtained")
    expiry: Optional[str] = Field(None, description="Expiry date if applicable")
    credential_id: Optional[str] = Field(None, description="Credential ID or link")

class EnhancedResumeSchema(BaseModel):
    personal_info: PersonalInfo = Field(..., alias='personal_info')
    summary: str = Field(..., description="Professional summary - will be enhanced by AI")
    experience: List[Experience] = Field(..., description="List of professional experiences")
    projects: List[EnhancedProject] = Field(..., description="List of projects with enhanced details")
    education: List[Education] = Field(..., description="List of educational qualifications")
    skills: List[DynamicSkillCategory] = Field(..., description="Skills organized by dynamic categories")
    publications: Optional[List[Publication]] = Field(None, description="Academic or technical publications")
    certifications: Optional[List[Certification]] = Field(None, description="Professional certifications")
    additional_sections: Optional[Dict[str, Any]] = Field(None, description="Any additional custom sections")
    
    class Config:
        extra = "allow"  # Allow additional fields for flexibility 