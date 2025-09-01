import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import type { FileUpload as FileUploadType } from '../../types';

interface FileUploadProps {
  onFileUpload: (file: File, message?: string) => Promise<void>;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxFileSize = 10,
  allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  multiple = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<FileUploadType[]>([]);
  const [message, setMessage] = useState('');

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'File type not supported';
    }
    
    return null;
  };

  const createFileUpload = (file: File): FileUploadType => {
    const upload: FileUploadType = {
      file,
      progress: 0,
      status: 'pending',
    };

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploads(prev => 
          prev.map(u => u.file === file ? { ...u, preview: e.target?.result as string } : u)
        );
      };
      reader.readAsDataURL(file);
    }

    return upload;
  };

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const newUploads = fileArray.map(file => {
      const error = validateFile(file);
      const upload = createFileUpload(file);
      
      if (error) {
        return { ...upload, status: 'error' as const, error };
      }
      
      return upload;
    });

    setUploads(prev => [...prev, ...newUploads]);
  }, [maxFileSize, allowedTypes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const removeUpload = (fileToRemove: File) => {
    setUploads(prev => prev.filter(upload => upload.file !== fileToRemove));
  };

  const handleUploadAll = async () => {
    const pendingUploads = uploads.filter(upload => upload.status === 'pending');
    
    for (const upload of pendingUploads) {
      try {
        // Update status to uploading
        setUploads(prev => 
          prev.map(u => u.file === upload.file ? { ...u, status: 'uploading' } : u)
        );

        // Simulate upload progress (replace with real upload logic)
        for (let progress = 10; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploads(prev => 
            prev.map(u => u.file === upload.file ? { ...u, progress } : u)
          );
        }

        await onFileUpload(upload.file, message);

        // Mark as completed
        setUploads(prev => 
          prev.map(u => u.file === upload.file ? { ...u, status: 'completed', progress: 100 } : u)
        );

      } catch (error) {
        // Mark as error
        setUploads(prev => 
          prev.map(u => 
            u.file === upload.file 
              ? { ...u, status: 'error', error: (error as Error).message }
              : u
          )
        );
      }
    }
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
    setMessage('');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-8 h-8 text-blue-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const getStatusIcon = (status: FileUploadType['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (uploads.length === 0) {
    return (
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          onChange={handleFileSelect}
          multiple={multiple}
          accept={allowedTypes.join(',')}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload files"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-gray-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Upload Files
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Drag and drop files here, or{' '}
              <span className="text-blue-500 font-medium">browse</span>
            </p>
            <p className="text-sm text-gray-400">
              Max {maxFileSize}MB • Images, PDFs, Documents
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Message input for uploads */}
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message with your files (optional)..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={3}
          maxLength={500}
        />
      </div>

      {/* File list */}
      <div className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            {/* File icon or preview */}
            <div className="flex-shrink-0">
              {upload.preview ? (
                <img
                  src={upload.preview}
                  alt={upload.file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                getFileIcon(upload.file)
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {upload.file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(upload.file.size)}
              </p>
              
              {/* Progress bar */}
              {upload.status === 'uploading' && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
              
              {/* Error message */}
              {upload.status === 'error' && upload.error && (
                <p className="text-sm text-red-500 mt-1">{upload.error}</p>
              )}
            </div>

            {/* Status and actions */}
            <div className="flex items-center space-x-2">
              {getStatusIcon(upload.status)}
              
              {upload.status === 'pending' && (
                <button
                  onClick={() => removeUpload(upload.file)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = multiple;
            input.accept = allowedTypes.join(',');
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) processFiles(files);
            };
            input.click();
          }}
        >
          Add More Files
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={clearCompleted}>
            Clear
          </Button>
          <Button
            onClick={handleUploadAll}
            disabled={uploads.every(u => u.status !== 'pending')}
            loading={uploads.some(u => u.status === 'uploading')}
          >
            Upload All
          </Button>
        </div>
      </div>
    </div>
  );
};