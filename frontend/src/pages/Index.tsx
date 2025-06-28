import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { Sparkles, FileText, Download, Eye, Plus, X, Upload } from 'lucide-react';
import { popularSkills } from '@/lib/skills';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
}

interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
}

interface Education {
  institution: string;
  degree: string;
  start_date: string;
  end_date: string;
}

interface Skills {
  technical: string[];
  soft: string[];
}

interface ResumeData {
  personal_info: PersonalInfo;
  summary: string;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skills;
}

const Index = () => {
  const [enhancementMode, setEnhancementMode] = useState(true);
  const [currentStep, setCurrentStep] = useState<'form' | 'markdown' | 'result'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<{ latex: string; pdf: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Form state
  const [resumeData, setResumeData] = useState<ResumeData>({
    personal_info: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin_url: '',
      github_url: ''
    },
    summary: '',
    experience: [{
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      responsibilities: ['']
    }],
    projects: [{
      name: '',
      description: '',
      technologies: []
    }],
    education: [{
      institution: '',
      degree: '',
      start_date: '',
      end_date: ''
    }],
    skills: {
      technical: [],
      soft: []
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Programming Languages');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file.');
    }
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        responsibilities: ['']
      }]
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: []
      }]
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        start_date: '',
        end_date: ''
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = (skill: string, type: 'technical' | 'soft') => {
    if (skill && !resumeData.skills[type].includes(skill)) {
      setResumeData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [type]: [...prev.skills[type], skill]
        }
      }));
    }
  };

  const removeSkill = (skill: string, type: 'technical' | 'soft') => {
    setResumeData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter(s => s !== skill)
      }
    }));
  };

  const addResponsibility = (expIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { ...exp, responsibilities: [...exp.responsibilities, ''] }
          : exp
      )
    }));
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex 
          ? { ...exp, responsibilities: exp.responsibilities.filter((_, j) => j !== respIndex) }
          : exp
      )
    }));
  };

  const handleGenerateResume = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      } else {
        formData.append('resume_data_json', JSON.stringify(resumeData));
      }
      
      formData.append('enhance', enhancementMode.toString());

      const response = await fetch('http://localhost:8000/api/parse-and-enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const result = await response.json();
      setMarkdownContent(result.markdown_str);
      setEnhancedData(JSON.parse(result.enhanced_json));
      setCurrentStep('markdown');
      toast.success('Resume generated successfully!');
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFinal = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('markdown_str', markdownContent);
      formData.append('enhanced_data_json', JSON.stringify(enhancedData));

      const response = await fetch('http://localhost:8000/api/generate-enhanced-latex', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate final resume');
      }

      const result = await response.json();
      setFinalResult({
        latex: result.latex_str,
        pdf: result.pdf_b64
      });
      setCurrentStep('result');
      toast.success('Final resume generated successfully!');
    } catch (error) {
      console.error('Error generating final resume:', error);
      toast.error('Failed to generate final resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (finalResult?.pdf) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${finalResult.pdf}`;
      link.download = 'resume.pdf';
      link.click();
    }
  };

  const downloadLaTeX = () => {
    if (finalResult?.latex) {
      const blob = new Blob([finalResult.latex], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'resume.tex';
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Resume Builder
          </h1>
          <p className="text-muted-foreground text-lg">
            Create professional resumes with intelligent AI enhancement
          </p>
        </div>

        {/* Enhancement Mode Toggle */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {enhancementMode ? (
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  {enhancementMode ? 'AI Enhancement Mode' : 'Basic Mode'}
                </CardTitle>
                <CardDescription>
                  {enhancementMode 
                    ? 'AI will intelligently expand and enhance your content'
                    : 'Simple formatting without AI enhancement'
                  }
                </CardDescription>
              </div>
              <Switch
                checked={enhancementMode}
                onCheckedChange={setEnhancementMode}
              />
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        {currentStep === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="space-y-6">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Existing Resume (Optional)</CardTitle>
                  <CardDescription>
                    Upload a PDF resume to extract and enhance existing content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {uploadedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {uploadedFile.name} uploaded
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={resumeData.personal_info.name}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, name: e.target.value }
                        }))}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personal_info.email}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, email: e.target.value }
                        }))}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personal_info.phone}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, phone: e.target.value }
                        }))}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.personal_info.location}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, location: e.target.value }
                        }))}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        value={resumeData.personal_info.linkedin_url}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, linkedin_url: e.target.value }
                        }))}
                        placeholder="https://linkedin.com/in/johndoe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="github">GitHub URL</Label>
                      <Input
                        id="github"
                        value={resumeData.personal_info.github_url}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          personal_info: { ...prev.personal_info, github_url: e.target.value }
                        }))}
                        placeholder="https://github.com/johndoe"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={resumeData.summary}
                    onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief professional summary..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Experience */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    <Button onClick={addExperience} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        {resumeData.experience.length > 1 && (
                          <Button
                            onClick={() => removeExperience(index)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => 
                                i === index ? { ...item, company: e.target.value } : item
                              )
                            }))}
                            placeholder="Company Name"
                          />
                        </div>
                        <div>
                          <Label>Position</Label>
                          <Input
                            value={exp.position}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => 
                                i === index ? { ...item, position: e.target.value } : item
                              )
                            }))}
                            placeholder="Job Title"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            value={exp.start_date}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => 
                                i === index ? { ...item, start_date: e.target.value } : item
                              )
                            }))}
                            placeholder="Jan 2020"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={exp.end_date}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map((item, i) => 
                                i === index ? { ...item, end_date: e.target.value } : item
                              )
                            }))}
                            placeholder="Present"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Responsibilities</Label>
                          <Button
                            onClick={() => addResponsibility(index)}
                            variant="outline"
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                        {exp.responsibilities.map((resp, respIndex) => (
                          <div key={respIndex} className="flex gap-2 mb-2">
                            <Input
                              value={resp}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                experience: prev.experience.map((item, i) => 
                                  i === index ? {
                                    ...item,
                                    responsibilities: item.responsibilities.map((r, j) => 
                                      j === respIndex ? e.target.value : r
                                    )
                                  } : item
                                )
                              }))}
                              placeholder="Describe your responsibility..."
                            />
                            {exp.responsibilities.length > 1 && (
                              <Button
                                onClick={() => removeResponsibility(index, respIndex)}
                                variant="outline"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Projects */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Projects</CardTitle>
                    <Button onClick={addProject} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Project {index + 1}</h4>
                        {resumeData.projects.length > 1 && (
                          <Button
                            onClick={() => removeProject(index)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <Label>Project Name</Label>
                        <Input
                          value={project.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map((item, i) => 
                              i === index ? { ...item, name: e.target.value } : item
                            )
                          }))}
                          placeholder="Project Name"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={project.description}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map((item, i) => 
                              i === index ? { ...item, description: e.target.value } : item
                            )
                          }))}
                          placeholder="Brief project description..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Technologies</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary">
                              {tech}
                              <button
                                onClick={() => setResumeData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map((item, i) => 
                                    i === index ? {
                                      ...item,
                                      technologies: item.technologies.filter((_, j) => j !== techIndex)
                                    } : item
                                  )
                                }))}
                                className="ml-2 text-xs"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            placeholder="Add technology..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const value = e.currentTarget.value.trim();
                                if (value && !project.technologies.includes(value)) {
                                  setResumeData(prev => ({
                                    ...prev,
                                    projects: prev.projects.map((item, i) => 
                                      i === index ? {
                                        ...item,
                                        technologies: [...item.technologies, value]
                                      } : item
                                    )
                                  }));
                                  e.currentTarget.value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    <Button onClick={addEducation} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resumeData.education.map((edu, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        {resumeData.education.length > 1 && (
                          <Button
                            onClick={() => removeEducation(index)}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Institution</Label>
                          <Input
                            value={edu.institution}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map((item, i) => 
                                i === index ? { ...item, institution: e.target.value } : item
                              )
                            }))}
                            placeholder="University Name"
                          />
                        </div>
                        <div>
                          <Label>Degree</Label>
                          <Input
                            value={edu.degree}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map((item, i) => 
                                i === index ? { ...item, degree: e.target.value } : item
                              )
                            }))}
                            placeholder="Bachelor of Science"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            value={edu.start_date}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map((item, i) => 
                                i === index ? { ...item, start_date: e.target.value } : item
                              )
                            }))}
                            placeholder="2018"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={edu.end_date}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map((item, i) => 
                                i === index ? { ...item, end_date: e.target.value } : item
                              )
                            }))}
                            placeholder="2022"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Technical Skills */}
                  <div>
                    <Label className="text-base font-medium">Technical Skills</Label>
                    <div className="mt-2">
                      <div className="flex gap-2 mb-4">
                        <select
                          value={selectedSkillCategory}
                          onChange={(e) => setSelectedSkillCategory(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {Object.keys(popularSkills).map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {popularSkills[selectedSkillCategory as keyof typeof popularSkills]?.map(skill => (
                          <Button
                            key={skill}
                            variant="outline"
                            size="sm"
                            onClick={() => addSkill(skill, 'technical')}
                            disabled={resumeData.skills.technical.includes(skill)}
                          >
                            {skill}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2 mb-4">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add custom skill..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newSkill.trim()) {
                              addSkill(newSkill.trim(), 'technical');
                              setNewSkill('');
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newSkill.trim()) {
                              addSkill(newSkill.trim(), 'technical');
                              setNewSkill('');
                            }
                          }}
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.technical.map(skill => (
                          <Badge key={skill} variant="default">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill, 'technical')}
                              className="ml-2 text-xs"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Soft Skills */}
                  <div>
                    <Label className="text-base font-medium">Soft Skills</Label>
                    <div className="mt-2">
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Add soft skill..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = e.currentTarget.value.trim();
                              if (value) {
                                addSkill(value, 'soft');
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.soft.map(skill => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill, 'soft')}
                              className="ml-2 text-xs"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateResume}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  'Generating...'
                ) : enhancementMode ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Enhanced Resume
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5 mr-2" />
                    Generate Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Markdown Editing Step */}
        {currentStep === 'markdown' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Review & Edit</h2>
                <p className="text-muted-foreground">
                  Review and edit your resume content before final generation
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                >
                  Back to Form
                </Button>
                <Button
                  onClick={handleGenerateFinal}
                  disabled={isLoading}
                >
                  {isLoading ? 'Generating...' : 'Generate Final Resume'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
              {/* Markdown Editor */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Edit Markdown</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <Textarea
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    className="h-full resize-none font-mono text-sm"
                    placeholder="Your resume content in Markdown..."
                  />
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Final Result Step */}
        {currentStep === 'result' && finalResult && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Resume is Ready!</h2>
                <p className="text-muted-foreground">
                  Download your professional resume or view the LaTeX source
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentStep('markdown')}
                  variant="outline"
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={downloadPDF}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button
                  onClick={downloadLaTeX}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download LaTeX
                </Button>
              </div>
            </div>

            <Tabs defaultValue="pdf" className="w-full">
              <TabsList>
                <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
                <TabsTrigger value="latex">LaTeX Source</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pdf" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <iframe
                      src={`data:application/pdf;base64,${finalResult.pdf}`}
                      className="w-full h-[800px] border-0"
                      title="Resume PDF Preview"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="latex" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>LaTeX Source Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                      <code>{finalResult.latex}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;