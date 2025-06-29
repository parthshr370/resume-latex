"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { FileText, Upload, Edit3, Code, Zap, ArrowRight, Eye } from "lucide-react"
import Link from "next/link"
import { LatexLogotype } from "@/components/latex-logotype"
import { useState } from "react";

export default function LandingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("jakes_resume");
  const templates = [
    {
      id: 1,
      name: "Jake's Resume",
      description: "A clean, modern design perfect for tech professionals and developers.",
      preview: "/jakes-resume.png",
      popular: true,
      slug: "jakes_resume",
    },
    {
      id: 2,
      name: "Deedy CV",
      description: "A professional and elegant layout with excellent typography for academics.",
      preview: "/deedy-resume.png",
      popular: true,
      slug: "deedy_resume",
    },
    {
      id: 3,
      name: "Curve CV",
      description: "A modern design with curved sidebar and professional layout.",
      preview: "/curve-cv.png",
      popular: false,
      slug: "curve_cv",
    },
    {
      id: 4,
      name: "Tibault's Résumé",
      description: "A sophisticated and executive-level design for senior roles.",
      preview: "/tibault-resume.png",
      popular: false,
      slug: "tibault_resume",
    },
  ]

  const features = [
    {
      icon: <Code className="h-10 w-10" />,
      title: (
        <>
          <LatexLogotype /> Output
        </>
      ),
      description: "Generate professional, pixel-perfect LaTeX code.",
    },
    {
      icon: <Upload className="h-10 w-10" />,
      title: "PDF Upload",
      description: "Convert your existing PDF resume to editable LaTeX.",
    },
    {
      icon: <Edit3 className="h-10 w-10" />,
      title: "Easy Form Builder",
      description: "Fill out simple forms to create your entire resume.",
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: "Instant Preview",
      description: "See a real-time preview of your resume as you type.",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group" aria-label="Homepage">
            <FileText className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
            <h1 className="text-xl font-black text-foreground group-hover:text-accent transition-colors">
              <LatexLogotype /> Resume Builder
            </h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {["Templates", "Features", "How it Works"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-base font-bold text-foreground hover:text-primary transition-colors"
                aria-label={`Scroll to ${item}`}
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="ghost"
              aria-label="Sign In"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              variant="destructive"
              aria-label="Download"
            >
              Download
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="h-screen min-h-[700px] flex items-center justify-center p-4 md:p-8 -mt-16">
          <div
            className="relative z-10 w-full h-[85vh] min-h-[600px] bg-cover bg-center border-2 border-border text-center flex flex-col justify-center shadow-lg"
            style={{ backgroundImage: "url('/gradii-1920x1080.png')" }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10 p-4 sm:p-12 md:p-20">
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-black text-white mb-6">
                Resume to <LatexLogotype />
              </h2>
              <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto font-medium">
                Transform your information into beautifully formatted <LatexLogotype /> resumes. Choose professional templates, upload
                existing PDFs, or use our guided forms.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  aria-label="Get Started"
                  onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <span className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-6 w-6" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-black"
                  aria-label="Learn More"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section id="templates" className="py-24 sm:py-32 bg-muted border-y-2 border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-5xl sm:text-6xl font-black text-foreground mb-4">Choose Your Template</h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
                Professionally designed and battle-tested resume templates, crafted for impact and readability.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {templates.map((template) => (
                <HoverCard key={template.id} openDelay={500} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Card
                      className={`bg-card border-2 p-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-2 flex flex-col overflow-hidden group cursor-pointer ${selectedTemplate === template.slug ? 'border-primary' : 'border-border'}`}
                      onClick={() => setSelectedTemplate(template.slug)}
                      aria-label={`Template card for ${template.name}`}
                    >
                      <CardHeader className="p-0 relative aspect-[3/4] overflow-hidden">
                        <img
                          src={template.preview || "/placeholder.svg"}
                          alt={`${template.name} template preview`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {template.popular && (
                          <Badge className="absolute top-4 right-4 text-xs font-black px-3 py-1 shadow-md border-2 border-border" variant="secondary">
                            Popular
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="p-6 flex-grow flex flex-col">
                        <CardTitle className="text-2xl font-black text-foreground mb-2">{template.name}</CardTitle>
                        <CardDescription className="text-base text-muted-foreground mb-4 flex-grow font-medium">
                          {template.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="right"
                    align="center"
                    sideOffset={10}
                    className="w-auto h-[70vh] p-2 border-2 border-border bg-background shadow-xl hidden lg:block"
                  >
                    <img
                      src={template.preview || "/placeholder.svg"}
                      alt={`${template.name} template preview enlarged`}
                      className="w-full h-full object-contain"
                    />
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>

            {/* Unified Proceed Button */}
            <div className="mt-20 text-center">
                <Link href={`/builder?template=${selectedTemplate}`} passHref>
                    <Button
                      size="lg"
                      className="text-lg"
                      aria-label={`Proceed with ${selectedTemplate.replace(/_/g, " ")}`}
                    >
                      <span className="flex items-center">
                        Proceed with {selectedTemplate.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        <ArrowRight className="ml-3 h-6 w-6" />
                      </span>
                    </Button>
                </Link>
                <p className="text-muted-foreground mt-4 text-sm font-medium">Select a template above to get started.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32 bg-muted border-y-2 border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-5xl sm:text-6xl font-black text-foreground mb-4">
                Why Choose <LatexLogotype /> Resume Builder?
              </h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
                We combine professional typesetting with modern convenience to give you the best of both worlds.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="bg-card border-2 border-border p-8 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-2"
                  aria-label={typeof feature.title === 'string' ? feature.title : 'Feature'}
                >
                  <div className="inline-block p-4 bg-accent text-accent-foreground mb-5 border-2 border-border shadow-sm">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-black text-foreground mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground font-medium">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 sm:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-5xl sm:text-6xl font-black text-foreground mb-4">How It Works</h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
                Four simple steps to your perfect, professional <LatexLogotype /> resume.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                { title: "Select Template", description: "Choose a template that fits your style and industry." },
                { title: "Choose Method", description: "Fill a guided form or upload an existing PDF." },
                { title: "Input Information", description: "Provide your details or let our AI extract them for you." },
                { title: "Generate & Download", description: "Get your professional LaTeX code and compiled PDF." },
              ].map((step, index) => (
                <Card
                  key={index}
                  className="bg-card border-2 border-border p-8 text-center shadow-md"
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  <div className="bg-primary text-primary-foreground h-16 w-16 flex items-center justify-center font-black text-3xl border-2 border-border mx-auto mb-6 shadow-sm">
                    {index + 1}
                  </div>
                  <h4 className="text-2xl font-black text-foreground mb-3">{step.title}</h4>
                  <p className="text-muted-foreground font-medium">{step.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 bg-accent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-5xl sm:text-6xl font-black text-accent-foreground mb-6">
              Ready to Build Your Perfect Resume?
            </h3>
            <p className="text-xl text-accent-foreground/90 mb-12 max-w-3xl mx-auto font-medium">
              Join thousands of professionals who trust <LatexLogotype /> Resume Builder for their career needs.
            </p>
            <Button
              size="lg"
              variant="destructive"
              className="text-lg"
              aria-label="Choose Your Template"
              onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
            >
              <span className="flex items-center">
                Choose Your Template <ArrowRight className="ml-3 h-7 w-7" />
              </span>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-black text-foreground">
                <LatexLogotype /> Resume Builder
              </span>
            </div>
            <div className="flex space-x-8">
              {["Privacy", "Terms", "Support"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-base font-bold text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={item}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-center text-muted-foreground mt-10 text-base font-medium">
            &copy; {new Date().getFullYear()} <LatexLogotype /> Resume Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
