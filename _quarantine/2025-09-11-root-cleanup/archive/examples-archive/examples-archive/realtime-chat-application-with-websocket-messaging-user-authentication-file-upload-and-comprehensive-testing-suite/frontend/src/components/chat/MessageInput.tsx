import React, { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  loading?: boolean;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileUpload,
  disabled = false,
  loading = false,
  maxFileSize = 10,
  allowedFileTypes = ['image/*', 'text/*', 'application/pdf', '.doc', '.docx']
}) => {
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || loading) return;

    onSendMessage(trimmedMessage);
    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSize) {
      setUploadError(`File size must be less than ${maxFileSize}MB`);
      return;
    }

    // Validate file type
    const isValidType = allowedFileTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0];
        return file.type.startsWith(category);
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type);
      }
      return file.type === type;
    });

    if (!isValidType) {
      setUploadError(`File type not allowed. Allowed types: ${allowedFileTypes.join(', ')}`);
      return;
    }

    onFileUpload(file);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearUploadError = () => {
    setUploadError(null);
  };

  return (
    <div className="message-input-container" data-testid="message-input-container">
      {uploadError && (
        <div className="upload-error" data-testid="upload-error">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={clearUploadError}
            data-testid="clear-error-button"
            aria-label="Clear error"
          >
            ×
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="message-form" data-testid="message-form">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept={allowedFileTypes.join(',')}
          style={{ display: 'none' }}
          data-testid="file-input"
        />
        
        <button
          type="button"
          onClick={triggerFileUpload}
          disabled={disabled || loading}
          className="file-upload-button"
          data-testid="file-upload-button"
          aria-label="Upload file"
        >
          📎
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || loading}
          className="message-input"
          data-testid="message-input"
          maxLength={1000}
        />

        <button
          type="submit"
          disabled={disabled || loading || !message.trim()}
          className="send-button"
          data-testid="send-button"
          aria-label="Send message"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
};