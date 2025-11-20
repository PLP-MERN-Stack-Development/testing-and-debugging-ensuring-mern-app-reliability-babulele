// PostList.test.jsx - Integration tests for PostList component
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostList from '../../components/PostList';
import * as api from '../../utils/api';

// Mock the API
jest.mock('../../utils/api');

describe('PostList Integration Tests', () => {
  const mockPosts = [
    {
      _id: '1',
      title: 'Test Post 1',
      content: 'This is test post content 1',
      author: { username: 'user1' },
      views: 10,
      tags: ['test', 'example'],
    },
    {
      _id: '2',
      title: 'Test Post 2',
      content: 'This is test post content 2',
      author: { username: 'user2' },
      views: 5,
      tags: ['demo'],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display posts', async () => {
    // Mock the API to return posts in the format the controller returns
    api.getPosts.mockResolvedValue({ 
      posts: mockPosts,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 }
    });

    render(<PostList />);

    expect(screen.getByText('Loading posts...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(api.getPosts).toHaveBeenCalledWith({ page: 1, published: true });
  });

  it('should handle API errors', async () => {
    api.getPosts.mockRejectedValue(new Error('API Error'));

    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/i)).toBeInTheDocument();
    });
  });

  it('should filter posts by search term', async () => {
    api.getPosts.mockResolvedValue({ 
      posts: mockPosts,
      pagination: { page: 1, limit: 10, total: 2, pages: 1 }
    });

    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
    }, { timeout: 3000 });

    const searchInput = screen.getByPlaceholderText('Search posts...');
    fireEvent.change(searchInput, { target: { value: 'Post 1' } });

    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display message when no posts found', async () => {
    api.getPosts.mockResolvedValue({ 
      posts: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    });

    render(<PostList />);

    await waitFor(() => {
      expect(screen.getByText('No posts found')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

