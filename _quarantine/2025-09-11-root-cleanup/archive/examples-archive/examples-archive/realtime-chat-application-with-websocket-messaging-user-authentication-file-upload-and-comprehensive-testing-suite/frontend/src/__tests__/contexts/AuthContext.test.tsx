import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Test component to access context
const TestComponent: React.FC = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'authenticated' : 'not-authenticated'}
      </div>
      <div data-testid="loading-status">
        {auth.isLoading ? 'loading' : 'not-loading'}
      </div>
      <div data-testid="user-info">
        {auth.user ? `${auth.user.username} (${auth.user.email})` : 'no-user'}
      </div>
      <div data-testid="error-message">
        {auth.error || 'no-error'}
      </div>
      <button
        data-testid="login-button"
        onClick={() => auth.login('test@example.com', 'password123')}
      >
        Login
      </button>
      <button
        data-testid="login-invalid-button"
        onClick={() => auth.login('invalid@example.com', 'wrong')}
      >
        Login Invalid
      </button>
      <button data-testid="logout-button" onClick={() => auth.logout()}>
        Logout
      </button>
      <button data-testid="clear-error-button" onClick={() => auth.clearError()}>
        Clear Error
      </button>
    </div>
  );
};

const renderWithAuthProvider = () => {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should provide initial unauthenticated state', () => {
    renderWithAuthProvider();

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');
  });

  it('should handle successful login', async () => {
    renderWithAuthProvider();

    const loginButton = screen.getByTestId('login-button');

    act(() => {
      loginButton.click();
    });

    // Check loading state
    expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');

    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('testuser (test@example.com)');
    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');

    // Check that token was stored
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
  });

  it('should handle login failure', async () => {
    renderWithAuthProvider();

    const loginInvalidButton = screen.getByTestId('login-invalid-button');

    act(() => {
      loginInvalidButton.click();
    });

    // Check loading state
    expect(screen.getByTestId('loading-status')).toHaveTextContent('loading');

    // Wait for login to fail
    await waitFor(() => {
      expect(screen.getByTestId('loading-status')).toHaveTextContent('not-loading');
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');

    // Check that no token was stored
    expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith('authToken', expect.any(String));
  });

  it('should handle logout', async () => {
    renderWithAuthProvider();

    // First login
    const loginButton = screen.getByTestId('login-button');
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Then logout
    const logoutButton = screen.getByTestId('logout-button');
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');

    // Check that token was removed
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
  });

  it('should clear error messages', async () => {
    renderWithAuthProvider();

    // Trigger login failure
    const loginInvalidButton = screen.getByTestId('login-invalid-button');
    act(() => {
      loginInvalidButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
    });

    // Clear error
    const clearErrorButton = screen.getByTestId('clear-error-button');
    act(() => {
      clearErrorButton.click();
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');
  });

  it('should restore authentication state from localStorage', () => {
    // Mock existing token
    mockLocalStorage.setItem('authToken', 'existing-token');

    renderWithAuthProvider();

    // Should be authenticated on mount
    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('testuser (test@example.com)');
  });

  it('should throw error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('should handle multiple login attempts correctly', async () => {
    renderWithAuthProvider();

    const loginButton = screen.getByTestId('login-button');
    const loginInvalidButton = screen.getByTestId('login-invalid-button');

    // First, failed login
    act(() => {
      loginInvalidButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
    });

    // Then, successful login (should clear previous error)
    act(() => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    expect(screen.getByTestId('error-message')).toHaveTextContent('no-error');
    expect(screen.getByTestId('user-info')).toHaveTextContent('testuser (test@example.com)');
  });
});