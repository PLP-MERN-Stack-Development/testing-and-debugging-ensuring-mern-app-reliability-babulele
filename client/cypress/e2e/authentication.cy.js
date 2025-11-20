// authentication.cy.js - E2E tests for authentication flows
describe('Authentication Flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should handle login with invalid credentials', () => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/auth/login',
      body: {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('error');
    });
  });

  it('should handle registration with existing email', () => {
    // First register a user
    const username = `testuser${Date.now()}`;
    const email = `test${Date.now()}@example.com`;
    const password = 'password123';

    cy.register(username, email, password);

    // Try to register again with same email
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/auth/register',
      body: {
        username: 'anotheruser',
        email: email, // Same email
        password: 'password123',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
    });
  });

  it('should require authentication for protected routes', () => {
    // Try to create a post without authentication
    cy.request({
      method: 'POST',
      url: 'http://localhost:5000/api/posts',
      body: {
        title: 'Unauthorized Post',
        content: 'This should fail',
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});

