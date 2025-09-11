import React from 'react';
import { Calendar, User, MessageCircle, Heart, Edit, Trash2, Eye } from 'lucide-react';
import { BlogPost } from '../../../types';
import { useBlogAuth } from '../../../contexts/BlogAuthContext';

interface BlogPostCardProps {
  post: BlogPost;
  onClick?: (post: BlogPost) => void;
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: string) => void;
  onLike?: (postId: string) => void;
  showFullContent?: boolean;
  showAuthor?: boolean;
  className?: string;
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    }
    return `${diffInHours}h ago`;
  }
  
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Truncate content for excerpt
function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content;
  const truncated = content.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export function BlogPostCard({
  post,
  onClick,
  onEdit,
  onDelete,
  onLike,
  showFullContent = false,
  showAuthor = true,
  className = ''
}: BlogPostCardProps) {
  const { state } = useBlogAuth();
  const isAuthor = state.user?._id === post.author._id;

  const handleCardClick = () => {
    onClick?.(post);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(post);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete?.(post._id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(post._id);
  };

  return (
    <article
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer hover:border-blue-300' : ''}
        ${className}
      `}
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
              {post.title}
            </h2>
            
            {/* Status badge for drafts */}
            {post.status === 'draft' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                Draft
              </span>
            )}
          </div>

          {/* Action buttons for post author */}
          {isAuthor && (onEdit || onDelete) && (
            <div className="flex gap-1 ml-4">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit post"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Author info */}
        {showAuthor && (
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-900">{post.author.username}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            {post.author.isOnline && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-600">Online</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {showFullContent 
              ? post.content
              : post.excerpt || truncateContent(post.content, 200)
            }
          </p>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Category */}
        {post.category && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {post.category}
            </span>
          </div>
        )}

        {/* Footer with stats and actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{post.likesCount}</span>
            </div>
            {onClick && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Read more</span>
              </div>
            )}
          </div>

          {/* Like button */}
          {onLike && state.isAuthenticated && (
            <button
              onClick={handleLike}
              className={`
                flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors
                ${post.isLiked 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }
              `}
            >
              <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.isLiked ? 'Liked' : 'Like'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}