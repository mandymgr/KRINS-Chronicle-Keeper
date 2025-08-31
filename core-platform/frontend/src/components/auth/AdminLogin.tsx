import React, { useState, useContext, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  CheckCircle,
  LogIn,
  KeyRound,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface AdminUser {
  id: string;
  username: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
  lastLogin?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('admin-token');
    const userData = localStorage.getItem('admin-user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // In production, this would be a real API call
      // For demo purposes, we'll simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock admin credentials
      if (username === 'admin' && password === 'devmemory2024') {
        const adminUser: AdminUser = {
          id: 'admin-001',
          username: 'admin',
          role: 'admin',
          permissions: [
            'read:all',
            'write:all', 
            'delete:all',
            'manage:users',
            'manage:patterns',
            'manage:adrs',
            'access:ai-team',
            'configure:system'
          ],
          lastLogin: new Date().toISOString()
        };

        const token = btoa(`${username}:${Date.now()}`);
        
        localStorage.setItem('admin-token', token);
        localStorage.setItem('admin-user', JSON.stringify(adminUser));
        setUser(adminUser);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

interface AdminLoginProps {
  onSuccess?: () => void;
  className?: string;
}

export default function AdminLogin({ onSuccess, className }: AdminLoginProps) {
  const { login, isLoading } = useAdminAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    const loginSuccess = await login(formData.username, formData.password);
    
    if (loginSuccess) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } else {
      setError('Invalid credentials. Try admin / devmemory2024');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4", className)}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-slate-400">Dev Memory OS Administration Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-slate-200">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg",
                    "text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-all duration-200"
                  )}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg",
                    "text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "transition-all duration-200"
                  )}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-200" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <CheckCircle className="h-4 w-4" />
                <span>Login successful! Redirecting...</span>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-400 text-sm mb-2">
              <KeyRound className="h-4 w-4" />
              <span className="font-medium">Demo Credentials</span>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <div><span className="text-slate-300">Username:</span> admin</div>
              <div><span className="text-slate-300">Password:</span> devmemory2024</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-400">
              <Settings className="h-3 w-3" />
              <span>Secured by Krin AI Team System</span>
            </div>
          </div>
        </div>

        {/* AI Team Attribution */}
        <div className="mt-6 text-center text-xs text-slate-500">
          🤖 Generated by AI Team Coordination System<br />
          ⚙️ Backend Specialist • 🎨 Frontend Specialist • 🧪 Testing Specialist
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAdminAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
                <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                  {user.role}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Features */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              System Management
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>AI Team Coordination</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Pattern Management</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>ADR Administration</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              User Permissions
            </h3>
            <div className="space-y-2">
              {user.permissions.slice(0, 4).map((permission, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>{permission}</span>
                </div>
              ))}
              {user.permissions.length > 4 && (
                <div className="text-xs text-slate-500">
                  +{user.permissions.length - 4} more permissions
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Session Info
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Unknown'}</div>
              <div>Role: {user.role}</div>
              <div>User ID: {user.id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};