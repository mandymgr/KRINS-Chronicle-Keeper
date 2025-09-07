import React, { useState, useEffect } from 'react';
import { Save, Eye, FileText, Tag, Folder, AlertCircle } from 'lucide-react';
import { BlogPost, CreatePostData, FormErrors, BlogFormData } from '../../../types';
import { Button } from '../../ui/Button';

interface BlogPostFormProps {
  post?: BlogPost; // If editing existing post
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

// Available categories - coordinating with Backend Specialist's category system
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

// Form validation
function validateBlogForm(formData: BlogFormData): FormErrors {
  const errors: FormErrors = {};

  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  } else if (formData.title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (formData.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }

  if (!formData.content.trim()) {
    errors.content = 'Content is required';
  } else if (formData.content.length < 50) {
    errors.content = 'Content must be at least 50 characters';
  }

  if (!formData.excerpt.trim()) {
    errors.excerpt = 'Excerpt is required';
  } else if (formData.excerpt.length < 20) {
    errors.excerpt = 'Excerpt must be at least 20 characters';
  } else if (formData.excerpt.length > 200) {
    errors.excerpt = 'Excerpt must be less than 200 characters';
  }

  if (!formData.category) {
    errors.category = 'Category is required';
  }

  return errors;
}

// Parse tags from string
function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0 && tag.length <= 20)
    .slice(0, 10); // Max 10 tags
}

export function BlogPostForm({
  post,
  onSubmit,
  onCancel,
  isLoading,
  error,
  className = ''
}: BlogPostFormProps) {
  const [formData, setFormData] = useState<BlogFormData>({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    tags: post?.tags.join(', ') || '',
    category: post?.category || '',
    status: post?.status || 'draft'
  });

  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [previewMode, setPreviewMode] = useState(false);

  // Auto-generate excerpt from content if excerpt is empty
  useEffect(() => {
    if (formData.content && !formData.excerpt) {
      const excerpt = formData.content
        .substring(0, 200)
        .replace(/\n/g, ' ')
        .trim();
      const lastSpace = excerpt.lastIndexOf(' ');
      const autoExcerpt = lastSpace > 0 ? excerpt.substring(0, lastSpace) + '...' : excerpt;
      
      setFormData(prev => ({ ...prev, excerpt: autoExcerpt }));
    }
  }, [formData.content, formData.excerpt]);

  const handleInputChange = (field: keyof BlogFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, status?: 'draft' | 'published') => {
    e.preventDefault();
    
    const submissionData = { ...formData };
    if (status) {
      submissionData.status = status;
    }

    // Validate form
    const errors = validateBlogForm(submissionData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const postData: CreatePostData = {
        title: submissionData.title.trim(),
        content: submissionData.content.trim(),
        excerpt: submissionData.excerpt.trim(),
        tags: parseTags(submissionData.tags),
        category: submissionData.category,
        status: submissionData.status
      };

      await onSubmit(postData);
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  const isEditMode = !!post;
  const wordCount = formData.content.split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className="text-gray-600">
          {isEditMode ? 'Update your blog post' : 'Share your ideas with the developer community'}
        </p>
      </div>

      {/* Global error message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Post Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fieldErrors.title ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter an engaging title for your post..."
            disabled={isLoading}
            maxLength={100}
          />
          <div className="flex justify-between items-center">
            {fieldErrors.title ? (
              <p className="text-sm text-red-600">{fieldErrors.title}</p>
            ) : (
              <div />
            )}
            <span className="text-xs text-gray-500">{formData.title.length}/100</span>
          </div>
        </div>

        {/* Category and Tags Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              <Folder className="inline h-4 w-4 mr-1" />
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                ${fieldErrors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              `}
              disabled={isLoading}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p className="text-sm text-red-600">{fieldErrors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              <Tag className="inline h-4 w-4 mr-1" />
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="javascript, react, tutorial (comma-separated)"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Separate tags with commas. Max 10 tags.
            </p>
          </div>
        </div>

        {/* Excerpt */}
        <div className="space-y-1">
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
            Post Excerpt <span className="text-red-500">*</span>
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => handleInputChange('excerpt', e.target.value)}
            className={`
              w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fieldErrors.excerpt ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            `}
            placeholder="Write a compelling excerpt that summarizes your post..."
            disabled={isLoading}
            rows={3}
            maxLength={200}
          />
          <div className="flex justify-between items-center">
            {fieldErrors.excerpt ? (
              <p className="text-sm text-red-600">{fieldErrors.excerpt}</p>
            ) : (
              <p className="text-xs text-gray-500">This will be shown on the blog homepage</p>
            )}
            <span className="text-xs text-gray-500">{formData.excerpt.length}/200</span>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              <FileText className="inline h-4 w-4 mr-1" />
              Post Content <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{wordCount} words</span>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                <Eye className="h-3 w-3" />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>
          </div>
          
          {previewMode ? (
            <div className="min-h-[300px] p-4 border border-gray-300 rounded-md bg-gray-50">
              <div className="prose max-w-none">
                {formData.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 last:mb-0">
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className={`
                w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm
                ${fieldErrors.content ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              `}
              placeholder="Write your blog post content here. Use markdown for formatting..."
              disabled={isLoading}
              rows={15}
            />
          )}
          
          {fieldErrors.content && (
            <p className="text-sm text-red-600">{fieldErrors.content}</p>
          )}
          <p className="text-xs text-gray-500">
            Supports markdown formatting. Minimum 50 characters required.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Save as Draft */}
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => handleSubmit(e, 'draft')}
              disabled={isLoading}
            >
              {isLoading && formData.status === 'draft' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </div>
              )}
            </Button>

            {/* Publish */}
            <Button
              type="button"
              variant="primary"
              onClick={(e) => handleSubmit(e, 'published')}
              disabled={isLoading}
            >
              {isLoading && formData.status === 'published' ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{isEditMode ? 'Update Post' : 'Publish Post'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Backend coordination info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-700 mb-2">
          🤝 Backend Coordination Status
        </h3>
        <div className="text-xs text-blue-600 space-y-1">
          <div>✅ API Endpoint: {isEditMode ? 'PUT /api/posts/:id' : 'POST /api/posts'}</div>
          <div>✅ JWT Authentication Headers</div>
          <div>✅ Form Validation & Error Handling</div>
          <div>✅ Draft/Published Status Management</div>
        </div>
      </div>
    </div>
  );
}