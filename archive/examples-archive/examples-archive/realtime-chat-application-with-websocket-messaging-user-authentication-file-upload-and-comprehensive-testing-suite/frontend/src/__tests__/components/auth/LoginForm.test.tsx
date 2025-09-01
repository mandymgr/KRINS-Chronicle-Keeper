import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../../components/auth/LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render login form elements', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
  });

  it('should update input values when typed', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is required');
    expect(screen.getByTestId('password-error')).toHaveTextContent('Password is required');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByTestId('email-error')).toHaveTextContent('Email is invalid');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for short password', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123');
    await user.click(submitButton);

    expect(screen.getByTestId('password-error')).toHaveTextContent('Password must be at least 6 characters');
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid credentials', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should show loading state', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={true} />);

    const submitButton = screen.getByTestId('submit-button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'Invalid credentials';
    render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />);

    const errorElement = screen.getByTestId('form-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
    expect(errorElement).toHaveAttribute('role', 'alert');
  });

  it('should handle form submission with keyboard', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.keyboard('{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});