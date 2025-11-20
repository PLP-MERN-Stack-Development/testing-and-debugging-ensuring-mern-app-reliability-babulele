// usePosts.js - Custom hook for managing posts
import { useState, useCallback } from 'react';
import { getPosts, getPost, createPost, updatePost, deletePost as deletePostAPI } from '../utils/api';

export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPosts(params);
      setPosts(data.posts || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const post = await getPost(id);
      setCurrentPost(post);
      return post;
    } catch (err) {
      setError(err.message || 'Failed to fetch post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPostHandler = useCallback(async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const newPost = await createPost(postData);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err.message || 'Failed to create post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePostHandler = useCallback(async (id, postData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPost = await updatePost(id, postData);
      setPosts((prev) =>
        prev.map((post) => (post._id === id ? updatedPost : post))
      );
      if (currentPost && currentPost._id === id) {
        setCurrentPost(updatedPost);
      }
      return updatedPost;
    } catch (err) {
      setError(err.message || 'Failed to update post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPost]);

  const deletePost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deletePostAPI(id);
      setPosts((prev) => prev.filter((post) => post._id !== id));
      if (currentPost && currentPost._id === id) {
        setCurrentPost(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPost]);

  return {
    posts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPost,
    createPost: createPostHandler,
    updatePost: updatePostHandler,
    deletePost,
  };
};

