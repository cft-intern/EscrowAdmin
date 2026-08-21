import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Image, FileText, Video, Music } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils';
import { useNotifications } from '@/hooks/useNotifications';

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  acceptedFileTypes?: {
    [key: string]: string[];
  };
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  preview?: string;
}

export function FileUpload({
  onFilesChange,
  acceptedFileTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.csv'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  },
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  showPreview = true,
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { success, error } = useNotifications();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const { file, errors } = rejection;
      errors.forEach((err: any) => {
        if (err.code === 'file-too-large') {
          error(`File "${file.name}" is too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
        } else if (err.code === 'file-invalid-type') {
          error(`File "${file.name}" has an invalid type`);
        } else if (err.code === 'too-many-files') {
          error(`Too many files. Maximum is ${maxFiles} files`);
        } else {
          error(`Error uploading "${file.name}": ${err.message}`);
        }
      });
    });

    // Handle accepted files
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'uploading',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setUploadedFiles((prev) => {
      const updated = [...prev, ...newFiles];
      onFilesChange?.(updated.map((f) => f.file));
      return updated;
    });

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });

    if (acceptedFiles.length > 0) {
      success(`${acceptedFiles.length} file(s) uploaded successfully`);
    }
  }, [maxFileSize, maxFiles, onFilesChange, success, error]);

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) => 
        prev.map((file) => {
          if (file.id === fileId) {
            const newProgress = Math.min(file.progress + Math.random() * 30, 100);
            if (newProgress >= 100) {
              clearInterval(interval);
              return { ...file, progress: 100, status: 'completed' };
            }
            return { ...file, progress: newProgress };
          }
          return file;
        })
      );
    }, 100);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((file) => file.id !== fileId);
      onFilesChange?.(updated.map((f) => f.file));
      return updated;
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    if (fileType.startsWith('audio/')) return Music;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize: maxFileSize,
    disabled,
  });

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        
        {isDragActive ? (
          <p className="text-lg">Drop the files here...</p>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum {maxFiles} files, up to {maxFileSize / 1024 / 1024}MB each
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: Images, PDFs, Documents, Text files
            </p>
          </div>
        )}
      </div>

      {/* File Preview */}
      {showPreview && uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file.type);
              return (
                <div
                  key={uploadedFile.id}
                  className="flex items-center space-x-3 p-3 bg-muted rounded-lg"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {uploadedFile.preview ? (
                      <img
                        src={uploadedFile.preview}
                        alt={uploadedFile.file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-background rounded flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Progress Bar */}
                    {uploadedFile.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={uploadedFile.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round(uploadedFile.progress)}% uploaded
                        </p>
                      </div>
                    )}
                    
                    {uploadedFile.status === 'completed' && (
                      <p className="text-xs text-green-600 mt-1">Upload complete</p>
                    )}
                    
                    {uploadedFile.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">Upload failed</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadedFile.id)}
                    className="flex-shrink-0 p-1 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Actions */}
      {uploadedFiles.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {uploadedFiles.filter(f => f.status === 'completed').length} of {uploadedFiles.length} files completed
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadedFiles([])}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}