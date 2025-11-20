// PostList.jsx - Component to display list of posts
import React, { useState, useEffect } from 'react';
import { usePosts } from '../hooks/usePosts';
import PostCard from './PostCard';
import Button from './Button';
import './PostList.css';

const PostList = () => {
  const { posts, loading, error, fetchPosts } = usePosts();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchPosts({ page, published: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(filter.toLowerCase()) ||
    post.content.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="post-list">
      <div className="post-list-header">
        <h2>Posts</h2>
        <input
          type="text"
          placeholder="Search posts..."
          value={filter}
          onChange={handleFilterChange}
          className="search-input"
        />
      </div>
      <div className="posts-grid">
        {filteredPosts.length === 0 ? (
          <p>No posts found</p>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        )}
      </div>
      <div className="pagination">
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={posts.length < 10}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default PostList;

