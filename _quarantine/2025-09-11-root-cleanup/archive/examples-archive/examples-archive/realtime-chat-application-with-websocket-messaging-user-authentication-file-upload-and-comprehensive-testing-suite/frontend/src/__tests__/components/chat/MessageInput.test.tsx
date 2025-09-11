import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '../../../components/chat/MessageInput';

describe('MessageInput', () => {
  const mockOnSendMessage = jest.fn();
  const mockOnFileUpload = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
    mockOnFileUpload.mockClear();
  });

  it('should render message input elements', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    expect(screen.getByTestId('message-input-container')).toBeInTheDocument();
    expect(screen.getByTestId('message-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload-button')).toBeInTheDocument();
  });

  it('should update message when typed', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input') as HTMLInputElement;
    await user.type(messageInput, 'Hello world!');

    expect(messageInput.value).toBe('Hello world!');
  });

  it('should send message on form submit', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should send message on Enter key press', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    await user.type(messageInput, 'Test message{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should not send message on Shift+Enter', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    await user.type(messageInput, 'Test message');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should clear message after sending', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input') as HTMLInputElement;
    const sendButton = screen.getByTestId('send-button');

    await user.type(messageInput, 'Test message');
    await user.click(sendButton);

    expect(messageInput.value).toBe('');
  });

  it('should not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    // Test empty message
    await user.click(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();

    // Test whitespace-only message
    await user.type(messageInput, '   ');
    await user.click(sendButton);
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('should disable send button when message is empty', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const sendButton = screen.getByTestId('send-button');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when message has content', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');

    await user.type(messageInput, 'Test');
    expect(sendButton).not.toBeDisabled();
  });

  it('should show loading state', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
        loading={true}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    const fileUploadButton = screen.getByTestId('file-upload-button');

    expect(messageInput).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(fileUploadButton).toBeDisabled();
    expect(sendButton).toHaveTextContent('⏳');
  });

  it('should show disabled state', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
        disabled={true}
      />
    );

    const messageInput = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    const fileUploadButton = screen.getByTestId('file-upload-button');

    expect(messageInput).toBeDisabled();
    expect(sendButton).toBeDisabled();
    expect(fileUploadButton).toBeDisabled();
  });

  it('should trigger file upload when file button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const fileUploadButton = screen.getByTestId('file-upload-button');
    const fileInput = screen.getByTestId('file-input') as HTMLInputElement;

    // Mock the click method
    const clickSpy = jest.spyOn(fileInput, 'click');
    
    await user.click(fileUploadButton);
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should handle file upload with valid file', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnFileUpload).toHaveBeenCalledWith(file);
  });

  it('should show error for file too large', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
        maxFileSize={1} // 1MB limit
      />
    );

    const fileInput = screen.getByTestId('file-input');
    // Create a file larger than 1MB (approximate)
    const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB worth of characters
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    expect(screen.getByTestId('upload-error')).toHaveTextContent('File size must be less than 1MB');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('should show error for invalid file type', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
        allowedFileTypes={['image/*']}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    expect(screen.getByTestId('upload-error')).toHaveTextContent('File type not allowed');
    expect(mockOnFileUpload).not.toHaveBeenCalled();
  });

  it('should allow clearing upload error', async () => {
    const user = userEvent.setup();
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
        allowedFileTypes={['image/*']}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByTestId('upload-error')).toBeInTheDocument();

    const clearButton = screen.getByTestId('clear-error-button');
    await user.click(clearButton);

    expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
  });

  it('should validate file extension correctly', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
        allowedFileTypes={['.pdf', '.doc']}
      />
    );

    const fileInput = screen.getByTestId('file-input');
    const validFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(mockOnFileUpload).toHaveBeenCalledWith(validFile);
    expect(screen.queryByTestId('upload-error')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <MessageInput
        onSendMessage={mockOnSendMessage}
        onFileUpload={mockOnFileUpload}
      />
    );

    const fileUploadButton = screen.getByTestId('file-upload-button');
    const sendButton = screen.getByTestId('send-button');

    expect(fileUploadButton).toHaveAttribute('aria-label', 'Upload file');
    expect(sendButton).toHaveAttribute('aria-label', 'Send message');
  });
});