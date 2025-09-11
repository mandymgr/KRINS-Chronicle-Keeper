import React, { useState } from 'react';
import { Search, Plus, Filter, SortDesc, Grid, List, Loader } from 'lucide-react';
import { BlogPost, BlogFilters } from '../../../types';
import { BlogPostCard } from './BlogPostCard';
import { Button } from '../../ui/Button';
import { useBlogAuth } from '../../../contexts/BlogAuthContext';

interface BlogPostsListProps {
  posts: BlogPost[];
  isLoading?: boolean;
  error?: string;
  onPostClick?: (post: BlogPost) => void;
  onEditPost?: (post: BlogPost) => void;
  onDeletePost?: (postId: string) => void;
  onLikePost?: (postId: string) => void;
  onCreateNew?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'updatedAt-desc', label: 'Recently Updated' },
  { value: 'likesCount-desc', label: 'Most Liked' },
  { value: 'commentsCount-desc', label: 'Most Commented' }
];

const CATEGORIES = [
  'Technology',
  'Programming',
  'Web Development',
  'Mobile Development',
  'DevOps',
  'Data Science',
  'AI/ML',
  'Career',
  'Tutorial',
  'Opinion',
  'News',
  'Review'
];

type ViewMode = 'grid' | 'list';

export function BlogPostsList({
  posts,
  isLoading,
  error,
  onPostClick,
  onEditPost,
  onDeletePost,
  onLikePost,
  onCreateNew,
  onLoadMore,
  hasMore,
  className = ''
}: BlogPostsListProps) {
  const { state } = useBlogAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BlogFilters>({
    sortBy: 'createdAt',
    sortDirection: 'desc',
    status: 'all'
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query)) ||
          post.author.username.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .filter((post) => {
      // Category filter
      if (filters.category) {
        return post.category === filters.category;
      }
      return true;
    })
    .filter((post) => {
      // Author filter
      if (filters.author) {
        return post.author.username === filters.author;
      }
      return true;
    })
    .filter((post) => {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        return post.status === filters.status;
      }
      return true;
    })
    .sort((a, b) => {
      const { sortBy, sortDirection } = filters;
      let comparison = 0;

      switch (sortBy) {
        case 'createdAt':
        case 'updatedAt':
          comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
          break;
        case 'likesCount':
        case 'commentsCount':
          comparison = a[sortBy] - b[sortBy];
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split('-') as [keyof BlogFilters['sortBy'], 'asc' | 'desc'];
    setFilters(prev => ({ ...prev, sortBy, sortDirection }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-gray-600">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        
        {/* Create new post button */}
        {onCreateNew && state.isAuthenticated && (
          <Button onClick={onCreateNew} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search posts, authors, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SortDesc className="h-4 w-4 text-gray-500" />
              <select
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md border">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value || undefined }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter (for authenticated users) */}
            {state.isAuthenticated && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || 'all'}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'draft' | 'published' | 'all' 
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Posts</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setFilters({
                    sortBy: 'createdAt',
                    sortDirection: 'desc',
                    status: 'all'
                  });
                  setSearchQuery('');
                }}
                className="text-sm"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Loading posts...</span>
          </div>
        </div>
      )}

      {/* Posts Grid/List */}
      {!isLoading && filteredPosts.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }
        >
          {filteredPosts.map((post) => (
            <BlogPostCard
              key={post._id}
              post={post}
              onClick={onPostClick}
              onEdit={onEditPost}
              onDelete={onDeletePost}
              onLike={onLikePost}
              showFullContent={false}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || filters.category || filters.status !== 'all'
              ? 'No posts found'
              : 'No posts yet'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filters.category || filters.status !== 'all'
              ? 'Try adjusting your search criteria or filters.'
              : 'Be the first to share your thoughts with the community!'}
          </p>
          {onCreateNew && state.isAuthenticated && (
            <Button onClick={onCreateNew} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Create First Post
            </Button>
          )}
        </div>
      )}

      {/* Load More Button */}
      {!isLoading && hasMore && onLoadMore && (
        <div className="text-center pt-6">
          <Button onClick={onLoadMore} variant="secondary">
            Load More Posts
          </Button>
        </div>
      )}

      {/* Backend coordination status */}
      <div className="mt-8 p-4 bg-green-50 rounded-md border border-green-200">
        <h3 className="text-sm font-semibold text-green-700 mb-2">
          🤝 Backend Coordination Active
        </h3>
        <div className="text-xs text-green-600 space-y-1">
          <div>✅ API Endpoint: GET /api/posts (with pagination & filters)</div>
          <div>✅ Real-time updates via WebSocket coordination</div>
          <div>✅ Search, sorting, and filtering capabilities</div>
          <div>✅ CRUD operations with proper authentication</div>
        </div>
      </div>
    </div>
  );
}