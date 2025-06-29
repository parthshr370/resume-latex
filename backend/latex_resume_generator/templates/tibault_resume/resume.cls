% resume.cls - Resume class file for tibault_resume template
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2024/01/01 Resume class]

% Load base class
\DeclareOption{margin}{\def\@margin{margin}}
\DeclareOption{line}{\def\@line{line}}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax
\LoadClass[11pt]{article}

% Required packages
\RequirePackage{geometry}
\RequirePackage{array}
\RequirePackage{ifthen}

% Page setup
\geometry{
    letterpaper,
    left=0.5in,
    right=0.5in,
    top=0.5in,
    bottom=0.5in
}

% Remove page numbers
\pagestyle{empty}

% Define resume environment
\newenvironment{resume}{
    \begingroup
    \vspace*{-10pt}
}{
    \endgroup
}

% Section formatting
\newcommand{\section}[1]{
    \vspace{0.2cm}
    {\large\bfseries #1}
    \vspace{0.1cm}
    \hrule
    \vspace{0.1cm}
}

% Custom commands
\newcommand{\mysidestyle}{}

% List environments
\newenvironment{list2}{
    \begin{itemize}
    \setlength{\itemsep}{0pt}
    \setlength{\parsep}{0pt}
    \setlength{\topsep}{0pt}
    \setlength{\partopsep}{0pt}
    \setlength{\leftmargin}{1em}
}{
    \end{itemize}
}

\endinput 