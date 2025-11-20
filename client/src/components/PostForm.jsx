// PostForm.jsx - Form component for creating/editing posts
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../hooks/usePosts';
import Button from './Button';
import './PostForm.css';

const PostForm = ({ post, onSuccess, onCancel }) => {
  const { createPost, updatePost, loading, error } = usePosts();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    tags: post?.tags?.join(', ') || '',
    published: post?.published || false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      ...formData,
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      if (post) {
        await updatePost(post._id, postData);
      } else {
        await createPost(postData);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/posts');
      }
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h2>{post ? 'Edit Post' : 'Create New Post'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={200}
        />
      </div>

      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          minLength={10}
          rows={10}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleChange}
          />
          Published
        </label>
      </div>

      <div className="form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default PostForm;

