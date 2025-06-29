"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2, Download, User, Briefcase, GraduationCap, Star, Code, X, FileText, Upload, Edit3, ArrowRight, Sparkles, Zap, ArrowLeft } from 'lucide-react';
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
import { useSearchParams } from 'next/navigation';
import { PDFViewerSimple } from "@/components/pdf-viewer-simple";

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
    <div className="relative p-4 bg-background border-2 border-foreground shadow-sm space-y-3">
        {children}
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
        </Button>
    </div>
);

const StyledIcon = ({ icon: Icon, className }: { icon: React.ElementType, className?: string }) => (
    <div className={cn("bg-primary/10 p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-4 border-2 border-primary/20", className)}>
        <Icon className="h-8 w-8 text-primary" />
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
    const [stage, setStage] = useState<Stage>(Stage.Choice);
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
    const [selectedTemplate, setSelectedTemplate] = useState<string>("jakes_resume");
    const searchParams = useSearchParams();

    useEffect(() => {
        const template = searchParams.get('template');
        if (template) {
            setSelectedTemplate(template);
        }
    }, [searchParams]);

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
            // Always use the /api/parse-and-enhance endpoint
                const formData = new FormData();
                formData.append('resume_data_json', JSON.stringify(resumeData));
            formData.append('enhance', enhancementMode.toString());
                
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
                const formData = new FormData();
                formData.append('markdown_str', markdownContent);
                formData.append('enhanced_data_json', JSON.stringify(enhancedData || {}));
                formData.append('template_name', selectedTemplate);

                const response = await fetch('http://localhost:8000/api/generate-enhanced-latex', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const err = await response.json();
                throw new Error(err.detail?.message || err.detail || 'An unknown error occurred during LaTeX generation');
                }

                const data = await response.json();
                setFinalResults(data);
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

    const handleDownloadMarkdown = () => {
        handleDownload(markdownContent, "resume.md", "text/markdown");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
                setFileName(file.name);
            setIsLoading(true);
            setError(null);
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('enhance', enhancementMode.toString());
                
                const parseResponse = await fetch('http://localhost:8000/api/parse-and-enhance', {
                    method: 'POST',
                    body: formData
                });
                
                if (!parseResponse.ok) {
                    const err = await parseResponse.json();
                    throw new Error(err.detail || 'Failed to parse PDF');
                }
                
                const parseResult = await parseResponse.json();
                setEnhancedData(JSON.parse(parseResult.enhanced_json));
                setMarkdownContent(parseResult.markdown_str);
                setStage(Stage.Markdown);
            } catch (err: any) {
                setError(err.message);
                console.error('PDF processing error:', err);
            } finally {
                setIsLoading(false);
            }
        } else {
            setError('Please upload a valid PDF file');
        }
    };

    const renderHeader = (title: string, description: string) => (
        <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">{title}</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
        </div>
    );

    const renderChoiceScreen = () => (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {isLoading ? (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={pageTransition}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h3 className="text-2xl font-semibold">Processing your request...</h3>
                    <p className="text-muted-foreground">The AI is working its magic. This may take a moment.</p>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={pageTransition}
                >
                    {renderHeader("Create Your LaTeX Resume", "Start from scratch or upload an existing PDF.")}
                    <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mt-12 w-full max-w-5xl mx-auto">
                        <BlueprintSection
                            title="Start From Scratch"
                            description="Use our guided form to build your resume step-by-step."
                            onClick={() => setStage(Stage.Form)}
                            className="flex-1 text-left hover:border-primary/80 hover:bg-muted transition-all cursor-pointer"
                        >
                            <StyledIcon icon={Edit3} />
                        </BlueprintSection>

                        <div className="flex items-center justify-center">
                            <div className="h-full w-px bg-border hidden md:block" />
                            <div className="w-full h-px bg-border block md:hidden" />
                            <span className="mx-4 font-semibold text-muted-foreground">OR</span>
                            <div className="h-full w-px bg-border hidden md:block" />
                            <div className="w-full h-px bg-border block md:hidden" />
                        </div>

                        <BlueprintSection
                            title="Upload PDF"
                            description="Let our AI parse your existing PDF resume to get started."
                            onClick={() => document.getElementById('pdf-upload')?.click()}
                            isFileInput
                            onFileChange={handleFileUpload}
                            className="flex-1 text-left hover:border-primary/80 hover:bg-muted transition-all cursor-pointer"
                        >
                            <StyledIcon icon={Upload} />
                        </BlueprintSection>
                    </div>
                    <div className="mt-12 w-full max-w-md mx-auto">
                        <div className="relative p-4 border-2 border-dashed rounded-lg">
                            <div className="flex items-center justify-center space-x-4">
                                <Sparkles className={`h-6 w-6 transition-colors ${enhancementMode ? 'text-chart-2' : 'text-muted-foreground'}`} />
                                <Label htmlFor="enhancement-mode" className="font-bold text-lg">AI Enhancement</Label>
                                <Switch
                                    id="enhancement-mode"
                                    checked={enhancementMode}
                                    onCheckedChange={setEnhancementMode}
                                    className="data-[state=checked]:bg-chart-2"
                                />
                            </div>
                            <p className="text-center text-sm text-muted-foreground mt-2">Let AI expand and professionalize your content.</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );

    const renderForm = () => (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {renderHeader("Build Your Resume", "Fill out the sections below. Your data is saved as you type.")}

            <div className="mt-8">
                <Card className="border-2 border-foreground mb-6">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <Sparkles className="h-5 w-5 text-black" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">AI Enhancement Mode</h3>
                                    <p className="text-sm text-muted-foreground">AI will intelligently expand your content and organize it professionally.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Label htmlFor="enhancement-mode-form" className={cn("font-semibold", { "text-muted-foreground": enhancementMode })}>
                                    Basic
                                </Label>
                                <Switch
                                    id="enhancement-mode-form"
                                    checked={enhancementMode}
                                    onCheckedChange={setEnhancementMode}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                                />
                                <Label htmlFor="enhancement-mode-form" className={cn("font-semibold", { "text-muted-foreground": !enhancementMode })}>
                                    AI Enhanced
                                </Label>
                            </div>
                        </div>
                        <AnimatePresence>
                            {enhancementMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 border-t-2 border-border">
                                        <div className="flex items-start gap-4">
                                            <div className="bg-blue-100/80 p-2 rounded-lg">
                                                <Sparkles className="h-5 w-5 text-black" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-primary">AI Enhancement includes:</h4>
                                                <ul className="list-disc list-inside text-muted-foreground text-sm mt-1 space-y-1">
                                                    <li>Expands project descriptions with technical details.</li>
                                                    <li>Organizes skills into intelligent, contextual categories.</li>
                                                    <li>Refines experience descriptions with professional language.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-8">
                <Tabs defaultValue="personal" className="w-full" value={formSection} onValueChange={setFormSection}>
                    <TabsList className="grid w-full grid-cols-5 border-2 border-foreground mb-6">
                        {sections.map((section) => (
                            <TabsTrigger key={section.id} value={section.id}>
                                <section.icon className="mr-2 h-4 w-4" />
                                {section.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {/* Form Content Tabs */}
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
                                    <div className="flex flex-wrap gap-2 my-4 p-4 border-2 border-foreground min-h-[48px]">
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
                        className="bg-primary text-primary-foreground"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                {enhancementMode ? "Generate Enhanced Resume" : "Generate Resume"} <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderMarkdownEditor = () => (
        <motion.div key="markdown" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="flex flex-col h-full bg-background pt-8">
            {renderHeader("Review Your Resume", "Edit the generated Markdown or go back to the form.")}

            <div className="flex-grow p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
            <Card className="h-full flex flex-col border-2 border-foreground">
                <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => setStage(Stage.Form)} className="shadow-sm border-2 border-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Form
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={handleDownloadMarkdown} variant="secondary" className="shadow-sm border-2 border-foreground">
                            <Download className="mr-2 h-4 w-4" />
                            Markdown
                        </Button>
                        <Button onClick={handleGenerateLatex} disabled={isLoading} className="shadow-sm border-2 border-foreground bg-black text-white hover:bg-black/80">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                            Generate LaTeX
                        </Button>
                    </div>
                </div>

                {fileName && (
                    <div className="p-3 bg-muted/50 text-muted-foreground flex items-center text-sm border-b-2 border-foreground">
                        <FileText className="h-4 w-4 mr-2" />
                        {enhancementMode && <Sparkles className="h-4 w-4 mr-2 text-primary"/>}
                        Extracted {enhancementMode ? "and Enhanced" : ""} from <strong>{fileName}</strong>
                    </div>
                )}
                
                <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-none">
                    <ResizablePanel defaultSize={50}>
                        <div className="h-full p-4 border border-black bg-white">
                            <Textarea
                                value={markdownContent}
                                onChange={(e) => setMarkdownContent(e.target.value)}
                                className="h-full w-full resize-none border-0 bg-transparent text-black text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                                placeholder="## Markdown Content..."
                            />
                        </div>
                    </ResizablePanel>
                    <ResizableHandle className="w-px bg-black" />
                    <ResizablePanel defaultSize={50}>
                        <div className="h-full overflow-y-auto bg-[#2D2D2D] p-4 border border-black">
                            <div className="prose prose-invert max-w-none text-white">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {markdownContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </Card>
            </div>
        </motion.div>
    );

    const renderResultContent = () => {
        if (!finalResults) {
            return (
                <motion.div key="result-loading" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                    <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                        <p className="mt-4 text-muted-foreground">Loading results...</p>
                    </div>
                </motion.div>
            );
        }
        return (
            <motion.div key="result" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="flex flex-col h-full bg-background pt-8">
                {renderHeader("Your Resume is Ready", "Download the generated PDF or LaTeX source.")}

                <div className="flex-grow p-2 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
                <Card className="h-full flex flex-col border-2 border-foreground">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
                            <Button variant="outline" onClick={() => setStage(Stage.Markdown)} className="shadow-sm border-2 border-foreground">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Editor
                            </Button>
                            <TabsList className="border-2 border-foreground">
                                <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
                                <TabsTrigger value="latex">LaTeX Code</TabsTrigger>
                            </TabsList>
                            <div className="flex items-center gap-2">
                                <Button onClick={() => handleDownload(finalResults.latex_str, 'resume.tex', 'text/plain')} variant="secondary" className="shadow-sm border-2 border-foreground">
                                    <Download className="mr-2 h-4 w-4" />
                                    LaTeX
                                </Button>
                                <Button onClick={() => handleDownload(finalResults.pdf_b64, 'resume.pdf', 'application/pdf', true)} className="shadow-sm border-2 border-foreground bg-black text-white hover:bg-black/80">
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="pdf" className="flex-grow overflow-hidden" forceMount>
                            {finalResults?.pdf_b64 ? (
                                <PDFViewerSimple pdfData={finalResults.pdf_b64} className="h-full" />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                                        <p className="text-muted-foreground">Preparing PDF preview...</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="latex" className="flex-grow">
                            <div className="h-full overflow-y-auto bg-[#2D2D2D] p-6">
                                <pre className="text-sm text-white whitespace-pre-wrap font-mono">{finalResults.latex_str}</pre>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
                </div>
            </motion.div>
        );
    };

    const renderContent = () => {
        switch (stage) {
            case Stage.Choice:
                return (
                    <motion.div key="choice" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        {renderChoiceScreen()}
                    </motion.div>
                );
            case Stage.Form:
                return (
                    <motion.div key="form" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}>
                        {renderForm()}
                    </motion.div>
                );
            case Stage.Markdown:
                return renderMarkdownEditor()
            case Stage.Result:
                return renderResultContent();
            default:
                return <div>Unknown stage</div>;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
                <div className="bg-card/60 backdrop-blur-md border-2 border-foreground px-6 py-3 shadow-lg rounded-xl">
                    <div className="flex items-center justify-between">
                        <a href="/" className="flex items-center space-x-2.5 group">
                            <h1 className="text-lg font-black text-foreground group-hover:text-muted-foreground transition-colors">
                                <LatexLogotype /> Resume Builder
                            </h1>
                        </a>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setStage(Stage.Choice)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border ${
                                    stage === Stage.Choice ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground cursor-pointer hover:bg-muted"
                                }`}
                            >
                                Input
                            </button>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <button
                                disabled={stage === Stage.Choice}
                                onClick={() => fileName ? setStage(Stage.Markdown) : setStage(Stage.Form)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border rounded-sm ${
                                    stage === Stage.Form ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                                } ${stage !== Stage.Choice ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed'}`}
                            >
                                Content
                            </button>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <button
                                disabled={stage !== Stage.Markdown && stage !== Stage.Result}
                                onClick={() => setStage(Stage.Markdown)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border rounded-sm ${
                                    stage === Stage.Markdown ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                                } ${stage === Stage.Markdown || stage === Stage.Result ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed'}`}
                            >
                                Markdown
                            </button>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            <button
                                disabled={stage !== Stage.Result}
                                onClick={() => setStage(Stage.Result)}
                                className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border rounded-sm ${
                                    stage === Stage.Result ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
                                } ${stage === Stage.Result ? 'cursor-pointer hover:bg-muted' : 'cursor-not-allowed'}`}
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 pt-24">
                <AnimatePresence mode="wait">
                    {renderContent()}
                </AnimatePresence>
            </main>
             <footer className="py-6 md:px-8 md:py-0 border-t-2 border-foreground bg-background">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        © {new Date().getFullYear()} LaTeX Resume Builder. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
