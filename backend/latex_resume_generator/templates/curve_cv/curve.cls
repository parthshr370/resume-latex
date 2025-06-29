% curve.cls - Minimal document class for Curve CV template
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{curve}[2024/01/01 Curve CV Class]

% Base class
\DeclareOption{a4paper}{\PassOptionsToClass{a4paper}{article}}
\DeclareOption{letterpaper}{\PassOptionsToClass{letterpaper}{article}}
\DeclareOption{11pt}{\PassOptionsToClass{11pt}{article}}
\DeclareOption{12pt}{\PassOptionsToClass{12pt}{article}}
\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax
\LoadClass{article}

% Required packages
\RequirePackage{geometry}
\RequirePackage{array}
\RequirePackage{longtable}
\RequirePackage{xparse}
\RequirePackage{iftex}

% Page setup
\geometry{margin=2cm}
\pagestyle{empty}

% Conditional for XeLaTeX/LuaLaTeX
\newif\ifxetexorluatex
\ifxetex
  \xetexorluatextrue
\else
  \ifluatex
    \xetexorluatextrue
  \else
    \xetexorluatexfalse
  \fi
\fi

% Define rubric environment - simple version without table
\newenvironment{rubric}[1]{%
  \subsection*{#1}%
}{%
  \par\vspace{0.5em}%
}

% Define eventlist environment with longtable
\newenvironment{eventlist}{%
  \begin{longtable}{@{}p{0.2\textwidth}@{\hspace{0.02\textwidth}}p{0.78\textwidth}@{}}%
}{%
  \end{longtable}%
}

% Define event command
\newcommand{\event}[5]{%
  \textbf{#1} & \textbf{#2} \newline
  \textit{#3}, #4 \newline
  #5 \\[0.5em]
}

% Define other commands used in the template
\newcommand{\makefield}[2]{#1 #2}
\newcommand{\mynames}[1]{}
\newcommand{\leftheader}[1]{\gdef\@leftheader{#1}}
\newcommand{\rightheader}[1]{\gdef\@rightheader{#1}}
\newcommand{\photo}[2][l]{}
\newcommand{\photoscale}[1]{}
\newcommand{\makeheaders}[1][c]{%
  \begin{center}
    \@leftheader
  \end{center}
  \vspace{1em}
}
\newcommand{\makerubric}[1]{}

% Title formatting
\renewcommand{\title}[1]{\gdef\@title{#1}}

% Provide dummy bibliography commands
\newcommand{\addbibresource}[1]{}
\newcommand{\DefineBibliographyStrings}[2]{}
\newcommand{\PassOptionsToPackage}[2]{}

\endinput 