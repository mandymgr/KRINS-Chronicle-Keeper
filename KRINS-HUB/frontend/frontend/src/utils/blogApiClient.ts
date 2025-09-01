/**
 * Blog API Client - Perfect coordination with Backend Specialist's API
 * 
 * This client integrates seamlessly with the Backend Specialist's REST API endpoints:
 * - Authentication: /api/auth/login, /api/auth/register, /api/auth/me
 * - Posts: /api/posts (CRUD operations with pagination)
 * - Comments: /api/comments (with WebSocket coordination)
 * - Users: /api/users (profile management)
 */

import { 
  BlogApiResponse, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  BlogPost,
  CreatePostData,
  PostsResponse,
  PostResponse,
  BlogComment,
  CommentsResponse,
  CommentResponse,
  BlogUser
} from '../types';

// API Configuration - Backend Specialist's server
const API_CONFIG = {
  baseUrl: 'http://localhost:3000/api',
  timeout: 10000,
  retries: 3
};

// API Error class
export class BlogAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'BlogAPIError';
  }
}

// Base API client class
class BlogAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Get authentication token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('blog_token');
  }

  // Create request headers
  private createHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method with error handling and retries
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true,
    retries = API_CONFIG.retries
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.createHeaders(includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new BlogAPIError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data.code
        );
      }

      return data;
    } catch (error) {
      // Retry logic for network errors
      if (retries > 0 && error instanceof TypeError) {
        console.warn(`Request failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.request<T>(endpoint, options, includeAuth, retries - 1);
      }

      throw error instanceof BlogAPIError 
        ? error 
        : new BlogAPIError(
            error instanceof Error ? error.message : 'Request failed'
          );
    }
  }

  // =====================
  // AUTHENTICATION API
  // =====================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  }

  async getCurrentUser(): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/me');
  }

  async logout(): Promise<void> {
    // Clear local storage
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_user');
  }

  // =====================
  // BLOG POSTS API
  // =====================

  async getPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    author?: string;
    status?: 'published' | 'draft' | 'all';
    tags?: string[];
    search?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<PostsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(`${key}[]`, item));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }

    const queryString = searchParams.toString();
    return this.request<PostsResponse>(`/posts${queryString ? `?${queryString}` : ''}`);
  }

  async getPost(postId: string): Promise<PostResponse> {
    return this.request<PostResponse>(`/posts/${postId}`);
  }

  async createPost(postData: CreatePostData): Promise<PostResponse> {
    return this.request<PostResponse>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(postId: string, postData: Partial<CreatePostData>): Promise<PostResponse> {
    return this.request<PostResponse>(`/posts/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(postId: string): Promise<BlogApiResponse> {
    return this.request<BlogApiResponse>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  async likePost(postId: string): Promise<BlogApiResponse<{ likesCount: number; isLiked: boolean }>> {
    return this.request<BlogApiResponse<{ likesCount: number; isLiked: boolean }>>(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  // =====================
  // COMMENTS API
  // =====================

  async getComments(postId: string, params?: {
    limit?: number;
    skip?: number;
    sortBy?: 'createdAt' | 'likesCount';
    sortDirection?: 'asc' | 'desc';
  }): Promise<CommentsResponse> {
    const searchParams = new URLSearchParams({ postId: postId });
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<CommentsResponse>(`/comments?${searchParams.toString()}`);
  }

  async createComment(data: {
    postId: string;
    content: string;
    parentId?: string;
  }): Promise<CommentResponse> {
    return this.request<CommentResponse>('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComment(commentId: string, content: string): Promise<CommentResponse> {
    return this.request<CommentResponse>(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: string): Promise<BlogApiResponse> {
    return this.request<BlogApiResponse>(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async likeComment(commentId: string): Promise<BlogApiResponse<{ likesCount: number; isLiked: boolean }>> {
    return this.request<BlogApiResponse<{ likesCount: number; isLiked: boolean }>>(`/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  // =====================
  // USER MANAGEMENT API
  // =====================

  async updateProfile(data: {
    username?: string;
    email?: string;
  }): Promise<BlogApiResponse<{ user: BlogUser }>> {
    return this.request<BlogApiResponse<{ user: BlogUser }>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file: File): Promise<BlogApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.request<BlogApiResponse<{ avatarUrl: string }>>('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
        Authorization: `Bearer ${this.getAuthToken()}`,
      },
    }, false); // Don't include default headers for file upload
  }

  async getOnlineUsers(): Promise<BlogApiResponse<{ users: BlogUser[]; count: number }>> {
    return this.request<BlogApiResponse<{ users: BlogUser[]; count: number }>>('/users/online');
  }

  async searchUsers(query: string, limit = 10): Promise<BlogApiResponse<{ users: BlogUser[] }>> {
    const searchParams = new URLSearchParams({ q: query, limit: limit.toString() });
    return this.request<BlogApiResponse<{ users: BlogUser[] }>>(`/users/search?${searchParams.toString()}`);
  }

  // =====================
  // HEALTH CHECK
  // =====================

  async healthCheck(): Promise<BlogApiResponse<{ 
    timestamp: string; 
    environment: string; 
    database: string;
  }>> {
    return this.request<BlogApiResponse<{ 
      timestamp: string; 
      environment: string; 
      database: string;
    }>>('/health', {}, false);
  }

  // =====================
  // UTILITY METHODS
  // =====================

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  // Get current user from localStorage
  getCurrentUserFromStorage(): BlogUser | null {
    const userData = localStorage.getItem('blog_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Set authentication data
  setAuthData(user: BlogUser, token: string): void {
    localStorage.setItem('blog_token', token);
    localStorage.setItem('blog_user', JSON.stringify(user));
  }

  // Clear authentication data
  clearAuthData(): void {
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_user');
  }
}

// Create singleton instance
export const blogApi = new BlogAPIClient();

// Export types for convenience
export type { 
  BlogPost, 
  BlogComment, 
  BlogUser,
  CreatePostData,
  LoginCredentials,
  RegisterCredentials
};

// Export default instance
export default blogApi;