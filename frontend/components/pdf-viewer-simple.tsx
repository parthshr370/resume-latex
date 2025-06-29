"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFViewerSimpleProps {
  pdfData: string; // Base64 encoded PDF
  className?: string;
}

export function PDFViewerSimple({ pdfData, className }: PDFViewerSimpleProps) {
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    // Create blob URL from base64
    try {
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error creating PDF blob:', error);
      setIsLoading(false);
    }
  }, [pdfData]);

  const handleDownload = () => {
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
  };

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
            disabled={scale >= 2}
            className="h-8 w-8"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        {pdfUrl && (
          <div 
            className="flex justify-center"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full max-w-4xl bg-white shadow-lg"
              style={{ 
                height: `${800 / scale}px`,
                border: 'none',
              }}
              onLoad={() => setIsLoading(false)}
              title="PDF Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
} 