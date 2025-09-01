// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Blog Types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  author: BlogUser;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  tags?: string[];
  commentsCount?: number;
}

export interface BlogComment {
  id: string;
  content: string;
  author: BlogUser;
  postId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  replies?: BlogComment[];
}

export interface BlogUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: BlogUser;
  message?: string;
  error?: string;
}

// API Response Wrappers
export interface BlogApiResponse<T = any> extends ApiResponse<T> {}

export interface PostsResponse extends BlogApiResponse<{
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}> {}

export interface PostResponse extends BlogApiResponse<BlogPost> {}

export interface CommentsResponse extends BlogApiResponse<{
  comments: BlogComment[];
  total: number;
}> {}

export interface CommentResponse extends BlogApiResponse<BlogComment> {}

// Form Types
export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  published?: boolean;
  tags?: string[];
}

// Search Types
export interface SearchResult {
  id: string;
  type: 'adr' | 'pattern' | 'post';
  title: string;
  content: string;
  relevance: number;
  metadata?: Record<string, any>;
}

// ADR Types
export interface ADRResult {
  id: string;
  title: string;
  content: string;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Pattern Types
export interface PatternResult {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: string;
  tags: string[];
  usage_count?: number;
}

export interface PatternRecommendation {
  id: string;
  pattern: PatternResult;
  relevance_score: number;
  reasoning: string;
}

export interface PatternRecommendationResponse {
  patterns: PatternRecommendation[];
  total: number;
  query_analysis?: string;
}

// Filter Types
export interface SearchFilters {
  type?: string;
  category?: string;
  complexity?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PatternFilters extends SearchFilters {
  minUsageCount?: number;
  maxComplexity?: string;
}

export default {};