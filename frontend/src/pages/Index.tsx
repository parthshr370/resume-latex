import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2, Download, User, Briefcase, GraduationCap, Star, Code, X, FileText, Upload, Edit3, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { PersonalInfo, Experience, Project, Education, Skills, ResumeSchema } from './types';
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlueprintSection } from "@/components/ui/blueprint-section";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { popularSkills } from "@/lib/skills";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from "framer-motion";
import { LatexLogotype } from "@/components/latex-logotype";

const initialData = {
    personalInfo: {
        name: 'Johnathan Doe',
        email: 'john.doe@email.com',
        phone: '123-456-7890',
        location: 'San Francisco, CA',
        linkedin_url: 'https://linkedin.com/in/johndoe',
        github_url: 'https://github.com/johndoe'
    },
    summary: 'A passionate full-stack developer with 5+ years of experience in building scalable web applications using React and Node.js. Skilled in creating robust APIs and beautiful, user-friendly interfaces.',
    experience: [
        {
            company: 'Tech Solutions Inc.',
            position: 'Senior Software Engineer',
            start_date: 'Jan 2020',
            end_date: 'Present',
            responsibilities: [
                'Led a team of 5 developers in creating a new e-commerce platform.',
                'Designed and implemented RESTful APIs for the customer management module.',
                'Improved application performance by 30% by optimizing database queries.'
            ]
        },
    ],
    projects: [
        {
            name: 'Portfolio Website',
            description: 'A personal portfolio website to showcase my projects and skills.',
            technologies: ['React', 'TypeScript', 'TailwindCSS']
        },
    ],
    education: [
        {
            institution: 'University of California, Berkeley',
            degree: 'B.S. in Computer Science',
            start_date: '2013',
            end_date: '2017'
        }
    ],
    skills: {
        technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'SQL', 'Docker'],
        soft: ['Team Leadership', 'Problem Solving', 'Communication', 'Agile Methodologies']
    }
};

const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'skills', label: 'Skills', icon: Star },
];

const ListItemWrapper = ({ children, onRemove }: { children: React.ReactNode, onRemove: () => void }) => (
    <div className="relative p-4 bg-background border border-border rounded-lg space-y-3">
        {children}
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
        </Button>
    </div>
);

enum Stage {
    Choice,
    Form,
    Markdown,
    Result
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    in: {
        opacity: 1,
        y: 0,
    },
    out: {
        opacity: 0,
        y: -20,
    },
}

const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
}

