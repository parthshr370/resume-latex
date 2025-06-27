import streamlit as st
import json
import os
import subprocess
import base64
import sys
from dotenv import load_dotenv

# Add the project root to the Python path to allow running from subdirectories
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.latex_resume_generator.agents.resume_parser import ResumeParser
from backend.latex_resume_generator.agents.latex_generator import LaTeXGenerator
from backend.latex_resume_generator.utils.pdf_reader import extract_text_from_pdf

# Function to load API Key
def get_api_key():
    # Load from the project root .env file
    load_dotenv(os.path.join(PROJECT_ROOT, '.env'))
    api_key = os.getenv("API_KEY")
    if not api_key:
        st.error("API_KEY not found. Please create a .env file in the project root directory.")
        st.stop()
    return api_key

# Function to compile LaTeX to PDF
def compile_latex(latex_file, output_dir):
    """Compiles a .tex file to a .pdf using pdflatex."""
    st.info("Compiling LaTeX to PDF... This may take a moment.")
    try:
        command = ["pdflatex", "-output-directory", output_dir, "-interaction=nonstopmode", latex_file]
        process = subprocess.run(command, check=True, capture_output=True, text=True, timeout=30)
        return True, process.stdout
    except FileNotFoundError:
        st.error("`pdflatex` command not found. Please install a LaTeX distribution (like MiKTeX, TeX Live, or MacTeX).")
        return False, "pdflatex not found."
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as e:
        st.error("An error occurred during PDF compilation.")
        log_output = e.stdout + "\n" + e.stderr if hasattr(e, 'stderr') else "The process timed out."
        st.code(log_output, language='log')
        return False, log_output

def get_resume_text_from_form():
    """Gathers all form data into a single string for the parser."""
    text = ""
    # Personal Info
    text += f"Name: {st.session_state.personal_info['name']}\n"
    text += f"Email: {st.session_state.personal_info['email']}\n"
    text += f"Phone: {st.session_state.personal_info['phone']}\n"
    text += f"Location: {st.session_state.personal_info['location']}\n"
    text += f"LinkedIn: {st.session_state.personal_info['linkedin']}\n"
    text += f"GitHub: {st.session_state.personal_info['github']}\n\n"

    # Summary
    text += f"--- Summary ---\n{st.session_state.summary}\n\n"

    # Experience
    text += "--- Experience ---\n"
    for exp in st.session_state.experience:
        text += f"\nCompany: {exp['company']}\n"
        text += f"Position: {exp['position']}\n"
        text += f"Dates: {exp['start_date']} - {exp['end_date']}\n"
        text += "Responsibilities:\n"
        for resp in exp['responsibilities']:
            text += f"- {resp}\n"
    
    # Education
    text += "\n--- Education ---\n"
    for edu in st.session_state.education:
        text += f"\nInstitution: {edu['institution']}\n"
        text += f"Degree: {edu['degree']}\n"
        text += f"Dates: {edu['start_date']} - {edu['end_date']}\n"
        
    # Projects
    text += "\n--- Projects ---\n"
    for proj in st.session_state.projects:
        text += f"\nProject: {proj['name']}\n"
        text += f"Description: {proj['description']}\n"
        text += "Technologies:\n"
        for tech in proj['technologies']:
            text += f"- {tech}\n"

    # Skills
    text += "\n--- Skills ---\n"
    text += f"Technical Skills: {', '.join(st.session_state.skills['technical'])}\n"
    text += f"Soft Skills: {', '.join(st.session_state.skills['soft'])}\n"
    
    # Additional Text
    if st.session_state.raw_text:
        text += f"\n--- Additional Information ---\n{st.session_state.raw_text}\n"
        
    return text.strip()

# --- Streamlit App ---
st.set_page_config(layout="wide", page_title="AI LaTeX Resume Generator")
st.title("📄 AI-Powered LaTeX Resume Generator")

