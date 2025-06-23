# Full-Stack Resume Builder

This is a full-stack web application designed to help you create a professional and polished resume with ease. It features a React-based frontend and a Python backend that handles resume data processing and generation.

## Overview

The project is structured as a monorepo with two main parts:

-   `frontend/`: A modern, interactive web interface built with React and Vite.
-   `backend/`: A Python server that provides an API for generating resumes.

## ✨ Features

### Frontend
- **Interactive Form**: A user-friendly, multi-section form to input all your resume details.
- **Live Previews**: See your generated PDF directly in the browser.
- **Multiple Export Options**: Download your resume as a PDF, or get the raw LaTeX code and JSON data.
- **Interactive Skill Selection**: Add technical skills quickly from a curated list of popular technologies or add your own custom skills.
- **Modern UI**: Built with Shadcn/UI and Tailwind CSS for a clean, modern, and responsive interface.

### Backend
- **RESTful API**: An API endpoint to receive resume data and generate the final documents.
- **LaTeX Resume Generation**: Dynamically creates professional-looking resumes in `.tex` format.
- **PDF Conversion**: Converts the generated LaTeX resume into a downloadable PDF.
- **Agentic Orchestration**: (Please add a brief description of what your agentic orchestration does here. For example: "Uses AI agents to parse, analyze, and optimize resume content.")

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

### Backend
- **Language**: [Python](https://www.python.org/)
- **Framework**: (Please specify, e.g., Flask, FastAPI)
- **Key Libraries**: (Please specify, e.g., `PyLaTeX`, `langchain`)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (which includes npm) for the frontend.
- [Python 3.x](https://www.python.org/downloads/) for the backend.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Set up the Frontend:**
    ```sh
    cd frontend
    npm install
    ```

3.  **Set up the Backend:**
    It is recommended to use a virtual environment for the Python dependencies.
    ```sh
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

### Running the Application

1.  **Start the Backend Server:**
    From the `backend` directory, run:
    ```sh
    # Please add the command to run your backend server, e.g.:
    # uvicorn main_api:app --reload
    ```

2.  **Start the Frontend Development Server:**
    In a new terminal, from the `frontend` directory, run:
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`. The frontend expects the backend to be running on `http://localhost:8000`.

---

_This project was bootstrapped with Vite and uses a number of open-source libraries. A big thanks to the creators and maintainers of those projects._
