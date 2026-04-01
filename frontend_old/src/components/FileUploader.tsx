import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, X, Sparkles } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative glass-card p-8 cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-primary border-2 shadow-[0_0_30px_hsl(265_90%_65%/0.4)]' 
            : 'border border-border hover:border-primary/50 hover:shadow-[0_0_20px_hsl(265_90%_65%/0.2)]'
          }
          ${isProcessing ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`
            p-4 rounded-full bg-primary/10 
            ${isDragging ? 'animate-pulse-glow' : ''}
          `}>
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div>
            <p className="text-lg font-semibold text-foreground">
              {isDragging ? 'Drop your file here' : 'Drag & drop your data file'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse • CSV, Excel, JSON supported
            </p>
          </div>
        </div>

        {/* Animated border effect */}
        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
          <div className={`
            absolute inset-0 opacity-0 transition-opacity duration-300
            ${isDragging ? 'opacity-100' : ''}
          `}>
            <div className="absolute inset-0 border-cosmic rounded-xl" />
          </div>
        </div>
      </div>

      {/* Selected file display */}
      {selectedFile && (
        <div className="mt-4 glass-card p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <FileSpreadsheet className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!isProcessing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Upload button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpload();
            }}
            disabled={isProcessing}
            className="w-full mt-4 btn-cosmic flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
                <span>Processing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Start Data Cleaning</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