# Initialize Session State
st.session_state.setdefault('personal_info', {"name": "John Doe", "email": "john.doe@email.com", "phone": "123-456-7890", "location": "San Francisco, CA", "linkedin": "linkedin.com/in/johndoe", "github": "github.com/johndoe"})
st.session_state.setdefault('summary', "Experienced software engineer with a passion for building scalable and maintainable systems.")
st.session_state.setdefault('experience', [{"company": "Tech Innovations", "position": "Senior Software Engineer", "start_date": "Jan 2020", "end_date": "Present", "responsibilities": ["Led the development of a new microservices architecture.", "Mentored junior engineers."]} ])
st.session_state.setdefault('education', [{"institution": "University of Example", "degree": "M.S. in Computer Science", "start_date": "2018", "end_date": "2020"}])
st.session_state.setdefault('projects', [{"name": "AI Chatbot", "description": "Developed a customer service chatbot.", "technologies": ["Python", "TensorFlow", "Docker"]}])
st.session_state.setdefault('skills', {"technical": ["Python", "Go", "React"], "soft": ["Team Leadership", "Agile Methodologies"]})
st.session_state.setdefault('raw_text', "")
st.session_state.setdefault('generation_complete', False)

# --- Main App Flow ---
if st.session_state.generation_complete:
    # --- RESULTS PAGE ---
    st.header("✅ Your Resume is Ready!")

    col1, col2 = st.columns(2)
    pdf_path = os.path.join(PROJECT_ROOT, "backend/latex_resume_generator/output/resume.pdf")

    with col1:
        st.subheader("📄 PDF Preview")
        compiled, log = compile_latex(st.session_state.tex_path, os.path.dirname(pdf_path))
        if compiled and os.path.exists(pdf_path):
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            st.session_state.pdf_bytes = pdf_bytes
            base64_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
            pdf_display = f'<iframe src="data:application/pdf;base64,{base64_pdf}" width="100%" height="800" type="application/pdf"></iframe>'
            st.markdown(pdf_display, unsafe_allow_html=True)
        else:
            st.warning("Could not generate PDF preview.")

    with col2:
        st.subheader("📝 Parsed Data (JSON)")
        st.json(st.session_state.json_content)
        st.subheader("✍️ Generated LaTeX")
        st.code(st.session_state.latex_content, language='latex')

    st.header("📦 Download Your Files")
    c1, c2, c3 = st.columns(3)
    if 'pdf_bytes' in st.session_state:
      c1.download_button("Download PDF", st.session_state.pdf_bytes, "resume.pdf", "application/pdf")
    c2.download_button("Download .tex", st.session_state.latex_content, "resume.tex", "application/x-latex")
    c3.download_button("Download .json", st.session_state.json_content, "resume_structured.json", "application/json")
    
    st.divider()
    if st.button("⬅️ Back to Editor", use_container_width=True):
        st.session_state.generation_complete = False
        st.rerun()

