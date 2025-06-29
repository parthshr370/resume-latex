# LaTeX Resume Builder - Dependencies and Troubleshooting Guide

This document provides a comprehensive guide to all dependencies required for the LaTeX Resume Builder system and solutions to common errors you might encounter.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Required Dependencies](#required-dependencies)
3. [Template-Specific Requirements](#template-specific-requirements)
4. [Common Compilation Errors](#common-compilation-errors)
5. [API and Backend Issues](#api-and-backend-issues)
6. [Font-Related Issues](#font-related-issues)
7. [Platform-Specific Instructions](#platform-specific-instructions)

## System Requirements

### Operating Systems
- **Linux**: Ubuntu 20.04+, Fedora 34+, Arch Linux, or any modern distribution
- **macOS**: 10.15 (Catalina) or later
- **Windows**: Windows 10/11 with WSL2 recommended

### Python Requirements
- Python 3.8 or higher
- pip package manager
- Virtual environment support (venv or conda)

## Required Dependencies

### 1. LaTeX Distribution

You need a complete LaTeX distribution installed:

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install texlive-full

# Fedora
sudo dnf install texlive-scheme-full

# Arch Linux
sudo pacman -S texlive-most texlive-lang
```

#### macOS
```bash
# Using Homebrew
brew install --cask mactex

# Or download from: https://www.tug.org/mactex/
```

#### Windows
- Install MiKTeX: https://miktex.org/download
- Or TeX Live: https://www.tug.org/texlive/windows.html

### 2. Essential LaTeX Packages

The following LaTeX packages must be installed:

```
- geometry          # Page layout
- hyperref          # Hyperlinks
- fontspec          # Font selection (XeLaTeX/LuaLaTeX)
- xcolor            # Color support
- graphicx          # Graphics inclusion
- array             # Enhanced tables
- longtable         # Multi-page tables
- titlesec          # Section formatting
- enumitem          # List customization
- fontawesome5      # Icons
- simpleicons       # Additional icons
- comment           # Conditional content
- xparse            # Advanced command definitions
- iftex             # Engine detection
```

### 3. Python Dependencies

Backend requirements (`requirements.txt`):
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0
langchain==0.0.340
langchain-google-genai==0.0.5
google-generativeai==0.3.0
pydantic==2.5.0
PyPDF2==3.0.1
rich==13.7.0
```

### 4. Compilation Engines

Different templates require different engines:

| Template | Engine | Install Command |
|----------|--------|-----------------|
| Jake's Resume | pdflatex | Included in texlive |
| Deedy Resume | pdflatex/xelatex | Included in texlive |
| Curve CV | pdflatex | Included in texlive |
| Tibault Resume | pdflatex | Included in texlive |

## Template-Specific Requirements

### Jake's Resume
- Standard LaTeX packages
- No special fonts required
- Works with pdflatex

### Deedy Resume
- Originally designed for XeLaTeX
- Modified to work with pdflatex
- Uses system fonts (DejaVu Sans, Liberation Sans)
- Requires: `fontspec`, `xcolor`, `hyperref`

### Curve CV
- Custom class file (`curve.cls`)
- Requires: `fontawesome5`, `simpleicons`
- Works with pdflatex
- No special fonts required

### Tibault Resume
- Custom class file (`resume.cls`)
- French language support: `babel`
- Works with pdflatex

## Common Compilation Errors

### 1. Missing Package Errors

**Error**: `! LaTeX Error: File 'package.sty' not found.`

**Solution**:
```bash
# Install missing package
sudo tlmgr install package-name

# Or install full texlive
sudo apt-get install texlive-full
```

### 2. Font Not Found (XeLaTeX)

**Error**: `Package fontspec Error: The font "FontName" cannot be found`

**Solutions**:
1. Install the required font system-wide
2. Use fallback fonts:
```latex
\setmainfont{DejaVu Serif}
\setsansfont{DejaVu Sans}
```
3. Switch to pdflatex compilation

### 3. Missing Character Errors

**Error**: `Missing character: There is no ... in font ...`

**Solution**:
- Ensure proper font encoding
- Add `\usepackage[T1]{fontenc}` for pdflatex
- Use Unicode-aware engine (XeLaTeX/LuaLaTeX)

### 4. Command Already Defined

**Error**: `LaTeX Error: Command \commandname already defined`

**Solution**:
- Use `\providecommand` instead of `\newcommand`
- Check for duplicate package loading
- Ensure class files don't conflict

### 5. Undefined Control Sequence

**Error**: `! Undefined control sequence.`

**Solution**:
- Check spelling of LaTeX commands
- Ensure required packages are loaded
- Verify custom commands are defined before use

## API and Backend Issues

### 1. API Key Not Found

**Error**: `API_KEY not found on server`

**Solution**:
```bash
# Create .env file in backend directory
echo "API_KEY=your_google_api_key_here" > backend/.env
```

### 2. Module Import Errors

**Error**: `ModuleNotFoundError: No module named 'module_name'`

**Solution**:
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt
```

### 3. LaTeX Compilation Timeout

**Error**: `subprocess.TimeoutExpired`

**Solution**:
- Increase timeout in `compile_latex_to_pdf` function
- Simplify LaTeX document
- Check for infinite loops in LaTeX

### 4. PDF Generation Failed

**Error**: `Failed to compile LaTeX to PDF`

**Solution**:
1. Check LaTeX syntax
2. Verify all dependencies installed
3. Check compilation logs in `output/template_name/enhanced_resume.log`
4. Try manual compilation:
```bash
cd output/template_name
pdflatex enhanced_resume.tex
```

## Font-Related Issues

### System Font Installation

#### Linux
```bash
# Copy fonts to system directory
sudo cp *.ttf /usr/share/fonts/truetype/
sudo fc-cache -f -v
```

#### macOS
```bash
# Copy to user fonts
cp *.ttf ~/Library/Fonts/
```

#### Windows
- Right-click font file → Install

### Font Fallbacks

Add to your template:
```latex
\usepackage{iftex}
\ifxetex
  \usepackage{fontspec}
  \setmainfont[
    BoldFont={* Bold},
    ItalicFont={* Italic},
    BoldItalicFont={* Bold Italic}
  ]{DejaVu Serif}
\else
  \usepackage[T1]{fontenc}
  \usepackage{lmodern}
\fi
```

## Platform-Specific Instructions

### Linux

1. **Missing LaTeX packages**:
```bash
# Update package database
sudo tlmgr update --self
sudo tlmgr update --all

# Install specific package
sudo tlmgr install package-name
```

2. **Permission issues**:
```bash
# Fix permissions
sudo chown -R $USER:$USER ~/.texlive
```

### macOS

1. **Path issues**:
```bash
# Add TeX to PATH
export PATH="/Library/TeX/texbin:$PATH"
echo 'export PATH="/Library/TeX/texbin:$PATH"' >> ~/.zshrc
```

2. **Font issues with XeLaTeX**:
```bash
# Clear font cache
sudo atsutil databases -remove
sudo atsutil server -shutdown
sudo atsutil server -ping
```

### Windows (WSL2)

1. **Install texlive in WSL**:
```bash
sudo apt-get update
sudo apt-get install texlive-full
```

2. **Path configuration**:
```bash
# Add to ~/.bashrc
export PATH="/usr/local/texlive/2023/bin/x86_64-linux:$PATH"
```

## Debugging Tips

### 1. Enable Verbose Output
```python
# In compile_latex_to_pdf function
process = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
print(f"STDOUT: {process.stdout}")
print(f"STDERR: {process.stderr}")
```

### 2. Check LaTeX Log Files
```bash
# View compilation log
cat output/template_name/enhanced_resume.log | grep -i "error\|warning"
```

### 3. Test Manual Compilation
```bash
cd output/template_name
pdflatex -interaction=nonstopmode enhanced_resume.tex
```

### 4. Verify Package Installation
```bash
# List installed packages
tlmgr list --installed

# Search for package
tlmgr search --global package-name
```

## Quick Fixes

### Reset and Reinstall
```bash
# Clean LaTeX cache
rm -rf ~/.texlive/texmf-var/web2c/

# Reinstall texlive
sudo apt-get remove --purge texlive*
sudo apt-get install texlive-full
```

### Emergency Fallback
If all else fails, use Overleaf.com for compilation and download the PDF.

## Support Resources

1. **LaTeX Stack Exchange**: https://tex.stackexchange.com/
2. **CTAN (Package Repository)**: https://ctan.org/
3. **TeX Users Group**: https://tug.org/
4. **Project Issues**: Report at your GitHub repository

## Version Compatibility

| Component | Minimum Version | Recommended Version |
|-----------|----------------|-------------------|
| Python | 3.8 | 3.10+ |
| TeX Live | 2020 | 2023+ |
| Node.js | 16.x | 18.x+ |
| pdflatex | 3.14159265 | Latest |
| XeLaTeX | 0.99998 | Latest |

## Maintenance Commands

### Update All Components
```bash
# Update TeX packages
sudo tlmgr update --self --all

# Update Python packages
pip install --upgrade -r requirements.txt

# Update system packages
sudo apt-get update && sudo apt-get upgrade
```

### Clean Build Artifacts
```bash
# Remove auxiliary files
find . -name "*.aux" -o -name "*.log" -o -name "*.out" | xargs rm -f

# Clear output directories
rm -rf backend/latex_resume_generator/output/*/
```

---

**Note**: This guide covers most common scenarios. For template-specific issues, refer to the individual template documentation or create an issue in the project repository. 