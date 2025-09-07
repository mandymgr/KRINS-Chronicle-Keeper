import React, { useEffect, useRef } from 'react';

export interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  timestamp: Date;
  type?: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.userId === currentUserId;
    const messageClass = `message ${isOwnMessage ? 'own-message' : 'other-message'} ${message.type || 'text'}`;

    return (
      <div key={message.id} className={messageClass} data-testid="message">
        <div className="message-header">
          <span className="username" data-testid="message-username">
            {isOwnMessage ? 'You' : message.username}
          </span>
          <span className="timestamp" data-testid="message-timestamp">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="message-content" data-testid="message-content">
          {message.type === 'file' ? (
            <div className="file-message">
              <span>📁 {message.fileName}</span>
              {message.fileUrl && (
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="file-download"
                >
                  Download
                </a>
              )}
            </div>
          ) : message.type === 'system' ? (
            <em>{message.text}</em>
          ) : (
            message.text
          )}
        </div>
      </div>
    );
  };

  if (loading && messages.length === 0) {
    return (
      <div className="message-list loading" data-testid="message-list-loading">
        <div>Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="message-list" data-testid="message-list">
      {messages.length === 0 ? (
        <div className="no-messages" data-testid="no-messages">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <>
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};