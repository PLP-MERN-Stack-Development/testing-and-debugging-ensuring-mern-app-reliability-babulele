// usePosts.test.js - Unit tests for usePosts hook
import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from '../../../hooks/usePosts';
import * as api from '../../../utils/api';

jest.mock('../../../utils/api');

describe('usePosts Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => usePosts());

    expect(result.current.posts).toEqual([]);
    expect(result.current.currentPost).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch posts successfully', async () => {
    const mockPosts = [
      { _id: '1', title: 'Post 1' },
      { _id: '2', title: 'Post 2' },
    ];
    // API returns { posts: [...], pagination: {...} }
    api.getPosts.mockResolvedValue({ 
      posts: mockPosts,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 }
    });

    const { result } = renderHook(() => usePosts());

    await result.current.fetchPosts();

    await waitFor(() => {
      expect(result.current.posts).toEqual(mockPosts);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle fetch posts error', async () => {
    const errorMessage = 'Failed to fetch';
    api.getPosts.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePosts());

    await result.current.fetchPosts();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should create post successfully', async () => {
    const newPost = { _id: '3', title: 'New Post' };
    api.createPost.mockResolvedValue(newPost);

    const { result } = renderHook(() => usePosts());

    await result.current.createPost({ title: 'New Post' });

    await waitFor(() => {
      expect(result.current.posts).toContainEqual(newPost);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should update post successfully', async () => {
    const existingPost = { _id: '1', title: 'Old Title' };
    const updatedPost = { _id: '1', title: 'New Title' };
    
    // First fetch posts to populate state
    api.getPosts.mockResolvedValue({ posts: [existingPost] });
    const { result } = renderHook(() => usePosts());
    
    await result.current.fetchPosts();
    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1);
    });
    
    // Now update the post
    api.updatePost.mockResolvedValue(updatedPost);
    await result.current.updatePost('1', { title: 'New Title' });

    await waitFor(() => {
      expect(result.current.posts[0]).toEqual(updatedPost);
    });
  });

  it('should delete post successfully', async () => {
    const posts = [
      { _id: '1', title: 'Post 1' },
      { _id: '2', title: 'Post 2' },
    ];
    
    // First fetch posts to populate state
    api.getPosts.mockResolvedValue({ posts });
    const { result } = renderHook(() => usePosts());
    
    await result.current.fetchPosts();
    await waitFor(() => {
      expect(result.current.posts).toHaveLength(2);
    });
    
    // Now delete a post
    api.deletePost.mockResolvedValue({});
    await result.current.deletePost('1');

    await waitFor(() => {
      expect(result.current.posts).toHaveLength(1);
      expect(result.current.posts[0]._id).toBe('2');
    });
  });

  it('should handle fetchPosts when API returns data directly (not wrapped)', async () => {
    const mockPosts = [
      { _id: '1', title: 'Post 1' },
      { _id: '2', title: 'Post 2' },
    ];
    // API returns array directly (not wrapped in posts property)
    api.getPosts.mockResolvedValue(mockPosts);

    const { result } = renderHook(() => usePosts());

    await result.current.fetchPosts();

    await waitFor(() => {
      expect(result.current.posts).toEqual(mockPosts);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should fetch a single post successfully', async () => {
    const mockPost = { _id: '1', title: 'Post 1', content: 'Content' };
    api.getPost.mockResolvedValue(mockPost);

    const { result } = renderHook(() => usePosts());

    const post = await result.current.fetchPost('1');

    await waitFor(() => {
      expect(result.current.currentPost).toEqual(mockPost);
      expect(result.current.loading).toBe(false);
      expect(post).toEqual(mockPost);
    });
  });

  it('should handle fetchPost error', async () => {
    const errorMessage = 'Failed to fetch post';
    api.getPost.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => usePosts());

    await expect(result.current.fetchPost('1')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle fetchPost error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.getPost.mockRejectedValue(error);

    const { result } = renderHook(() => usePosts());

    await expect(result.current.fetchPost('1')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch post');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should update currentPost when updating the current post', async () => {
    const existingPost = { _id: '1', title: 'Old Title' };
    const updatedPost = { _id: '1', title: 'New Title' };
    
    api.getPost.mockResolvedValue(existingPost);
    const { result } = renderHook(() => usePosts());
    
    // First fetch the post to set it as currentPost
    await result.current.fetchPost('1');
    await waitFor(() => {
      expect(result.current.currentPost).toEqual(existingPost);
    });
    
    // Now update the post
    api.updatePost.mockResolvedValue(updatedPost);
    await result.current.updatePost('1', { title: 'New Title' });

    await waitFor(() => {
      expect(result.current.currentPost).toEqual(updatedPost);
    });
  });

  it('should clear currentPost when deleting the current post', async () => {
    const post = { _id: '1', title: 'Post 1' };
    
    api.getPost.mockResolvedValue(post);
    const { result } = renderHook(() => usePosts());
    
    // First fetch the post to set it as currentPost
    await result.current.fetchPost('1');
    await waitFor(() => {
      expect(result.current.currentPost).toEqual(post);
    });
    
    // Now delete the post
    api.deletePost.mockResolvedValue({});
    await result.current.deletePost('1');

    await waitFor(() => {
      expect(result.current.currentPost).toBeNull();
    });
  });

  it('should handle fetch posts error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.getPosts.mockRejectedValue(error);

    const { result } = renderHook(() => usePosts());

    await result.current.fetchPosts();

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch posts');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle create post error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.createPost.mockRejectedValue(error);

    const { result } = renderHook(() => usePosts());

    await expect(result.current.createPost({ title: 'New Post' })).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to create post');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle update post error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.updatePost.mockRejectedValue(error);

    const { result } = renderHook(() => usePosts());

    await expect(result.current.updatePost('1', { title: 'Updated' })).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to update post');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle delete post error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.deletePost.mockRejectedValue(error);

    const { result } = renderHook(() => usePosts());

    await expect(result.current.deletePost('1')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to delete post');
      expect(result.current.loading).toBe(false);
    });
  });
});

