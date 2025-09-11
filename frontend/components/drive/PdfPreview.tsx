"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DriveFile } from '@/types/drive';
import { DriveService } from '@/services/DriveService';
import { Spinner } from '@/components/ui/spinner';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, MoreVertical } from 'lucide-react';
import dynamic from 'next/dynamic';
import { pdfjs } from 'react-pdf';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import required CSS files for text and annotation layers
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

// Load the built-in worker
import 'pdfjs-dist/build/pdf.worker.min.mjs';

// Use dynamic imports to prevent SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
});

const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false,
});

interface PdfPreviewProps {
  file: DriveFile;
  onClose: () => void;
}

export function PdfPreview({ file, onClose }: PdfPreviewProps) {
  const isMobile = useIsMobile(); // Call the hook at the top level
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);

  useEffect(() => {
    const loadPdfContent = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      
      try {
        const pdfData = await DriveService.previewPdfFile(file.id);
        setPdfUrl(pdfData.pdfUrl);
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (err.response?.status === 404) {
          setError('PDF preview endpoint not found. Please make sure the backend API is properly configured.');
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError('Failed to load PDF. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPdfContent();
  }, [file.id]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    if (!numPages) return;
    
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.2, 2.5));
  };

  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.2, 0.5));
  };
  
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = file.name;
      link.target = '_blank';
      link.click();
    }
  };

  // Memoize options to prevent unnecessary re-renders
  const documentOptions = useMemo(() => ({
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/standard_fonts/',
  }), []);

  return (
    <div className="w-full">
      <style jsx>{`
        .pdf-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background-color: rgba(229, 231, 235, 0.5);
          border-radius: 0.375rem;
          overflow: auto;
          height: ${isMobile ? '50vh' : '70vh'};
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
        }
        
        .pdf-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .pdf-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .pdf-container::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 4px;
        }
        
        .pdf-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(155, 155, 155, 0.8);
        }
      `}</style>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-medium text-ellipsis overflow-hidden max-w-full sm:max-w-[60%]">{file.name}</h3>
        
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={zoomOut} disabled={scale <= 0.5}>
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </DropdownMenuItem>
              <DropdownMenuItem onClick={zoomIn} disabled={scale >= 2.5}>
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4 mr-2" />
              Zoom Out
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={zoomIn}
              disabled={scale >= 2.5}
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              Zoom In
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div>
          <div className="pdf-container">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => {
                console.error('Error loading PDF document:', err);
                setError('Failed to load PDF: ' + err.message);
              }}
              loading={<Spinner />}
              error={<div className="text-destructive">Failed to load PDF document.</div>}
              className="pdf-document"
              options={documentOptions}
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                className="page"
                renderTextLayer={!isMobile} // Disable text layer on mobile for better performance
                renderAnnotationLayer={!isMobile} // Disable annotations on mobile for better performance
                width={isMobile ? window.innerWidth - 40 : undefined} // Adjust width on mobile
              />
            </Document>
          </div>
          
          {numPages && (
            <div className="flex justify-center items-center flex-wrap gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={previousPage}
                disabled={pageNumber <= 1}
                className="min-w-[100px]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <p className="text-sm px-2">
                Page {pageNumber} of {numPages}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="min-w-[100px]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