export default function IndexPage() {
    const [stage, setStage] = useState<Stage>(Stage.Form);
    const [activeTab, setActiveTab] = useState('pdf');
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialData.personalInfo);
    const [summary, setSummary] = useState<string>(initialData.summary);
    const [experience, setExperience] = useState<Experience[]>(initialData.experience);
    const [projects, setProjects] = useState<Project[]>(initialData.projects);
    const [education, setEducation] = useState<Education[]>(initialData.education);
    const [skills, setSkills] = useState<Skills>(initialData.skills);
    const [isLoading, setIsLoading] = useState(false);
    const [markdownContent, setMarkdownContent] = useState<string>("");
    const [finalResults, setFinalResults] = useState<{ latex_str: string, pdf_b64: string } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [formSection, setFormSection] = useState<string>('personal');
    const [customSkill, setCustomSkill] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [enhancementMode, setEnhancementMode] = useState<boolean>(true);
    const [enhancedData, setEnhancedData] = useState<any>(null);

    const handleListChange = <T,>(list: T[], setList: (list: T[]) => void, index: number, field: keyof T, value: any) => {
        const newList = [...list];
        newList[index][field] = value;
        setList(newList);
    };

    const addListItem = <T,>(list: T[], setList: (list: T[]) => void, newItem: T) => {
        setList([...list, newItem]);
    };

    const removeListItem = <T,>(list: T[], setList: (list: T[]) => void, index: number) => {
        setList(list.filter((_, i) => i !== index));
    };

    const handleAddSkill = (skill: string) => {
        if (skill && !skills.technical.includes(skill)) {
            setSkills({ ...skills, technical: [...skills.technical, skill] });
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills({ ...skills, technical: skills.technical.filter(skill => skill !== skillToRemove) });
    };

    const handleAddCustomSkill = () => {
        if (customSkill) {
            handleAddSkill(customSkill);
            setCustomSkill("");
        }
    };

    const handleGenerateMarkdown = async () => {
        setIsLoading(true);
        setError(null);
        const resumeData: ResumeSchema = { personal_info: personalInfo, summary, experience, projects, skills, education };

        try {
            if (enhancementMode) {
                // Use enhanced API
                const formData = new FormData();
                formData.append('resume_data_json', JSON.stringify(resumeData));
                formData.append('enhance', 'true');
                
                const response = await fetch('http://localhost:8000/api/parse-and-enhance', { 
                    method: 'POST', 
                    body: formData 
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'An unknown error occurred');
                }
                
                const data = await response.json();
                setEnhancedData(JSON.parse(data.enhanced_json));
                setMarkdownContent(data.markdown_str);
            } else {
                // Use basic API
                const formData = new FormData();
                formData.append('resume_data_json', JSON.stringify(resumeData));

                const response = await fetch('http://localhost:8000/api/generate-markdown', { 
                    method: 'POST', 
                    body: formData 
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'An unknown error occurred');
                }
                
                const data = await response.json();
                setMarkdownContent(data.markdown_str);
            }
            
            setStage(Stage.Markdown);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateLatex = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (enhancementMode && enhancedData) {
                // Use enhanced LaTeX generation
                const formData = new FormData();
                formData.append('markdown_str', markdownContent);
                formData.append('enhanced_data_json', JSON.stringify(enhancedData));
                
                const response = await fetch('http://localhost:8000/api/generate-enhanced-latex', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'An unknown error occurred');
                }
                
                const data = await response.json();
                setFinalResults(data);
            } else {
                // Use basic LaTeX generation
                const response = await fetch('http://localhost:8000/api/generate-latex', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ markdown_str: markdownContent })
                });
                
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'An unknown error occurred');
                }
                
                const data = await response.json();
                setFinalResults(data);
            }
            
            setStage(Stage.Result);
            setActiveTab('pdf'); 
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = (content: string, fileName: string, contentType: string, isBase64 = false) => {
        const blob = isBase64 
            ? new Blob([Uint8Array.from(atob(content), c => c.charCodeAt(0))], { type: contentType })
            : new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setFinalResults({ latex_str: '', pdf_b64: base64 });
                setStage(Stage.Result);
                setActiveTab('pdf');
                setFileName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderHeader = (title: string, description: string) => (
        <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">{title}</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>
    );

    const renderChoiceScreen = () => (
        <motion.section
            key="choice"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            id="template-selected"
            className="py-16 sm:py-24"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {renderHeader("How would you like to start?", "Choose your preferred method to create your resume.")}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {[
                        {
                            icon: <Edit3 className="h-12 w-12 text-foreground" />,
                            title: "Fill Out Form",
                            description: "Start from scratch with our guided form.",
                            buttonText: "Start with Form",
                            action: () => setStage(Stage.Form),
                            primary: true,
                        },
                        {
                            icon: <Upload className="h-12 w-12 text-foreground" />,
                            title: "Upload Existing PDF",
                            description: "Upload your PDF, we'll extract and convert.",
                            buttonText: "Upload PDF",
                            action: () => document.getElementById("pdf-upload")?.click(),
                            primary: false,
                        },
                    ].map((choice, idx) => (
                        <Card
                            key={idx}
                            className="bg-card border-2 border-foreground rounded-xl p-8 shadow-neo-white-md hover:shadow-neo-white-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] flex flex-col"
                        >
                            <div className="text-center mb-6">
                                <div className="inline-block p-3 bg-secondary rounded-full mb-4 border-2 border-foreground shadow-neo-white-sm">
                                    {choice.icon}
                                </div>
                                <CardTitle className="text-2xl font-bold text-foreground mb-2">{choice.title}</CardTitle>
                                <CardDescription className="text-muted-foreground">{choice.description}</CardDescription>
                            </div>
                            <div className="flex-grow" />
                            <Button
                                size="lg"
                                onClick={choice.action}
                                disabled={isLoading}
                                className={`w-full font-bold py-3 px-6 rounded-lg border-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] relative overflow-hidden group ${
                                    choice.primary
                                        ? "bg-primary text-primary-foreground border-primary-foreground shadow-neo-black-sm hover:shadow-neo-black-md"
                                        : "bg-transparent text-foreground border-foreground shadow-neo-white-sm hover:bg-secondary hover:shadow-neo-white-md"
                                }`}
                            >
                                <div
                                    className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
                                        choice.primary ? "bg-white/20" : "bg-white/10"
                                    }`}
                                ></div>
                                <span className="relative z-10 flex items-center justify-center">
                                    {isLoading && !choice.primary ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        choice.buttonText
                                    )}
                                </span>
                            </Button>
                        </Card>
                    ))}
                </div>
                <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                {fileName && <p className="text-center mt-4 text-muted-foreground">Uploaded: {fileName}</p>}
                {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
            </div>
        </motion.section>
    );

    const renderForm = () => (
        <motion.section
            key="form"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            id="form-builder"
            className="py-16 sm:py-24"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {renderHeader("Build Your Resume", "Fill out the sections below. Your data is saved as you type.")}
                
                                    {/* Enhancement Mode Toggle */}
                    <Card className="bg-card border-2 border-foreground rounded-xl shadow-neo-white-md mb-8">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                                        {enhancementMode ? (
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        ) : (
                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-foreground">
                                            {enhancementMode ? "AI Enhancement Mode" : "Basic Mode"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground max-w-md">
                                            {enhancementMode 
                                                ? "AI will intelligently expand your content and organize it professionally"
                                                : "Generate resume with your content as-is"
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={cn("text-sm font-medium", !enhancementMode ? "text-foreground" : "text-muted-foreground")}>
                                        Basic
                                    </span>
                                    <Switch
                                        checked={enhancementMode}
                                        onCheckedChange={setEnhancementMode}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                    <span className={cn("text-sm font-medium", enhancementMode ? "text-foreground" : "text-muted-foreground")}>
                                        AI Enhanced
                                    </span>
                                </div>
                            </div>
                            {enhancementMode && (
                                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                    <div className="flex items-start space-x-3">
                                        <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-primary">
                                            <strong className="text-base">AI Enhancement includes:</strong>
                                            <ul className="mt-2 space-y-2 text-sm">
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Expands project descriptions with technical details and quantifiable outcomes</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Organizes skills into intelligent categories (AI/ML, Cloud, etc.)</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Enhances experience descriptions with professional language and metrics</span>
                                                </li>
                                                <li className="flex items-start space-x-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>Generates polished summaries tailored to your background</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                
                <Card className="bg-card border-2 border-foreground rounded-xl shadow-neo-white-md p-6">
                    <Tabs value={formSection} onValueChange={setFormSection} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6">
                            {sections.map((section) => (
                                <TabsTrigger key={section.id} value={section.id}>
                                    <section.icon className="mr-2 h-4 w-4" />
                                    {section.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value="personal">
                            <BlueprintSection title="Personal Information" description="Provide your basic contact and profile information.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} /></div>
                                    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" value={personalInfo.email} onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })} /></div>
                                    <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} /></div>
                                    <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" value={personalInfo.location} onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })} /></div>
                                    <div className="space-y-2"><Label htmlFor="linkedin_url">LinkedIn URL</Label><Input id="linkedin_url" value={personalInfo.linkedin_url} onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin_url: e.target.value })} /></div>
                                    <div className="space-y-2"><Label htmlFor="github_url">GitHub URL</Label><Input id="github_url" value={personalInfo.github_url} onChange={(e) => setPersonalInfo({ ...personalInfo, github_url: e.target.value })} /></div>
                                    <div className="space-y-2 md:col-span-2"><Label htmlFor="summary">Professional Summary</Label><Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} /></div>
                                </div>
                            </BlueprintSection>
                        </TabsContent>

                        <TabsContent value="experience">
                            <BlueprintSection title="Work Experience" description="Detail your professional history. Add your most recent experience first.">
                                <div className="space-y-4">
                                    {experience.map((exp, index) => (
                                        <ListItemWrapper key={index} onRemove={() => removeListItem(experience, setExperience, index)}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="position">Position</Label>
                                                    <Input id="position" placeholder="Position" value={exp.position} onChange={(e) => handleListChange(experience, setExperience, index, 'position', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="company">Company</Label>
                                                    <Input id="company" placeholder="Company" value={exp.company} onChange={(e) => handleListChange(experience, setExperience, index, 'company', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="start_date">Start Date</Label>
                                                    <Input id="start_date" placeholder="Start Date" value={exp.start_date} onChange={(e) => handleListChange(experience, setExperience, index, 'start_date', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="end_date">End Date</Label>
                                                    <Input id="end_date" placeholder="End Date" value={exp.end_date} onChange={(e) => handleListChange(experience, setExperience, index, 'end_date', e.target.value)} />
                                                </div>
                                            </div>
                                            <Textarea placeholder="Responsibilities (one per line)" value={exp.responsibilities.join('\n')} onChange={(e) => handleListChange(experience, setExperience, index, 'responsibilities', e.target.value.split('\n'))} />
                                        </ListItemWrapper>
                                    ))}
                                    <Button variant="outline" onClick={() => addListItem(experience, setExperience, { company: '', position: '', start_date: '', end_date: '', responsibilities: [] })} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                                </div>
                            </BlueprintSection>
                        </TabsContent>

                        <TabsContent value="education">
                            <BlueprintSection title="Education" description="Add your academic qualifications.">
                                <div className="space-y-4">
                                    {education.map((edu, index) => (
                                        <ListItemWrapper key={index} onRemove={() => removeListItem(education, setEducation, index)}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="degree">Degree</Label>
                                                    <Input id="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleListChange(education, setEducation, index, 'degree', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="institution">Institution</Label>
                                                    <Input id="institution" placeholder="Institution" value={edu.institution} onChange={(e) => handleListChange(education, setEducation, index, 'institution', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="start_date">Start Date</Label>
                                                    <Input id="start_date" placeholder="Start Date" value={edu.start_date} onChange={(e) => handleListChange(education, setEducation, index, 'start_date', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="end_date">End Date</Label>
                                                    <Input id="end_date" placeholder="End Date" value={edu.end_date} onChange={(e) => handleListChange(education, setEducation, index, 'end_date', e.target.value)} />
                                                </div>
                                            </div>
                                        </ListItemWrapper>
                                    ))}
                                    <Button variant="outline" onClick={() => addListItem(education, setEducation, { institution: '', degree: '', start_date: '', end_date: '' })} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                                </div>
                            </BlueprintSection>
                        </TabsContent>

                        <TabsContent value="projects">
                            <BlueprintSection title="Projects" description="Showcase your notable projects.">
                                <div className="space-y-4">
                                    {projects.map((proj, index) => (
                                        <ListItemWrapper key={index} onRemove={() => removeListItem(projects, setProjects, index)}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Project Name</Label>
                                                    <Input id="name" placeholder="Project Name" value={proj.name} onChange={(e) => handleListChange(projects, setProjects, index, 'name', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="description">Description</Label>
                                                    <Textarea id="description" placeholder="Description" value={proj.description} onChange={(e) => handleListChange(projects, setProjects, index, 'description', e.target.value)} />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <Label htmlFor="technologies">Technologies</Label>
                                                    <Textarea id="technologies" placeholder="Technologies (comma separated)" value={proj.technologies.join(', ')} onChange={(e) => handleListChange(projects, setProjects, index, 'technologies', e.target.value.split(/,\\s*/))} />
                                                </div>
                                            </div>
                                        </ListItemWrapper>
                                    ))}
                                    <Button variant="outline" onClick={() => addListItem(projects, setProjects, { name: '', description: '', technologies: [] })} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
                                </div>
                            </BlueprintSection>
                        </TabsContent>

                        <TabsContent value="skills">
                            <BlueprintSection title="Skills" description="List your technical and soft skills.">
                                <div className="space-y-8">
                                    <div>
                                        <Label className="text-lg font-medium">Technical Skills</Label>
                                        <p className="text-sm text-muted-foreground">Your selected skills will appear here. Click a skill to remove it.</p>
                                        <div className="flex flex-wrap gap-2 my-4 p-4 border rounded-lg min-h-[48px]">
                                            {skills.technical.length > 0 ? (
                                                skills.technical.map(skill => (
                                                    <Badge key={skill} variant="secondary" className="text-sm cursor-pointer" onClick={() => handleRemoveSkill(skill)}>
                                                        {skill}
                                                        <X className="ml-2 h-3 w-3" />
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-sm text-muted-foreground">Select popular skills or add your own.</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Add a custom skill"
                                                value={customSkill}
                                                onChange={(e) => setCustomSkill(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                                            />
                                            <Button onClick={handleAddCustomSkill}>Add Skill</Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-lg font-medium">Popular Skills</Label>
                                         <div className="space-y-4 mt-2">
                                            {Object.entries(popularSkills).map(([category, skillList]) => (
                                                <div key={category}>
                                                    <h4 className="font-semibold text-base text-muted-foreground mb-2">{category}</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {skillList.map(skill => (
                                                            <Badge
                                                                key={skill}
                                                                onClick={() => handleAddSkill(skill)}
                                                                className="cursor-pointer hover:bg-primary/80 transition-colors"
                                                                variant={skills.technical.includes(skill) ? "default" : "outline"}
                                                            >
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label htmlFor="soft-skills" className="text-lg font-medium">Soft Skills</Label>
                                        <p className="text-sm text-muted-foreground mt-1">Enter skills separated by commas.</p>
                                        <Textarea 
                                            id="soft-skills" 
                                            value={skills.soft.join(', ')} 
                                            onChange={(e) => setSkills({ ...skills, soft: e.target.value.split(/,\s*/) })} 
                                            rows={3} 
                                            placeholder="Leadership, Communication..."
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </BlueprintSection>
                        </TabsContent>
                    </Tabs>
                    
                    <div className="flex justify-between items-center mt-8">
                        <Button variant="outline" onClick={() => setStage(Stage.Choice)}>
                            Back to Start
                        </Button>
                        <Button 
                            onClick={handleGenerateMarkdown} 
                            disabled={isLoading}
                            className="bg-white text-black hover:bg-gray-200 border-2 border-black shadow-neo-black-sm hover:shadow-neo-black-md font-bold transition-all hover:translate-x-[-1px] hover:translate-y-[-1px]"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    {enhancementMode ? "Generate Enhanced Resume" : "Generate Resume"}
                                </>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </motion.section>
    );

    const renderMarkdownEditor = () => (
        <motion.section
            key="markdown"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            id="markdown-editor"
            className="py-8 sm:py-12"
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {renderHeader("Review Your Resume", "Fine-tune the Markdown content. The right panel shows a live preview.")}
                <Card className="bg-card border-2 border-foreground rounded-xl shadow-neo-white-md p-2">
                    <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] rounded-lg">
                        <ResizablePanel defaultSize={50}>
                            <Textarea
                                value={markdownContent}
                                onChange={e => setMarkdownContent(e.target.value)}
                                className="h-full w-full resize-none border-0 rounded-none bg-background font-mono text-sm p-4 focus-visible:ring-0"
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50}>
                            <div className="p-4 h-full overflow-y-auto bg-background rounded-r-lg">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown>
                                </div>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </Card>
                <div className="flex justify-between items-center mt-8">
                    <Button variant="outline" onClick={() => setStage(Stage.Form)}>
                        Back to Form
                    </Button>
                    <Button 
                        onClick={handleGenerateLatex} 
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground border-2 border-primary-foreground shadow-neo-black-sm hover:shadow-neo-black-md"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                Generate <LatexLogotype className="ml-2" /> <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </motion.section>
    );

    const renderResultContent = () => {
        if (!finalResults) return null;

        return (
            <motion.section
                key="result"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                id="results"
                className="py-8 sm:py-12"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {renderHeader("Your Resume is Ready!", "Preview your generated PDF or view the LaTeX code.")}
                    <Card className="bg-card border-2 border-foreground rounded-xl shadow-neo-white-md p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList>
                                    <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
                                    <TabsTrigger value="latex">
                                        <LatexLogotype /> Code
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="pdf">
                                <Card className="bg-card border-border aspect-[8.5/11]">
                                    <CardContent className="p-2 h-full">
                                        <object
                                            data={`data:application/pdf;base64,${finalResults.pdf_b64}`}
                                            type="application/pdf"
                                            className="w-full h-full border rounded-md"
                                        >
                                            <p>
                                                Your browser does not support PDF previews. You can{" "}
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleDownload(finalResults.pdf_b64, "resume.pdf", "application/pdf", true)}
                                                >
                                                    download the PDF
                                                </Button>{" "}
                                                instead.
                                            </p>
                                        </object>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="latex">
                                <Card>
                                    <CardContent className="p-2 relative">
                                        <Textarea
                                            value={finalResults.latex_str}
                                            rows={30}
                                            readOnly
                                            className="bg-input border-border font-mono text-xs"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-4 right-4"
                                            onClick={() => handleDownload(finalResults.latex_str, "resume.tex", "application/x-tex")}
                                        >
                                            <Download className="mr-2 h-4 w-4" /> .tex
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </Card>
                    <div className="flex justify-between items-center mt-8">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setStage(Stage.Form)
                                setFinalResults(null)
                            }}
                        >
                            Back to Form
                        </Button>
                        <Button
                            onClick={() => handleDownload(finalResults.pdf_b64, "resume.pdf", "application/pdf", true)}
                            className="bg-primary text-primary-foreground border-2 border-primary-foreground shadow-neo-black-sm hover:shadow-neo-black-md"
                        >
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                    </div>
                    {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
                </div>
            </motion.section>
        );
    };

    const renderContent = () => {
        switch (stage) {
            case Stage.Choice:
                return renderChoiceScreen()
            case Stage.Form:
                return renderForm()
            case Stage.Markdown:
                return renderMarkdownEditor()
            case Stage.Result:
                return renderResultContent()
            default:
                return renderChoiceScreen()
        }
    }

    return (
        <div className="min-h-screen bg-black text-foreground font-sans">
            <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
                <div className="bg-black/60 backdrop-blur-md rounded-full px-6 py-3 shadow-lg">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center space-x-2.5 group">
                            <FileText className="h-6 w-6 text-foreground group-hover:text-muted-foreground transition-colors" />
                            <h1 className="text-lg font-black text-foreground group-hover:text-muted-foreground transition-colors">
                                <LatexLogotype /> Resume Builder
                            </h1>
                        </a>
                        <div className="flex items-center space-x-2">
                            <span
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                    stage === Stage.Choice ? "border-primary text-primary" : "border-border"
                                }`}
                            >
                                Start
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                    stage === Stage.Form ? "border-primary text-primary" : "border-border"
                                }`}
                            >
                                Edit
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                    stage === Stage.Markdown ? "border-primary text-primary" : "border-border"
                                }`}
                            >
                                Review
                            </span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <span
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                    stage === Stage.Result ? "border-primary text-primary" : "border-border"
                                }`}
                            >
                                Finish
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-20">{renderContent()}</main>

            <footer className="border-t-2 border-border py-12 bg-neutral-950">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2.5 mb-6 md:mb-0">
                            <FileText className="h-7 w-7 text-foreground" />
                            <span className="text-xl font-black text-foreground">
                                <LatexLogotype /> Resume Builder
                            </span>
                        </div>
                        <div className="text-center text-muted-foreground mt-10 md:mt-0 text-sm">
                            &copy; {new Date().getFullYear()} <LatexLogotype /> Resume Builder. All rights reserved.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
