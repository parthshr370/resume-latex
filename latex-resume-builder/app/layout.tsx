import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "LaTeX Resume Builder - Neobrutalist",
  description: "Create professional LaTeX resumes with a dark neobrutalist theme.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn("min-h-screen bg-background text-foreground font-sans antialiased", inter.variable)}>
        {children}
      </body>
    </html>
  )
}
