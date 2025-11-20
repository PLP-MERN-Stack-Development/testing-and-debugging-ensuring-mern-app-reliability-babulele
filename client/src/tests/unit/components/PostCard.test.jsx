// PostCard.test.jsx - Unit tests for PostCard component
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '../../../components/PostCard';

describe('PostCard Component', () => {
  const mockPost = {
    _id: '1',
    title: 'Test Post',
    content: 'This is a test post content that is longer than 150 characters to test the substring functionality of the PostCard component',
    author: { username: 'testuser' },
    views: 10,
    tags: ['test', 'example'],
  };

  it('should render post title', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('should render post content (truncated)', () => {
    render(<PostCard post={mockPost} />);
    const content = screen.getByText(/This is a test post content/i);
    expect(content).toBeInTheDocument();
  });

  it('should render author username', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/By testuser/i)).toBeInTheDocument();
  });

  it('should render views count', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText(/10 views/i)).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('example')).toBeInTheDocument();
  });

  it('should handle post without tags', () => {
    const postWithoutTags = { ...mockPost, tags: null };
    render(<PostCard post={postWithoutTags} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });

  it('should handle post with unknown author', () => {
    const postWithoutAuthor = { ...mockPost, author: null };
    render(<PostCard post={postWithoutAuthor} />);
    expect(screen.getByText(/By Unknown/i)).toBeInTheDocument();
  });

  it('should handle short content without truncation', () => {
    const shortPost = { ...mockPost, content: 'Short content' };
    render(<PostCard post={shortPost} />);
    expect(screen.getByText('Short content')).toBeInTheDocument();
  });
});

