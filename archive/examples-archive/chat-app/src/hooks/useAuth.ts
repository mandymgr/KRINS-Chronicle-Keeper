import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Re-export the useAuth hook from AuthContext for consistency
// This allows for better organization and potential future customization

export { useAuth } from '../contexts/AuthContext';

// Additional auth-related hooks can be added here

export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
};

export const useAuthUser = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    user,
    isLoggedIn: isAuthenticated && user !== null,
  };
};