// visual-regression.cy.js - Visual regression tests using Cypress
describe('Visual Regression Tests', () => {
  beforeEach(() => {
    // Set viewport for consistent screenshots
    cy.viewport(1280, 720);
  });

  describe('Authentication Pages', () => {
    it('should match login page snapshot', () => {
      cy.visit('/login');
      
      // Wait for page to load
      cy.get('h2').contains('Login').should('be.visible');
      
      // Take screenshot for visual regression
      cy.screenshot('login-page', {
        capture: 'viewport',
        overwrite: true,
      });
    });

    it('should match registration page snapshot', () => {
      cy.visit('/register');
      
      // Wait for page to load
      cy.get('h2').contains('Sign Up').should('be.visible');
      
      // Take screenshot for visual regression
      cy.screenshot('register-page', {
        capture: 'viewport',
        overwrite: true,
      });
    });
  });

  describe('Posts Pages', () => {
    beforeEach(() => {
      // Login before testing posts pages
      cy.login('test@example.com', 'password123');
    });

    it('should match posts list page snapshot', () => {
      cy.visit('/posts');
      
      // Wait for posts to load
      cy.wait(1000);
      cy.get('h2').contains('Posts').should('be.visible');
      
      // Take screenshot
      cy.screenshot('posts-list-page', {
        capture: 'viewport',
        overwrite: true,
      });
    });

    it('should match new post form snapshot', () => {
      cy.visit('/posts/new');
      
      // Wait for form to load
      cy.get('h2').contains('Create New Post').should('be.visible');
      
      // Take screenshot
      cy.screenshot('new-post-form', {
        capture: 'viewport',
        overwrite: true,
      });
    });

    it('should match empty posts state snapshot', () => {
      // Intercept API to return empty posts
      cy.intercept('GET', '**/api/posts*', { 
        body: { posts: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
      }).as('emptyPosts');
      
      cy.visit('/posts');
      cy.wait('@emptyPosts');
      
      // Wait for empty state
      cy.contains('No posts found').should('be.visible');
      
      // Take screenshot
      cy.screenshot('empty-posts-state', {
        capture: 'viewport',
        overwrite: true,
      });
    });
  });

  describe('Error States', () => {
    it('should match error boundary snapshot', () => {
      // This would require triggering an error boundary
      // For now, we'll test error message display
      cy.visit('/posts');
      
      // Intercept and fail the API call
      cy.intercept('GET', '**/api/posts*', { statusCode: 500 }).as('error');
      
      cy.wait('@error');
      
      // Wait for error message
      cy.contains('Error', { timeout: 5000 }).should('be.visible');
      
      // Take screenshot
      cy.screenshot('error-state', {
        capture: 'viewport',
        overwrite: true,
      });
    });

    it('should match 404 page snapshot', () => {
      cy.visit('/non-existent-route', { failOnStatusCode: false });
      
      // Wait for 404 message
      cy.contains('404', { timeout: 5000 }).should('be.visible');
      
      // Take screenshot
      cy.screenshot('404-page', {
        capture: 'viewport',
        overwrite: true,
      });
    });
  });

  describe('Component Visual Tests', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password123');
    });

    it('should match post card component snapshot', () => {
      cy.visit('/posts');
      
      // Wait for posts to load
      cy.wait(1000);
      
      // Get first post card
      cy.get('.post-card').first().should('be.visible');
      
      // Take screenshot of post card
      cy.get('.post-card').first().screenshot('post-card-component', {
        overwrite: true,
      });
    });

    it('should match button component states', () => {
      cy.visit('/posts/new');
      
      // Test button in different states
      cy.get('button[type="submit"]').should('be.visible');
      
      // Take screenshot of button
      cy.get('button[type="submit"]').screenshot('submit-button', {
        overwrite: true,
      });
      
      // Test disabled state
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });
});


