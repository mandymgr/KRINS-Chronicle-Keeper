import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '../ui/Button';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'file' | 'image', fileData?: any) => void;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onFileUpload,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = Math.min(textarea.scrollHeight, 120); // Max height of ~5 lines
      textarea.style.height = `${scrollHeight}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    adjustTextareaHeight();
    
    // Typing indicator logic
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      // In real app, emit typing event to WebSocket
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // In real app, emit stop typing event to WebSocket
    }, 1000);
  };

  const handleSendMessage = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    onSendMessage(trimmedMessage);
    setMessage('');
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, disabled, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return;
      } else {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert('File type not supported');
        return;
      }
      
      onFileUpload(file);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
      <div className="flex items-end space-x-3">
        {/* File attachment button */}
        <button
          onClick={handleAttachClick}
          disabled={disabled}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.txt,.doc,.docx"
        />
        
        {/* Message input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px' }}
            aria-label="Type your message"
            maxLength={2000}
          />
          
          {/* Character count */}
          {message.length > 1800 && (
            <div className="absolute bottom-1 left-4 text-xs text-gray-400">
              {message.length}/2000
            </div>
          )}
          
          {/* Emoji button (placeholder for future emoji picker) */}
          <button
            className="absolute bottom-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Add emoji"
            onClick={() => {
              // Future: Open emoji picker
              console.log('Emoji picker not implemented yet');
            }}
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>
        
        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={disabled || !message.trim()}
          variant="primary"
          className="flex-shrink-0 h-12 px-4"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Typing indicator placeholder */}
      {isTyping && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          You are typing...
        </div>
      )}
    </div>
  );
};