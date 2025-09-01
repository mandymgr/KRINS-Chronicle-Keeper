import React from 'react';
import { render, screen } from '@testing-library/react';
import { MessageList, Message } from '../../../components/chat/MessageList';

describe('MessageList', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      text: 'Hello world!',
      userId: 'user1',
      username: 'Alice',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'text'
    },
    {
      id: '2',
      text: 'How are you?',
      userId: 'user2',
      username: 'Bob',
      timestamp: new Date('2023-01-01T10:01:00Z'),
      type: 'text'
    },
    {
      id: '3',
      text: 'document.pdf',
      userId: 'user1',
      username: 'Alice',
      timestamp: new Date('2023-01-01T10:02:00Z'),
      type: 'file',
      fileName: 'document.pdf',
      fileUrl: 'https://example.com/file.pdf'
    },
    {
      id: '4',
      text: 'User Charlie joined the chat',
      userId: 'system',
      username: 'System',
      timestamp: new Date('2023-01-01T10:03:00Z'),
      type: 'system'
    }
  ];

  const currentUserId = 'user1';

  it('should render message list with messages', () => {
    render(<MessageList messages={mockMessages} currentUserId={currentUserId} />);

    const messageList = screen.getByTestId('message-list');
    expect(messageList).toBeInTheDocument();

    const messages = screen.getAllByTestId('message');
    expect(messages).toHaveLength(4);
  });

  it('should show no messages placeholder when empty', () => {
    render(<MessageList messages={[]} currentUserId={currentUserId} />);

    expect(screen.getByTestId('no-messages')).toBeInTheDocument();
    expect(screen.getByTestId('no-messages')).toHaveTextContent('No messages yet. Start the conversation!');
  });

  it('should show loading state', () => {
    render(<MessageList messages={[]} currentUserId={currentUserId} loading={true} />);

    expect(screen.getByTestId('message-list-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
  });

  it('should display own messages with "You" as username', () => {
    const ownMessage: Message[] = [{
      id: '1',
      text: 'My message',
      userId: currentUserId,
      username: 'Alice',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'text'
    }];

    render(<MessageList messages={ownMessage} currentUserId={currentUserId} />);

    const username = screen.getByTestId('message-username');
    expect(username).toHaveTextContent('You');
  });

  it('should display other users messages with their username', () => {
    const otherMessage: Message[] = [{
      id: '1',
      text: 'Other message',
      userId: 'user2',
      username: 'Bob',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'text'
    }];

    render(<MessageList messages={otherMessage} currentUserId={currentUserId} />);

    const username = screen.getByTestId('message-username');
    expect(username).toHaveTextContent('Bob');
  });

  it('should format timestamp correctly', () => {
    const message: Message[] = [{
      id: '1',
      text: 'Test message',
      userId: 'user2',
      username: 'Bob',
      timestamp: new Date('2023-01-01T14:30:45Z'),
      type: 'text'
    }];

    render(<MessageList messages={message} currentUserId={currentUserId} />);

    const timestamp = screen.getByTestId('message-timestamp');
    // Note: This test might vary based on timezone, so we check for the format
    expect(timestamp.textContent).toMatch(/\d{2}:\d{2}/);
  });

  it('should render text messages correctly', () => {
    const textMessage: Message[] = [{
      id: '1',
      text: 'Hello world!',
      userId: 'user2',
      username: 'Bob',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'text'
    }];

    render(<MessageList messages={textMessage} currentUserId={currentUserId} />);

    const content = screen.getByTestId('message-content');
    expect(content).toHaveTextContent('Hello world!');
  });

  it('should render file messages with download link', () => {
    const fileMessage: Message[] = [{
      id: '1',
      text: 'document.pdf',
      userId: 'user2',
      username: 'Bob',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'file',
      fileName: 'document.pdf',
      fileUrl: 'https://example.com/file.pdf'
    }];

    render(<MessageList messages={fileMessage} currentUserId={currentUserId} />);

    const content = screen.getByTestId('message-content');
    expect(content).toHaveTextContent('📁 document.pdf');

    const downloadLink = screen.getByTestId('file-download');
    expect(downloadLink).toBeInTheDocument();
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/file.pdf');
    expect(downloadLink).toHaveAttribute('target', '_blank');
    expect(downloadLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render file messages without download link when no fileUrl', () => {
    const fileMessage: Message[] = [{
      id: '1',
      text: 'document.pdf',
      userId: 'user2',
      username: 'Bob',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'file',
      fileName: 'document.pdf'
    }];

    render(<MessageList messages={fileMessage} currentUserId={currentUserId} />);

    const content = screen.getByTestId('message-content');
    expect(content).toHaveTextContent('📁 document.pdf');
    expect(screen.queryByTestId('file-download')).not.toBeInTheDocument();
  });

  it('should render system messages in italic', () => {
    const systemMessage: Message[] = [{
      id: '1',
      text: 'User joined the chat',
      userId: 'system',
      username: 'System',
      timestamp: new Date('2023-01-01T10:00:00Z'),
      type: 'system'
    }];

    render(<MessageList messages={systemMessage} currentUserId={currentUserId} />);

    const content = screen.getByTestId('message-content');
    expect(content.querySelector('em')).toBeInTheDocument();
    expect(content.querySelector('em')).toHaveTextContent('User joined the chat');
  });

  it('should apply correct CSS classes for own and other messages', () => {
    render(<MessageList messages={mockMessages.slice(0, 2)} currentUserId={currentUserId} />);

    const messages = screen.getAllByTestId('message');
    
    // First message is from currentUser (user1)
    expect(messages[0]).toHaveClass('message', 'own-message', 'text');
    
    // Second message is from different user (user2)
    expect(messages[1]).toHaveClass('message', 'other-message', 'text');
  });
});