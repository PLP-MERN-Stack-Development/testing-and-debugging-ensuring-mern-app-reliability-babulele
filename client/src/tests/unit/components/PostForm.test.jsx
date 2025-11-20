// PostForm.test.jsx - Unit tests for PostForm component
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PostForm from '../../../components/PostForm';
import * as usePostsHook from '../../../hooks/usePosts';

jest.mock('../../../hooks/usePosts');

describe('PostForm Component', () => {
  const mockCreatePost = jest.fn();
  const mockUpdatePost = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    usePostsHook.usePosts.mockReturnValue({
      createPost: mockCreatePost,
      updatePost: mockUpdatePost,
      loading: false,
      error: null,
    });
    
    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render create post form', () => {
    renderWithRouter(<PostForm />);
    
    expect(screen.getByText('Create New Post')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Content/i)).toBeInTheDocument();
  });

  it('should render edit post form when post prop provided', () => {
    const existingPost = {
      _id: '1',
      title: 'Existing Post',
      content: 'Existing content',
      tags: ['tag1', 'tag2'],
      published: true,
    };

    renderWithRouter(<PostForm post={existingPost} />);
    
    expect(screen.getByText('Edit Post')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Post')).toBeInTheDocument();
  });

  it('should handle form submission for new post', async () => {
    mockCreatePost.mockResolvedValue({ _id: '1', title: 'New Post' });
    
    renderWithRouter(<PostForm />);
    
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'New Post' },
    });
    fireEvent.change(screen.getByLabelText(/Content/i), {
      target: { value: 'This is the content for the new post' },
    });
    
    fireEvent.click(screen.getByText('Create Post'));
    
    await waitFor(() => {
      expect(mockCreatePost).toHaveBeenCalled();
    });
  });

  it('should handle form submission for editing post', async () => {
    const existingPost = {
      _id: '1',
      title: 'Old Title',
      content: 'Old content',
    };
    
    mockUpdatePost.mockResolvedValue({ ...existingPost, title: 'Updated Title' });
    
    renderWithRouter(<PostForm post={existingPost} />);
    
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: 'Updated Title' },
    });
    
    fireEvent.click(screen.getByText('Update Post'));
    
    await waitFor(() => {
      expect(mockUpdatePost).toHaveBeenCalled();
    });
  });

  it('should display error message when error occurs', () => {
    usePostsHook.usePosts.mockReturnValue({
      createPost: mockCreatePost,
      updatePost: mockUpdatePost,
      loading: false,
      error: 'Failed to create post',
    });

    renderWithRouter(<PostForm />);
    
    expect(screen.getByText('Failed to create post')).toBeInTheDocument();
  });

  it('should handle tags input', () => {
    renderWithRouter(<PostForm />);
    
    const tagsInput = screen.getByLabelText(/Tags/i);
    fireEvent.change(tagsInput, {
      target: { value: 'tag1, tag2, tag3' },
    });
    
    expect(tagsInput.value).toBe('tag1, tag2, tag3');
  });

  it('should handle published checkbox', () => {
    renderWithRouter(<PostForm />);
    
    const checkbox = screen.getByLabelText(/Published/i);
    expect(checkbox.checked).toBe(false);
    
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});


