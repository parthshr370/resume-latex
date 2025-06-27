"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Edit3, Code, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { LatexLogotype } from "@/components/latex-logotype"

export default function LandingPage() {
  const templates = [
    {
      id: 1,
      name: "Academic",
      description: "Clean, professional template.",
      preview: "/placeholder.svg?height=400&width=300",
      popular: true,
    },
    {
      id: 2,
      name: "Modern",
      description: "Contemporary design for tech roles.",
      preview: "/placeholder.svg?height=400&width=300",
      popular: false,
    },
    {
      id: 3,
      name: "Minimal",
      description: "Simple, elegant layout.",
      preview: "/placeholder.svg?height=400&width=300",
      popular: true,
    },
    {
      id: 4,
      name: "Executive",
      description: "Sophisticated for senior roles.",
      preview: "/placeholder.svg?height=400&width=300",
      popular: false,
    },
  ]

  const features = [
    {
      icon: <Code className="h-10 w-10 text-foreground" />,
      title: (
        <>
          <LatexLogotype /> Output
        </>
      ),
      description: "Generate professional LaTeX code.",
    },
    {
      icon: <Upload className="h-10 w-10 text-foreground" />,
      title: "PDF Upload",
      description: "Convert existing PDF to LaTeX.",
    },
    {
      icon: <Edit3 className="h-10 w-10 text-foreground" />,
      title: "Form Builder",
      description: "Fill forms to create your resume.",
    },
    {
      icon: <Zap className="h-10 w-10 text-foreground" />,
      title: "Instant Preview",
      description: "See real-time resume preview.",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-foreground font-sans">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <FileText className="h-6 w-6 text-foreground group-hover:text-muted-foreground transition-colors" />
              <h1 className="text-lg font-black text-foreground group-hover:text-muted-foreground transition-colors">
                <LatexLogotype /> Resume Builder
              </h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              {["Templates", "Features", "How it Works"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="ghost"
                className="relative text-foreground hover:text-muted-foreground hover:bg-white/10 rounded-full px-4 py-2 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <span className="relative z-10">Sign In</span>
              </Button>
              <Button
                size="sm"
                className="relative bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 font-medium overflow-hidden group"
              >
                <div className="absolute inset-0 bg-black/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                <span className="relative z-10">Download</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center p-4 md:p-8">
        <div
          className="relative z-10 container mx-auto flex flex-col items-center justify-center bg-cover bg-center rounded-3xl h-full text-center"
          style={{ backgroundImage: "url('/gradii-1920x1080.png')" }}
        >
          <div className="absolute inset-0 bg-black/50 rounded-3xl" />
          <div className="relative z-10 p-4">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-6">
              Resume to <LatexLogotype />
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Transform your information into beautifully formatted <LatexLogotype /> resumes. Choose templates, upload
              PDFs, or use our forms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="relative bg-white text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-200 transition-all overflow-hidden group"
                onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="relative z-10 flex items-center">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="relative bg-transparent text-white border-2 border-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-white/10 transition-all overflow-hidden group"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                <span className="relative z-10">Learn More</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 sm:py-24 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Choose Your Template</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professionally designed resume templates, crafted for impact.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="bg-card border-2 border-foreground rounded-xl p-0 shadow-neo-white-md hover:shadow-neo-white-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] flex flex-col overflow-hidden group"
              >
                <CardHeader className="p-0 relative aspect-[3/4]">
                  <img
                    src={template.preview || "/placeholder.svg"}
                    alt={`${template.name} template preview`}
                    className="w-full h-full object-cover"
                  />
                  {template.popular && (
                    <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md border border-primary-foreground">
                      Popular
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">{template.name}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-4 flex-grow">
                    {template.description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="relative w-full mt-auto bg-transparent text-foreground border-2 border-foreground font-bold py-2 px-4 rounded-lg shadow-neo-white-sm hover:bg-secondary hover:shadow-neo-white-md transition-all overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <span className="relative z-10">Select Template</span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Selected - Choice Section */}
      <section id="template-selected" className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Great Choice! How to Proceed?</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose your preferred method to create your resume.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: <Edit3 className="h-12 w-12 text-foreground" />,
                title: "Fill Out Form",
                description: "Start from scratch with our guided form.",
                points: ["Step-by-step process", "Structured input fields", "Real-time preview"],
                buttonText: "Start with Form",
                primaryAction: true,
              },
              {
                icon: <Upload className="h-12 w-12 text-foreground" />,
                title: "Upload Existing PDF",
                description: "Upload your PDF, we'll extract and convert.",
                points: ["AI-powered extraction", "Automatic formatting", "Quick and efficient"],
                buttonText: "Upload PDF",
                primaryAction: false,
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
                <ul className="text-muted-foreground space-y-2 mb-6 list-disc list-inside flex-grow">
                  {choice.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Button
                  size="lg"
                  className={`w-full font-bold py-3 px-6 rounded-lg border-2 transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] relative overflow-hidden group ${
                    choice.primaryAction
                      ? "bg-primary text-primary-foreground border-primary-foreground shadow-neo-black-sm hover:shadow-neo-black-md"
                      : "bg-transparent text-foreground border-foreground shadow-neo-white-sm hover:bg-secondary hover:shadow-neo-white-md"
                  }`}
                >
                  <div
                    className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
                      choice.primaryAction ? "bg-white/20" : "bg-white/10"
                    }`}
                  ></div>
                  <span className="relative z-10">{choice.buttonText}</span>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              Why Choose <LatexLogotype /> Resume Builder?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional formatting meets modern convenience.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-card border-2 border-foreground rounded-xl p-6 text-center shadow-neo-white-md hover:shadow-neo-white-lg transition-all hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <div className="inline-block p-3 bg-secondary rounded-full mb-4 border-2 border-foreground shadow-neo-white-sm">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{feature.title}</h4>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-4">How It Works</h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to your perfect <LatexLogotype /> resume.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Select Template", description: "Choose a template that fits your style." },
              { title: "Choose Method", description: "Fill a form or upload an existing PDF." },
              { title: "Input Information", description: "Provide details or let AI extract them." },
              { title: "Generate & Download", description: "Get your LaTeX code and PDF." },
            ].map((step, index) => (
              <Card
                key={index}
                className="bg-card border-2 border-foreground rounded-xl p-6 text-center shadow-neo-white-md"
              >
                <div className="bg-primary text-primary-foreground rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl border-2 border-primary-foreground mx-auto mb-4 shadow-neo-black-sm">
                  {index + 1}
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{step.title}</h4>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground mb-6">
            Ready to Build Your Perfect Resume?
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join professionals who trust <LatexLogotype /> Resume Builder.
          </p>
          <Button
            size="lg"
            className="relative bg-primary text-primary-foreground font-bold py-4 px-10 rounded-lg border-2 border-primary-foreground shadow-neo-black-sm hover:shadow-neo-black-md transition-all text-lg hover:translate-x-[-1px] hover:translate-y-[-1px] overflow-hidden group"
            onClick={() => document.getElementById("templates")?.scrollIntoView({ behavior: "smooth" })}
          >
            <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            <span className="relative z-10 flex items-center">
              Choose Your Template <ArrowRight className="ml-3 h-6 w-6" />
            </span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-subtle-border py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2.5 mb-6 md:mb-0">
              <FileText className="h-7 w-7 text-foreground" />
              <span className="text-xl font-black text-foreground">
                <LatexLogotype /> Resume Builder
              </span>
            </div>
            <div className="flex space-x-6">
              {["Privacy", "Terms", "Support"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-base font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
          <div className="text-center text-muted-foreground mt-10 text-sm">
            &copy; {new Date().getFullYear()} <LatexLogotype /> Resume Builder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
