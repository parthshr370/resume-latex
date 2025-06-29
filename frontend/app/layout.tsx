import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "LaTeX Resume Builder - Brutalist Design",
  description: "Create professional LaTeX resumes with a bold brutalist theme.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={cn("min-h-screen bg-background text-foreground font-sans antialiased")}>
        {children}
      </body>
    </html>
  )
}
