from pydantic import BaseModel
from typing import List, Optional

class Contact(BaseModel):
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None

class Education(BaseModel):
    institution: str
    location: Optional[str] = None
    degree: str
    graduation_date: str
    gpa: Optional[str] = None
    achievements: Optional[List[str]] = None
class Contact(BaseModel):
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None

class Education(BaseModel):
    institution: str
    location: Optional[str] = None
    degree: str
    graduation_date: str
    gpa: Optional[str] = None
    achievements: Optional[List[str]] = None

class Experience(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    start_date: str
    end_date: str
    achievements: List[str]
    technologies: Optional[List[str]] = None

class Project(BaseModel):
    name: str
    context: Optional[str] = None
    description: str
    achievements: List[str]
    technologies: List[str]

class Skill(BaseModel):
    category: str
    items: List[str]

class Resume(BaseModel):
    name: str
    contact: Contact
    summary: Optional[str] = None
    education: List[Education]
    experience: List[Experience]
    projects: Optional[List[Project]] = None
    skills: List[Skill] 
    location: Optional[str] = None
    start_date: str
    end_date: str
    achievements: List[str]
    technologies: Optional[List[str]] = None

class Project(BaseModel):
    name: str
    context: Optional[str] = None
    description: str
    achievements: List[str]
    technologies: List[str]

class Skill(BaseModel):
    category: str
    items: List[str]

class Resume(BaseModel):
    name: str
    contact: Contact
    summary: Optional[str] = None
    education: List[Education]
    experience: List[Experience]
    projects: Optional[List[Project]] = None
    skills: List[Skill] 