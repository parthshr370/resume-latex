"use client";

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
  pdfData: string; // Base64 encoded PDF
  className?: string;
}

export function PDFViewer({ pdfData, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up the worker
    const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setIsLoading(false);
    setError('Failed to load PDF. Please try downloading it instead.');
  };

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      if (numPages) {
        return Math.max(1, Math.min(newPageNumber, numPages));
      }
      return prevPageNumber;
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 3));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);
  const rotate = () => setRotation(prevRotation => (prevRotation + 90) % 360);

  // Convert base64 to data URL
  const pdfDataUrl = `data:application/pdf;base64,${pdfData}`;

  // If there's an error with the PDF viewer, show a fallback
  if (error) {
    return (
      <div className={cn("flex flex-col h-full items-center justify-center bg-gray-50", className)}>
        <div className="text-center p-8 max-w-md">
          <p className="text-lg font-medium text-gray-900 mb-2">PDF Preview Unavailable</p>
          <p className="text-sm text-gray-600 mb-4">
            The PDF preview is not available in your browser. Please download the PDF to view it.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              const blob = new Blob(
                [Uint8Array.from(atob(pdfData), c => c.charCodeAt(0))], 
                { type: 'application/pdf' }
              );
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'resume.pdf';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            Page {pageNumber} of {numPages || '...'}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetZoom}
            className="min-w-[60px]"
          >
            {Math.round(scale * 100)}%
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="outline"
            size="icon"
            onClick={rotate}
            className="h-8 w-8"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF Document */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          <Document
            file={pdfDataUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
            error={
              <div className="text-center p-8">
                <p className="text-destructive font-medium mb-2">Failed to load PDF</p>
                <p className="text-sm text-muted-foreground">Please try downloading the PDF instead</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
} 