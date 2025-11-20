// critical-flows.cy.js - E2E tests for critical user flows
describe('Critical User Flows', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.clearLocalStorage();
  });

  describe('User Registration Flow', () => {
    it('should register a new user successfully', () => {
      const username = `testuser${Date.now()}`;
      const email = `test${Date.now()}@example.com`;
      const password = 'password123';

      cy.visit('/');
      
      // Navigate to registration (if there's a link)
      // For now, we'll test via API
      cy.register(username, email, password);
      
      // Verify token is stored
      cy.window().its('localStorage').invoke('getItem', 'mern_testing_token').should('exist');
    });
  });

  describe('User Login Flow', () => {
    it('should login with valid credentials', () => {
      const email = 'test@example.com';
      const password = 'password123';

      cy.login(email, password);
      
      // Verify token is stored
      cy.window().its('localStorage').invoke('getItem', 'mern_testing_token').should('exist');
    });
  });

  describe('Posts CRUD Operations', () => {
    beforeEach(() => {
      // Login before each test
      cy.login('test@example.com', 'password123');
    });

    it('should display list of posts', () => {
      cy.visit('/posts');
      
      // Should see posts list
      cy.get('h2').contains('Posts').should('be.visible');
    });

    it('should create a new post', () => {
      cy.visit('/posts/new');
      
      const title = `Test Post ${Date.now()}`;
      const content = 'This is a test post content for E2E testing';
      
      cy.get('input[name="title"]').type(title);
      cy.get('textarea[name="content"]').type(content);
      cy.get('button[type="submit"]').click();
      
      // Should redirect or show success message
      cy.url().should('include', '/posts');
    });

    it('should search/filter posts', () => {
      cy.visit('/posts');
      
      // Wait for posts to load
      cy.wait(1000);
      
      // Type in search input
      cy.get('input[placeholder*="Search"]').type('test');
      
      // Should filter results
      cy.get('.post-card').should('exist');
    });
  });

  describe('Navigation and Routing', () => {
    it('should navigate between pages', () => {
      cy.visit('/');
      
      // Should redirect to /posts
      cy.url().should('include', '/posts');
      
      // Navigate to new post page (if authenticated)
      cy.login('test@example.com', 'password123');
      cy.visit('/posts/new');
      cy.url().should('include', '/posts/new');
    });

    it('should handle 404 for non-existent routes', () => {
      cy.visit('/non-existent-route');
      
      // Should show 404 message
      cy.contains('404').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      cy.visit('/posts');
      
      // Intercept and fail the API call
      cy.intercept('GET', '**/api/posts', { statusCode: 500 }).as('getPostsError');
      
      cy.wait('@getPostsError');
      
      // Should show error message
      cy.contains('Error', { timeout: 5000 }).should('be.visible');
    });
  });
});

