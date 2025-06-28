import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { 
  Sparkles, 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  X, 
  Upload, 
  Save,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderOpen,
  Zap,
  Magic,
  FileCheck,
  Lightbulb,
  Target
} from 'lucide-react';
import { popularSkills } from '@/lib/skills';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<{ latex: string; pdf: string } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

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

  // Form steps configuration
  const formSteps = [
    {
      id: 'personal',
      title: 'Personal Info',
      icon: User,
      description: 'Basic contact information'
    },
    {
      id: 'summary',
      title: 'Summary',
      icon: Target,
      description: 'Professional summary'
    },
    {
      id: 'experience',
      title: 'Experience',
      icon: Briefcase,
      description: 'Work history'
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: FolderOpen,
      description: 'Notable projects'
    },
    {
      id: 'education',
      title: 'Education',
      icon: GraduationCap,
      description: 'Academic background'
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: Code,
      description: 'Technical & soft skills'
    }
  ];

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      setTimeout(() => setAutoSaveStatus('saved'), 500);
    }, 2000);

    setAutoSaveStatus('unsaved');
    return () => clearTimeout(timer);
  }, [resumeData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Calculate form progress
  useEffect(() => {
    const calculateProgress = () => {
      let totalFields = 0;
      let filledFields = 0;

      // Personal info (6 fields)
      totalFields += 6;
      filledFields += Object.values(resumeData.personal_info).filter(v => v.trim()).length;

      // Summary (1 field)
      totalFields += 1;
      if (resumeData.summary.trim()) filledFields += 1;

      // Experience (at least one with basic info)
      totalFields += 4;
      const firstExp = resumeData.experience[0];
      if (firstExp?.company.trim()) filledFields += 1;
      if (firstExp?.position.trim()) filledFields += 1;
      if (firstExp?.start_date.trim()) filledFields += 1;
      if (firstExp?.responsibilities.some(r => r.trim())) filledFields += 1;

      // Skills (at least some technical skills)
      totalFields += 1;
      if (resumeData.skills.technical.length > 0) filledFields += 1;

      setFormProgress(Math.round((filledFields / totalFields) * 100));
    };

    calculateProgress();
  }, [resumeData]);

  // Validation
  const validateCurrentStep = useCallback(() => {
    const errors: string[] = [];
    
    switch (currentFormStep) {
      case 0: // Personal Info
        if (!resumeData.personal_info.name.trim()) errors.push('Name is required');
        if (!resumeData.personal_info.email.trim()) errors.push('Email is required');
        if (!resumeData.personal_info.phone.trim()) errors.push('Phone is required');
        break;
      case 1: // Summary
        if (!resumeData.summary.trim()) errors.push('Professional summary is required');
        break;
      case 2: // Experience
        const firstExp = resumeData.experience[0];
        if (!firstExp?.company.trim()) errors.push('At least one work experience is required');
        if (!firstExp?.position.trim()) errors.push('Position title is required');
        break;
      case 5: // Skills
        if (resumeData.skills.technical.length === 0) errors.push('At least one technical skill is required');
        break;
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [currentFormStep, resumeData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      toast.success('PDF uploaded successfully! 📄');
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
      toast.success(`Added ${skill} to ${type} skills! ✨`);
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

  const nextFormStep = () => {
    if (validateCurrentStep() && currentFormStep < formSteps.length - 1) {
      setCurrentFormStep(prev => prev + 1);
    }
  };

  const prevFormStep = () => {
    if (currentFormStep > 0) {
      setCurrentFormStep(prev => prev - 1);
    }
  };

  const handleGenerateResume = async () => {
    if (!validateCurrentStep()) {
      toast.error('Please fill in all required fields before generating.');
      return;
    }

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
      toast.success('Resume generated successfully! 🎉');
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
      toast.success('Final resume generated successfully! 🚀');
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
      toast.success('PDF downloaded! 📥');
    }
  };

  const downloadLaTeX = () => {
    if (finalResult?.latex) {
      const blob = new Blob([finalResult.latex], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'resume.tex';
      link.click();
      toast.success('LaTeX file downloaded! 📥');
    }
  };

  const renderFormStep = () => {
    const currentStepData = formSteps[currentFormStep];
    
    switch (currentStepData.id) {
      case 'personal':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <User className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">Let's start with your basic contact details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="name"
                  value={resumeData.personal_info.name}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personal_info: { ...prev.personal_info, name: e.target.value }
                  }))}
                  placeholder="John Doe"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personal_info.email}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personal_info: { ...prev.personal_info, email: e.target.value }
                  }))}
                  placeholder="john@example.com"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
                <Input
                  id="phone"
                  value={resumeData.personal_info.phone}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personal_info: { ...prev.personal_info, phone: e.target.value }
                  }))}
                  placeholder="+1 (555) 123-4567"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                <Input
                  id="location"
                  value={resumeData.personal_info.location}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personal_info: { ...prev.personal_info, location: e.target.value }
                  }))}
                  placeholder="San Francisco, CA"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={resumeData.personal_info.linkedin_url}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personal_info: { ...prev.personal_info, linkedin_url: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/in/johndoe"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github" className="text-sm font-medium">GitHub URL</Label>
                <Input
                  id="github"
                  value={resumeData.personal_info.github_url}
                  onChange={(e) => setResumeData(prev => ({
                    ...prev,
                    personal_info: { ...prev.personal_info, github_url: e.target.value }
                  }))}
                  placeholder="https://github.com/johndoe"
                  className="h-12"
                />
              </div>
            </div>
          </motion.div>
        );

      case 'summary':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Professional Summary</h2>
              <p className="text-muted-foreground">Write a compelling summary that highlights your key strengths</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="summary" className="text-sm font-medium">Professional Summary *</Label>
              <Textarea
                id="summary"
                value={resumeData.summary}
                onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="A passionate software engineer with 5+ years of experience in full-stack development..."
                rows={6}
                className="resize-none"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4" />
                <span>Tip: Include your years of experience, key skills, and career goals</span>
              </div>
            </div>
          </motion.div>
        );

      case 'experience':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Work Experience</h2>
              <p className="text-muted-foreground">Add your professional work history</p>
            </div>

            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <Card key={index} className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Experience {index + 1}</CardTitle>
                      {resumeData.experience.length > 1 && (
                        <Button
                          onClick={() => removeExperience(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => 
                              i === index ? { ...item, company: e.target.value } : item
                            )
                          }))}
                          placeholder="Company Name"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position Title *</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map((item, i) => 
                              i === index ? { ...item, position: e.target.value } : item
                            )
                          }))}
                          placeholder="Software Engineer"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
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
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
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
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Key Responsibilities & Achievements</Label>
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
                        <div key={respIndex} className="flex gap-2">
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
                            placeholder="Led a team of 5 developers to build..."
                            className="flex-1"
                          />
                          {exp.responsibilities.length > 1 && (
                            <Button
                              onClick={() => removeResponsibility(index, respIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                onClick={addExperience}
                variant="outline"
                className="w-full h-12 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Experience
              </Button>
            </div>
          </motion.div>
        );

      case 'projects':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Projects</h2>
              <p className="text-muted-foreground">Showcase your notable projects and achievements</p>
            </div>

            <div className="space-y-6">
              {resumeData.projects.map((project, index) => (
                <Card key={index} className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Project {index + 1}</CardTitle>
                      {resumeData.projects.length > 1 && (
                        <Button
                          onClick={() => removeProject(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          projects: prev.projects.map((item, i) => 
                            i === index ? { ...item, name: e.target.value } : item
                          )
                        }))}
                        placeholder="E-commerce Platform"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          projects: prev.projects.map((item, i) => 
                            i === index ? { ...item, description: e.target.value } : item
                          )
                        }))}
                        placeholder="Built a full-stack e-commerce platform with user authentication, payment processing..."
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Technologies Used</Label>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-sm">
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
                              className="ml-2 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add technology (press Enter)"
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
                        className="h-11"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                onClick={addProject}
                variant="outline"
                className="w-full h-12 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Project
              </Button>
            </div>
          </motion.div>
        );

      case 'education':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Education</h2>
              <p className="text-muted-foreground">Add your educational background</p>
            </div>

            <div className="space-y-6">
              {resumeData.education.map((edu, index) => (
                <Card key={index} className="border-2 border-dashed border-muted hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Education {index + 1}</CardTitle>
                      {resumeData.education.length > 1 && (
                        <Button
                          onClick={() => removeEducation(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education.map((item, i) => 
                              i === index ? { ...item, institution: e.target.value } : item
                            )
                          }))}
                          placeholder="Stanford University"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education.map((item, i) => 
                              i === index ? { ...item, degree: e.target.value } : item
                            )
                          }))}
                          placeholder="Bachelor of Science in Computer Science"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
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
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
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
                          className="h-11"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                onClick={addEducation}
                variant="outline"
                className="w-full h-12 border-dashed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Education
              </Button>
            </div>
          </motion.div>
        );

      case 'skills':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Code className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Skills</h2>
              <p className="text-muted-foreground">Add your technical and soft skills</p>
            </div>

            <div className="space-y-8">
              {/* Technical Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Technical Skills *
                  </CardTitle>
                  <CardDescription>
                    Select from popular technologies or add your own
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={selectedSkillCategory}
                      onChange={(e) => setSelectedSkillCategory(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.keys(popularSkills).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
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
                        className="h-11"
                      />
                      <Button
                        onClick={() => {
                          if (newSkill.trim()) {
                            addSkill(newSkill.trim(), 'technical');
                            setNewSkill('');
                          }
                        }}
                        size="sm"
                        className="h-11 px-6"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {popularSkills[selectedSkillCategory as keyof typeof popularSkills]?.map(skill => (
                        <Button
                          key={skill}
                          variant={resumeData.skills.technical.includes(skill) ? "default" : "outline"}
                          size="sm"
                          onClick={() => addSkill(skill, 'technical')}
                          disabled={resumeData.skills.technical.includes(skill)}
                          className="h-9"
                        >
                          {resumeData.skills.technical.includes(skill) && <CheckCircle className="h-3 w-3 mr-1" />}
                          {skill}
                        </Button>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Your Technical Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.technical.map(skill => (
                          <Badge key={skill} variant="default" className="text-sm py-1 px-3">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill, 'technical')}
                              className="ml-2 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        {resumeData.skills.technical.length === 0 && (
                          <p className="text-sm text-muted-foreground">No technical skills added yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Soft Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Magic className="h-5 w-5" />
                    Soft Skills
                  </CardTitle>
                  <CardDescription>
                    Add your interpersonal and professional skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Add soft skill (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim();
                        if (value) {
                          addSkill(value, 'soft');
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="h-11"
                  />
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.soft.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill, 'soft')}
                          className="ml-2 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {resumeData.skills.soft.length === 0 && (
                      <p className="text-sm text-muted-foreground">No soft skills added yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            AI-Powered Resume Builder
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Create professional resumes with intelligent AI enhancement that transforms your content into compelling narratives
          </p>
        </motion.div>

        {/* Enhancement Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {enhancementMode ? (
                    <div className="p-2 rounded-full bg-yellow-500/20">
                      <Sparkles className="h-6 w-6 text-yellow-600" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-full bg-muted">
                      <FileText className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {enhancementMode ? 'AI Enhancement Mode' : 'Basic Mode'}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {enhancementMode 
                        ? 'AI will intelligently expand and enhance your content with professional language and quantifiable achievements'
                        : 'Simple formatting without AI enhancement - your content as-is'
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {enhancementMode ? 'Enhanced' : 'Basic'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {enhancementMode ? 'Recommended' : 'Simple'}
                    </div>
                  </div>
                  <Switch
                    checked={enhancementMode}
                    onCheckedChange={setEnhancementMode}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Auto-save Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {autoSaveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Auto-saved</span>
              </>
            )}
            {autoSaveStatus === 'unsaved' && (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span>Unsaved changes</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Progress: {formProgress}%</span>
            <Progress value={formProgress} className="w-20" />
          </div>
        </motion.div>

        {/* Main Content */}
        {currentStep === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Resume Sections</CardTitle>
                  <CardDescription>Complete each section to build your resume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentFormStep;
                    const isCompleted = index < currentFormStep;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentFormStep(index)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          isActive 
                            ? 'bg-primary text-primary-foreground shadow-md' 
                            : isCompleted
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md ${
                          isActive 
                            ? 'bg-primary-foreground/20' 
                            : isCompleted
                            ? 'bg-green-200'
                            : 'bg-muted'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className={`text-xs truncate ${
                            isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {step.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* File Upload Card */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Quick Start
                  </CardTitle>
                  <CardDescription>Upload existing resume to extract content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                    {uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="truncate">{uploadedFile.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Form Content */}
            <div className="lg:col-span-3">
              <Card className="min-h-[600px]">
                <CardContent className="p-8">
                  <AnimatePresence mode="wait">
                    {renderFormStep()}
                  </AnimatePresence>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {validationErrors.map((error, index) => (
                              <div key={index}>• {error}</div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <Button
                      onClick={prevFormStep}
                      variant="outline"
                      disabled={currentFormStep === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {formSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentFormStep
                              ? 'bg-primary'
                              : index < currentFormStep
                              ? 'bg-green-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>

                    {currentFormStep === formSteps.length - 1 ? (
                      <Button
                        onClick={handleGenerateResume}
                        disabled={isLoading || validationErrors.length > 0}
                        className="flex items-center gap-2 min-w-[140px]"
                        size="lg"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : enhancementMode ? (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Generate Enhanced
                          </>
                        ) : (
                          <>
                            <FileCheck className="h-4 w-4" />
                            Generate Resume
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={nextFormStep}
                        disabled={validationErrors.length > 0}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Markdown Editing Step */}
        {currentStep === 'markdown' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold">Review & Edit</h2>
                <p className="text-muted-foreground text-lg">
                  Review and edit your resume content before final generation
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('form')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Form
                </Button>
                <Button
                  onClick={handleGenerateFinal}
                  disabled={isLoading}
                  className="flex items-center gap-2 min-w-[160px]"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4" />
                      Generate Final Resume
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
              {/* Markdown Editor */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Edit Markdown
                  </CardTitle>
                  <CardDescription>
                    Make any final adjustments to your resume content
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <Textarea
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    className="h-full resize-none border-0 font-mono text-sm p-6 focus-visible:ring-0"
                    placeholder="Your resume content in Markdown..."
                  />
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    See how your resume will look
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {markdownContent}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Final Result Step */}
        {currentStep === 'result' && finalResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
              >
                <CheckCircle className="h-8 w-8 text-green-600" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Your Resume is Ready! 🎉</h2>
              <p className="text-muted-foreground text-lg">
                Download your professional resume or view the LaTeX source code
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                onClick={() => setCurrentStep('markdown')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Edit
              </Button>
              <Button
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                size="lg"
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

            <Tabs defaultValue="pdf" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="pdf" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  PDF Preview
                </TabsTrigger>
                <TabsTrigger value="latex" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  LaTeX Source
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="pdf" className="mt-6">
                <Card>
                  <CardContent className="p-0">
                    <iframe
                      src={`data:application/pdf;base64,${finalResult.pdf}`}
                      className="w-full h-[800px] border-0 rounded-lg"
                      title="Resume PDF Preview"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="latex" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      LaTeX Source Code
                    </CardTitle>
                    <CardDescription>
                      Copy this code to compile your resume locally
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-muted p-6 rounded-lg overflow-auto text-sm max-h-[600px] border">
                        <code>{finalResult.latex}</code>
                      </pre>
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(finalResult.latex);
                          toast.success('LaTeX code copied to clipboard! 📋');
                        }}
                        variant="outline"
                        size="sm"
                        className="absolute top-4 right-4"
                      >
                        Copy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;