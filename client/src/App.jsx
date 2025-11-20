// App.jsx - Main application component
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './hooks/useAuth';
import './App.css';

const App = () => {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          <header className="app-header">
            <h1>MERN Testing Assignment</h1>
            <nav>
              {isAuthenticated ? (
                <>
                  <Link to="/posts">Posts</Link>
                  <Link to="/posts/new">New Post</Link>
                  <button onClick={logout} className="logout-btn">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/posts">Posts</Link>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Sign Up</Link>
                </>
              )}
            </nav>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Navigate to="/posts" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/posts" element={<PostList />} />
              <Route
                path="/posts/new"
                element={
                  isAuthenticated ? (
                    <PostForm />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route path="*" element={<div>404 - Page not found</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;

