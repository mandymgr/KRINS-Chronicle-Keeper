import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useBlogAuth } from '../../../contexts/BlogAuthContext';
import { Button } from '../../ui/Button';

interface CommentFormProps {
  postId: string;
  parentId?: string; // For replies
  onSubmit: (content: string, parentId?: string) => Promise<void>;
  onCancel?: () => void;
  onTyping?: (isTyping: boolean) => void;
  isSubmitting?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function CommentForm({
  postId,
  parentId,
  onSubmit,
  onCancel,
  onTyping,
  isSubmitting = false,
  placeholder = 'Share your thoughts...',
  autoFocus = false,
  className = ''
}: CommentFormProps) {
  const { state } = useBlogAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Auto-focus if specified
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Handle typing indicator
  useEffect(() => {
    if (onTyping) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (content.trim()) {
        onTyping(true);
        // Stop typing after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 3000);
      } else {
        onTyping(false);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [content, onTyping]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      if (onTyping) {
        onTyping(false);
      }
    };
  }, [onTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError('Comment cannot be empty');
      return;
    }

    if (trimmedContent.length > 1000) {
      setError('Comment is too long (max 1000 characters)');
      return;
    }

    setError('');
    
    try {
      await onSubmit(trimmedContent, parentId);
      setContent('');
      
      // Stop typing indicator
      if (onTyping) {
        onTyping(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit with Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    if (onTyping) {
      onTyping(false);
    }
    onCancel?.();
  };

  // Don't render if not authenticated
  if (!state.isAuthenticated) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg text-center ${className}`}>
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
          <MessageCircle className="h-4 w-4" />
          <span>Join the conversation</span>
        </div>
        <p className="text-sm text-gray-500">
          Please log in to share your thoughts and engage with the community.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {/* Header for replies */}
      {parentId && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle className="h-4 w-4" />
            <span>Replying to comment</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Author info */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
          {state.user?.username.charAt(0).toUpperCase()}
        </div>
        <span className="font-medium text-gray-900">{state.user?.username}</span>
        <span>•</span>
        <span>Commenting as</span>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`
            w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            resize-none min-h-[80px] max-h-[200px]
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
          placeholder={placeholder}
          disabled={isSubmitting}
          maxLength={1000}
          rows={3}
        />
        
        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        {/* Character count */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            {content.trim() ? 'Press Ctrl+Enter to post quickly' : ''}
          </div>
          <div>
            {content.length}/1000
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {parentId ? 'Replying to this comment thread' : 'Adding to the conversation'}
        </div>
        
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Posting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-3 w-3" />
                <span>{parentId ? 'Reply' : 'Comment'}</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* WebSocket status indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Real-time comments with Backend Specialist WebSocket</span>
      </div>
    </form>
  );
}