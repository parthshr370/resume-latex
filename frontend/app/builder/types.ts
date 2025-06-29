export interface PersonalInfo {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin_url: string;
    github_url: string;
}

export interface Experience {
    company: string;
    position: string;
    start_date: string;
    end_date: string;
    responsibilities: string[];
}

export interface Project {
    name: string;
    description: string;
    technologies: string[];
}

export interface Education {
    institution: string;
    degree: string;
    start_date: string;
    end_date: string;
}

export interface Skills {
    technical: string[];
    soft: string[];
}

export interface ResumeSchema {
    personal_info: PersonalInfo;
    summary: string;
    experience: Experience[];
    projects: Project[];
    skills: Skills;
    education: Education[];
} 