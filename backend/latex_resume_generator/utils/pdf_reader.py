from pypdf import PdfReader
from io import BytesIO

def extract_text_from_pdf(pdf_file: BytesIO) -> str:
    """
    Extracts text content from an uploaded PDF file using pypdf.

    Args:
        pdf_file: A file-like object (BytesIO) from Streamlit's file uploader.

    Returns:
        The extracted text as a single string.
    """
    try:
        # Create a PDF reader object from the in-memory buffer
        reader = PdfReader(pdf_file)
        
        # Initialize an empty list to hold the text from each page
        text_parts = []
        
        # Iterate through each page and extract text
        for page in reader.pages:
            text_parts.append(page.extract_text() or "")
            
        return "\n".join(text_parts)
    
    except Exception as e:
        # Return an error message if something goes wrong
        return f"Error processing PDF file with pypdf: {e}" 