else:
    # --- FORM PAGE ---
    st.info("Fill out the form below, or upload a PDF to auto-fill, then click 'Generate Resume'.")
    
    # --- PDF Uploader ---
    uploaded_file = st.file_uploader("📄 Upload Your Resume PDF", type="pdf")
    if uploaded_file is not None:
        # To read file as bytes:
        extracted_text = extract_text_from_pdf(uploaded_file)
        # Populate the raw_text field, which is then used by the parser
        st.session_state.raw_text = extracted_text
        st.success("✅ PDF content has been extracted and placed in the 'Additional Details' section below.")

    with st.container(border=True):
        # --- Personal Info ---
        with st.expander("👤 Personal Information", expanded=True):
            st.session_state.personal_info['name'] = st.text_input("Full Name", st.session_state.personal_info['name'])
            st.session_state.personal_info['email'] = st.text_input("Email", st.session_state.personal_info['email'])
            st.session_state.personal_info['phone'] = st.text_input("Phone", st.session_state.personal_info['phone'])
            st.session_state.personal_info['location'] = st.text_input("Location", st.session_state.personal_info['location'])
            st.session_state.personal_info['linkedin'] = st.text_input("LinkedIn URL", st.session_state.personal_info['linkedin'])
            st.session_state.personal_info['github'] = st.text_input("GitHub URL", st.session_state.personal_info['github'])

        # --- Summary ---
        with st.expander("📝 Professional Summary", expanded=True):
            st.session_state.summary = st.text_area("Summary", st.session_state.summary, height=150)

        # --- Experience ---
        st.subheader("💼 Experience")
        for i, exp in enumerate(st.session_state.experience):
            with st.container(border=True):
                c1, c2, c3 = st.columns([3,3,1])
                c1.text_input("Company", exp['company'], key=f"exp_company_{i}")
                c2.text_input("Position", exp['position'], key=f"exp_position_{i}")
                with c3:
                    st.write("")
                    st.write("")
                    if st.button("❌", key=f"rm_exp_{i}", use_container_width=True):
                        st.session_state.experience.pop(i)
                        st.rerun()

                c1, c2 = st.columns(2)
                c1.text_input("Start Date", exp['start_date'], key=f"exp_start_{i}")
                c2.text_input("End Date", exp['end_date'], key=f"exp_end_{i}")
                st.text_area("Responsibilities (one per line)", "\n".join(exp['responsibilities']), key=f"exp_resp_{i}")
                
        if st.button("Add Experience", use_container_width=True):
            st.session_state.experience.append({"company": "", "position": "", "start_date": "", "end_date": "", "responsibilities": []})
            st.rerun()

        # --- Education ---
        st.subheader("🎓 Education")
        for i, edu in enumerate(st.session_state.education):
            with st.container(border=True):
                c1, c2, c3 = st.columns([3,3,1])
                c1.text_input("Institution", edu['institution'], key=f"edu_inst_{i}")
                c2.text_input("Degree", edu['degree'], key=f"edu_degree_{i}")
                with c3:
                    st.write("")
                    st.write("")
                    if st.button("❌", key=f"rm_edu_{i}", use_container_width=True):
                        st.session_state.education.pop(i)
                        st.rerun()

                c1, c2 = st.columns(2)
                c1.text_input("Start Date", edu['start_date'], key=f"edu_start_{i}")
                c2.text_input("End Date", edu['end_date'], key=f"edu_end_{i}")

        if st.button("Add Education", use_container_width=True):
            st.session_state.education.append({"institution": "", "degree": "", "start_date": "", "end_date": ""})
            st.rerun()

        # --- Projects ---
        st.subheader("🚀 Projects")
        for i, proj in enumerate(st.session_state.projects):
            with st.container(border=True):
                c1, c2 = st.columns([6,1])
                c1.text_input("Project Name", proj['name'], key=f"proj_name_{i}")
                with c2:
                    st.write("")
                    st.write("")
                    if st.button("❌", key=f"rm_proj_{i}", use_container_width=True):
                        st.session_state.projects.pop(i)
                        st.rerun()
                st.text_area("Description", proj['description'], key=f"proj_desc_{i}")
                st.text_area("Technologies (one per line)", "\n".join(proj['technologies']), key=f"proj_tech_{i}")

        if st.button("Add Project", use_container_width=True):
            st.session_state.projects.append({"name": "", "description": "", "technologies": []})
            st.rerun()

        # --- Skills ---
        with st.expander("🛠️ Skills", expanded=True):
            tech_skills_str = st.text_area("Technical Skills (comma-separated)", ", ".join(st.session_state.skills['technical']))
            soft_skills_str = st.text_area("Soft Skills (comma-separated)", ", ".join(st.session_state.skills['soft']))
            # Assign on text change
            st.session_state.skills['technical'] = [s.strip() for s in tech_skills_str.split(",")]
            st.session_state.skills['soft'] = [s.strip() for s in soft_skills_str.split(",")]

        # --- Raw Text ---
        with st.expander("📋 Additional Details (Optional)"):
            st.session_state.raw_text = st.text_area("Paste any other information here", st.session_state.raw_text, height=200)

    st.divider()

    # --- Generate Button ---
    if st.button("✨ Generate Resume", type="primary", use_container_width=True):
        full_resume_text = get_resume_text_from_form()
        api_key = get_api_key()
        output_dir = os.path.join(PROJECT_ROOT, "backend", "latex_resume_generator", "output")
        os.makedirs(output_dir, exist_ok=True)
        
        try:
            with st.spinner("AI is parsing your resume..."):
                parser = ResumeParser(api_key=api_key)
                parsed_data = parser.parse(full_resume_text)
            with st.spinner("AI is generating LaTeX code..."):
                latex_generator = LaTeXGenerator(api_key=api_key)
                latex_content = latex_generator.generate(parsed_data)
            
            # Save files
            json_path = os.path.join(output_dir, "resume_structured.json")
            tex_path = os.path.join(output_dir, "resume.tex")
            with open(json_path, "w") as f: json.dump(parsed_data, f, indent=4)
            with open(tex_path, "w") as f: f.write(latex_content)
            
            # Store results in session state for display
            st.session_state.json_content = json.dumps(parsed_data, indent=4)
            st.session_state.latex_content = latex_content
            st.session_state.tex_path = tex_path
            st.session_state.generation_complete = True
            st.rerun()
            
        except Exception as e:
            st.error(f"An error occurred: {e}")
            st.exception(e)

st.sidebar.markdown("---")
st.sidebar.markdown("Made with ❤️ by an AI assistant.") 