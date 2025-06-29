#!/usr/bin/env python3
"""
Test script to verify PDF integration with the enhanced backend API
"""

import requests
import os
import json
from pathlib import Path

# Configuration
API_BASE_URL = "http://localhost:8000"
TEST_PDF_PATH = "test_resume.pdf"  # You'll need to place a test PDF here

def test_pdf_to_latex_pipeline():
    """Test the complete PDF to LaTeX pipeline with template support"""
    
    print("🚀 Testing PDF to LaTeX Pipeline with Enhanced Backend")
    print("=" * 60)
    
    # Check if test PDF exists
    if not os.path.exists(TEST_PDF_PATH):
        print(f"❌ Test PDF not found at {TEST_PDF_PATH}")
        print("Please place a test resume PDF at this location")
        return
    
    # Step 1: Parse and enhance PDF
    print("\n📄 Step 1: Uploading and parsing PDF...")
    with open(TEST_PDF_PATH, 'rb') as f:
        files = {'file': ('test_resume.pdf', f, 'application/pdf')}
        data = {'enhance': 'true'}
        
        response = requests.post(
            f"{API_BASE_URL}/api/parse-and-enhance",
            files=files,
            data=data
        )
    
    if response.status_code != 200:
        print(f"❌ Failed to parse PDF: {response.status_code}")
        print(response.json())
        return
    
    parse_result = response.json()
    print("✅ PDF parsed and enhanced successfully")
    print(f"   - Original data length: {len(parse_result['original_json'])} chars")
    print(f"   - Enhanced data length: {len(parse_result['enhanced_json'])} chars")
    print(f"   - Markdown length: {len(parse_result['markdown_str'])} chars")
    
    # Step 2: Generate LaTeX with different templates
    templates = ['jakes_resume', 'deedy_resume', 'curve_cv', 'tibault_resume']
    
    for template in templates:
        print(f"\n🎨 Step 2: Generating LaTeX with template: {template}")
        
        data = {
            'markdown_str': parse_result['markdown_str'],
            'enhanced_data_json': parse_result['enhanced_json'],
            'template_name': template
        }
        
        response = requests.post(
            f"{API_BASE_URL}/api/generate-enhanced-latex",
            data=data
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to generate LaTeX for {template}: {response.status_code}")
            error_detail = response.json().get('detail', {})
            if isinstance(error_detail, dict):
                print(f"   Error: {error_detail.get('message', 'Unknown error')}")
                if 'log' in error_detail:
                    print(f"   Compilation log: {error_detail['log'][:200]}...")
            else:
                print(f"   Error: {error_detail}")
            continue
        
        latex_result = response.json()
        print(f"✅ LaTeX generated for {template}")
        print(f"   - LaTeX length: {len(latex_result['latex_str'])} chars")
        print(f"   - PDF size: {len(latex_result['pdf_b64']) * 3 / 4 / 1024:.1f} KB (approx)")
        
        # Save the PDF for inspection
        output_dir = Path(f"test_output/{template}")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Decode and save PDF
        import base64
        pdf_bytes = base64.b64decode(latex_result['pdf_b64'])
        pdf_path = output_dir / "resume.pdf"
        with open(pdf_path, 'wb') as f:
            f.write(pdf_bytes)
        print(f"   - PDF saved to: {pdf_path}")
        
        # Save LaTeX for inspection
        tex_path = output_dir / "resume.tex"
        with open(tex_path, 'w') as f:
            f.write(latex_result['latex_str'])
        print(f"   - LaTeX saved to: {tex_path}")
    
    print("\n✅ All tests completed!")
    print("Check the test_output directory for generated files")

if __name__ == "__main__":
    test_pdf_to_latex_pipeline() 