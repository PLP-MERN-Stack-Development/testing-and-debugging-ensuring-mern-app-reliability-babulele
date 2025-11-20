// cypress/support/commands.js - Custom Cypress commands

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/auth/login',
    body: {
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('mern_testing_token', response.body.token);
  });
});

// Custom command to register
Cypress.Commands.add('register', (username, email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/auth/register',
    body: {
      username,
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('mern_testing_token', response.body.token);
  });
});

// Custom command to create a post
Cypress.Commands.add('createPost', (title, content) => {
  const token = window.localStorage.getItem('mern_testing_token');
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/posts',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      title,
      content,
      published: true,
    },
  });
});

