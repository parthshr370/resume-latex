#!/usr/bin/env python3
"""
Script to run the Enhanced Resume Generator API
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Import the enhanced API
from backend.enhanced_main_api import app

def main():
    print("🚀 Starting Enhanced Resume Generator API...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔧 Enhanced endpoints:")
    print("   - /api/parse-and-enhance")
    print("   - /api/generate-enhanced-latex")
    print("\n💡 Make sure you have:")
    print("   - API_KEY set in your .env file")
    print("   - pdflatex installed for PDF compilation")
    print("\n" + "="*50)
    
    # Check for API key
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.getenv("API_KEY")
    
    if not api_key:
        print("❌ ERROR: API_KEY not found in .env file!")
        print("Please create a .env file with your API_KEY")
        return
    
    print("✅ API_KEY found")
    
    # Run the server
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )

if __name__ == "__main__":
    main() 