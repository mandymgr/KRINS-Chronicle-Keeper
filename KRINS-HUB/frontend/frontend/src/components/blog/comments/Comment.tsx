import React, { useState } from 'react';
import { Heart, Reply, Edit, Trash2, MoreHorizontal, Calendar, User } from 'lucide-react';
import { BlogComment } from '../../../types';
import { useBlogAuth } from '../../../contexts/BlogAuthContext';
import { Button } from '../../ui/Button';

interface CommentProps {
  comment: BlogComment;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  depth?: number;
  maxDepth?: number;
  className?: string;
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function Comment({
  comment,
  onReply,
  onEdit,
  onDelete,
  onLike,
  depth = 0,
  maxDepth = 3,
  className = ''
}: CommentProps) {
  const { state } = useBlogAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showActions, setShowActions] = useState(false);

  const isAuthor = state.user?._id === comment.author._id;
  const canNestReplies = depth < maxDepth;

  const handleEdit = async () => {
    if (editContent.trim() && editContent !== comment.content) {
      await onEdit?.(comment._id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete?.(comment._id);
    }
  };

  const handleReply = () => {
    onReply?.(comment._id);
  };

  const handleLike = () => {
    onLike?.(comment._id);
  };

  const indentLevel = Math.min(depth, 5); // Max visual nesting

  return (
    <div className={`${className}`}>
      <div
        className={`
          flex gap-3 p-4 bg-white border border-gray-200 rounded-lg
          ${depth > 0 ? `ml-${Math.min(depth * 4, 20)} border-l-2 border-l-blue-200` : ''}
        `}
        style={{ 
          marginLeft: depth > 0 ? `${Math.min(depth * 16, 80)}px` : '0' 
        }}
      >
        {/* Author Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {comment.author.username.charAt(0).toUpperCase()}
          </div>
          {comment.author.isOnline && (
            <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white -mt-2 ml-7"></div>
          )}
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-900">{comment.author.username}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{formatDate(comment.createdAt)}</span>
              {comment.isEdited && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500 text-xs">(edited)</span>
                </>
              )}
              {comment.author.isOnline && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-green-600 text-xs">online</span>
                </>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1 min-w-[120px]">
                  {isAuthor && onEdit && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                  {isAuthor && onDelete && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setShowActions(false)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Edit your comment..."
                maxLength={1000}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || editContent === comment.content}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none mb-3">
              <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          )}

          {/* Comment Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 text-sm">
              {/* Like Button */}
              {onLike && state.isAuthenticated && (
                <button
                  onClick={handleLike}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-md transition-colors
                    ${comment.isLiked 
                      ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                    }
                  `}
                >
                  <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                  <span>{comment.likesCount > 0 ? comment.likesCount : 'Like'}</span>
                </button>
              )}

              {/* Reply Button */}
              {onReply && state.isAuthenticated && canNestReplies && (
                <button
                  onClick={handleReply}
                  className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span>Reply</span>
                </button>
              )}
              
              {/* Likes Count (if no like button) */}
              {(!onLike || !state.isAuthenticated) && comment.likesCount > 0 && (
                <div className="flex items-center gap-1 text-gray-500">
                  <Heart className="h-4 w-4" />
                  <span>{comment.likesCount}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onLike={onLike}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}

      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}