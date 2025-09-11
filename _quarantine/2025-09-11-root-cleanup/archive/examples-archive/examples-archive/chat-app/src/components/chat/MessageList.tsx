import React, { useEffect, useRef, useMemo } from 'react';
import { Download, File, Image } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../hooks/useAuth';
import type { Message } from '../../types';

const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  }
};

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOwnMessage, 
  showAvatar, 
  showTimestamp 
}) => {
  const handleFileDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            <div className="relative group">
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Shared image'}
                className="max-w-xs max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
              <button
                onClick={() => handleFileDownload(message.fileUrl!, message.fileName!)}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Download image"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            {message.content && (
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            <div
              className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              onClick={() => handleFileDownload(message.fileUrl!, message.fileName!)}
            >
              <File className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {message.fileName}
                </p>
                {message.fileSize && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(message.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
              <Download className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        );
      
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {showAvatar && !isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">
            {message.senderUsername.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${!showAvatar && !isOwnMessage ? 'ml-10' : ''}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
          }`}
        >
          {showAvatar && !isOwnMessage && (
            <p className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
              {message.senderUsername}
            </p>
          )}
          {renderMessageContent()}
        </div>
        
        {showTimestamp && (
          <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {formatTime(new Date(message.timestamp))}
          </p>
        )}
      </div>
    </div>
  );
};

export const MessageList: React.FC = () => {
  const { messages, isLoading } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group messages by date and determine which messages should show avatars/timestamps
  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: Array<Message & { showAvatar: boolean; showTimestamp: boolean }> }> = [];
    let currentGroup: { date: string; messages: Array<Message & { showAvatar: boolean; showTimestamp: boolean }> } | null = null;
    
    messages.forEach((message, index) => {
      const messageDate = formatDate(new Date(message.timestamp));
      const prevMessage = messages[index - 1];
      const nextMessage = messages[index + 1];
      
      // Start new group if date changes
      if (!currentGroup || currentGroup.date !== messageDate) {
        currentGroup = { date: messageDate, messages: [] };
        groups.push(currentGroup);
      }
      
      // Determine if we should show avatar (first message from sender or different sender than previous)
      const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
      
      // Determine if we should show timestamp (last message from sender or different sender than next)
      const showTimestamp = !nextMessage || nextMessage.senderId !== message.senderId;
      
      currentGroup.messages.push({
        ...message,
        showAvatar,
        showTimestamp,
      });
    });
    
    return groups;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No messages yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start the conversation by sending a message below.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {groupedMessages.map((group) => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {group.date}
              </span>
            </div>
          </div>
          
          {/* Messages for this date */}
          <div className="space-y-3">
            {group.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.senderId === user?.id}
                showAvatar={message.showAvatar}
                showTimestamp={message.showTimestamp}
              />
            ))}
          </div>
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};