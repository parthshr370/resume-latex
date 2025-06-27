import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Loader2, Download, User, Briefcase, GraduationCap, Star, Code, X } from 'lucide-react';
import { PersonalInfo, Experience, Project, Education, Skills, ResumeSchema } from './types';
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BlueprintSection } from "@/components/ui/blueprint-section";
import { Badge } from "@/components/ui/badge";
import { popularSkills } from "@/lib/skills";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    Form,
    Markdown,
    Result
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
        const formData = new FormData();
        formData.append('resume_data_json', JSON.stringify(resumeData));

        try {
            const response = await fetch('http://localhost:8000/api/generate-resume', { method: 'POST', body: formData });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'An unknown error occurred');
            }
            const data = await response.json();
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

    const renderResultContent = () => {
        if (!finalResults) return null;

        return (
            <div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
                            <TabsTrigger value="latex">LaTeX Code</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => handleDownload(finalResults.pdf_b64, 'resume.pdf', 'application/pdf', true)}>
                                <Download className="mr-2 h-4 w-4" /> PDF
                            </Button>
                            <Button variant="outline" onClick={() => { setStage(Stage.Form); setFinalResults(null); }}>
                                Back to Form
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="pdf">
                        <Card className="bg-card border-border">
                            <CardContent className="p-2">
                                <object data={`data:application/pdf;base64,${finalResults.pdf_b64}`} type="application/pdf" className="w-full h-[80vh] border rounded-md">
                                    <p>Your browser does not support PDF previews. You can <Button variant="link" onClick={() => handleDownload(finalResults.pdf_b64, 'resume.pdf', 'application/pdf', true)}>download the PDF</Button> instead.</p>
                                </object>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="latex">
                        <Card>
                            <CardContent className="p-2">
                                <Textarea value={finalResults.latex_str} rows={30} readOnly className="bg-input border-border font-mono text-xs"/>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                 {error && <p className="text-destructive text-sm mt-4 text-center">{error}</p>}
            </div>
        );
    };

    const renderMarkdownEditor = () => {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Resume Markdown</CardTitle>
                        <CardDescription>
                            Review and edit the generated Markdown on the left, and see a live preview on the right. When you're ready, generate the final PDF.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResizablePanelGroup direction="horizontal" className="min-h-[70vh] rounded-lg border">
                            <ResizablePanel defaultSize={50}>
                                <Textarea 
                                    value={markdownContent} 
                                    onChange={(e) => setMarkdownContent(e.target.value)}
                                    className="h-full w-full resize-none border-0 rounded-none font-mono text-sm p-4 focus-visible:ring-0"
                                />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={50}>
                                <div className="p-4 h-full overflow-y-auto">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {markdownContent}
                                    </ReactMarkdown>
                                    </div>
                                </div>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </CardContent>
                </Card>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStage(Stage.Form)}>Back to Form</Button>
                    <Button onClick={handleGenerateLatex} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate LaTeX & PDF"}
                    </Button>
                </div>
            </div>
        );
    };
    
    const renderForm = () => (
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
    );
    
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
                        <p className="text-muted-foreground">
                            {stage === Stage.Form && "Fill out the sections to create your professional resume."}
                            {stage === Stage.Markdown && "Fine-tune your resume content below."}
                            {stage === Stage.Result && "Your resume is ready!"}
                        </p>
                    </div>
                    {stage === Stage.Form && (
                        <Button onClick={handleGenerateMarkdown} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Resume"}
                        </Button>
                    )}
                </header>

                <main>
                    {stage === Stage.Form && renderForm()}
                    {stage === Stage.Markdown && renderMarkdownEditor()}
                    {stage === Stage.Result && renderResultContent()}
                </main>
            </div>
        </div>
    );
}
