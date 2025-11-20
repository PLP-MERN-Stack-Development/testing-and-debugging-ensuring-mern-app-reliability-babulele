// PostCard.jsx - Component to display a single post card
import React from 'react';
import './PostCard.css';

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">
        {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
      </p>
      <div className="post-meta">
        <span className="post-author">
          By {post.author?.username || 'Unknown'}
        </span>
        <span className="post-views">{post.views} views</span>
      </div>
      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          {post.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostCard;

