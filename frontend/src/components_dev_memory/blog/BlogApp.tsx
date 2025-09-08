import React, { useState, useEffect } from 'react';
import { 
  Home, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  BookOpen,
  MessageCircle,
  Activity,
  Wifi,
  WifiOff 
} from 'lucide-react';
import { BlogPostsList } from './posts/BlogPostsList';
import { BlogPostForm } from './posts/BlogPostForm';
import { AuthPage } from './auth/AuthPage';
import { BlogAuthProvider, useBlogAuth } from '../../contexts/BlogAuthContext';
import { BlogPost, CreatePostData } from '../../types';
import { blogApi, BlogAPIError } from '../../utils/blogApiClient';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Button } from '../ui/Button';

type ViewMode = 'home' | 'create' | 'edit' | 'profile';

interface BlogAppContentProps {}

function BlogAppContent() {
  const { state, logout } = useBlogAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket({
    onCommentCreated: () => {
      // Refresh posts to update comment counts
      loadPosts();
    }
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setError('');
      const response = await blogApi.getPosts({
        limit: 20,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      if (response.success && response.data) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      setError(err instanceof BlogAPIError ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (postData: CreatePostData) => {
    try {
      const response = await blogApi.createPost(postData);
      if (response.success && response.data) {
        setPosts(prev => [response.data.post, ...prev]);
        setCurrentView('home');
      }
    } catch (err) {
      throw new BlogAPIError(
        err instanceof BlogAPIError ? err.message : 'Failed to create post'
      );
    }
  };

  const handleEditPost = async (postData: CreatePostData) => {
    if (!editingPost) return;

    try {
      const response = await blogApi.updatePost(editingPost._id, postData);
      if (response.success && response.data) {
        setPosts(prev => prev.map(post => 
          post._id === editingPost._id ? response.data.post : post
        ));
        setEditingPost(null);
        setCurrentView('home');
      }
    } catch (err) {
      throw new BlogAPIError(
        err instanceof BlogAPIError ? err.message : 'Failed to update post'
      );
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await blogApi.deletePost(postId);
      setPosts(prev => prev.filter(post => post._id !== postId));
    } catch (err) {
      setError(err instanceof BlogAPIError ? err.message : 'Failed to delete post');
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await blogApi.likePost(postId);
      if (response.success && response.data) {
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likesCount: response.data.likesCount, isLiked: response.data.isLiked }
            : post
        ));
      }
    } catch (err) {
      setError(err instanceof BlogAPIError ? err.message : 'Failed to like post');
    }
  };

  const handleLogout = () => {
    blogApi.clearAuthData();
    logout();
    setCurrentView('home');
    setSidebarOpen(false);
  };

  const startEdit = (post: BlogPost) => {
    setEditingPost(post);
    setCurrentView('edit');
  };

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Write', icon: BookOpen },
  ];

  // Show auth page if not authenticated
  if (!state.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">DevBlog</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as ViewMode)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${currentView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Menu & Status */}
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="hidden sm:flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Wifi className="h-3 w-3" />
                    <span>Live</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline</span>
                  </div>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {state.user?.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {state.user?.username}
                  </span>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleLogout}
                className="p-2"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as ViewMode);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors
                  ${currentView === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'home' && (
          <BlogPostsList
            posts={posts}
            isLoading={isLoading}
            error={error}
            onPostClick={() => {}} // TODO: Implement post detail view
            onEditPost={startEdit}
            onDeletePost={handleDeletePost}
            onLikePost={handleLikePost}
            onCreateNew={() => setCurrentView('create')}
          />
        )}

        {currentView === 'create' && (
          <BlogPostForm
            onSubmit={handleCreatePost}
            onCancel={() => setCurrentView('home')}
          />
        )}

        {currentView === 'edit' && editingPost && (
          <BlogPostForm
            post={editingPost}
            onSubmit={handleEditPost}
            onCancel={() => {
              setEditingPost(null);
              setCurrentView('home');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>DevBlog - Revolutionary AI Team Coordination</p>
            <div className="mt-2 space-y-1">
              <div>🎨 Frontend Specialist + 🔧 Backend Specialist = Perfect Harmony</div>
              <div>Built with React, TypeScript, WebSocket, and JWT Authentication</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Main Blog App with Auth Provider
export function BlogApp() {
  return (
    <BlogAuthProvider>
      <BlogAppContent />
    </BlogAuthProvider>
  );
}