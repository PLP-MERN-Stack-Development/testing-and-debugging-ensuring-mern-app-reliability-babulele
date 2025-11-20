# Testing and Debugging MERN Applications

This assignment focuses on implementing comprehensive testing strategies for a MERN stack application, including unit testing, integration testing, and end-to-end testing, along with debugging techniques.

## Assignment Overview

You will:
1. Set up testing environments for both client and server
2. Write unit tests for React components and server functions
3. Implement integration tests for API endpoints
4. Create end-to-end tests for critical user flows
5. Apply debugging techniques for common MERN stack issues

## Project Structure

```
mern-testing/
├── client/                 # React front-end
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── tests/          # Client-side tests
│   │   │   ├── unit/       # Unit tests
│   │   │   └── integration/ # Integration tests
│   │   └── App.jsx         # Main application component
│   └── cypress/            # End-to-end tests
├── server/                 # Express.js back-end
│   ├── src/                # Server source code
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Custom middleware
│   └── tests/              # Server-side tests
│       ├── unit/           # Unit tests
│       └── integration/    # Integration tests
├── jest.config.js          # Jest configuration
└── package.json            # Project dependencies
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week6-Assignment.md` file
4. Explore the starter code and existing tests
5. Complete the tasks outlined in the assignment

## Files Included

- `Week6-Assignment.md`: Detailed assignment instructions
- Starter code for a MERN application with basic test setup:
  - Sample React components with test files
  - Express routes with test files
  - Jest and testing library configurations
  - Example tests for reference

## Requirements

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn
- Basic understanding of testing concepts

## Testing Tools

- Jest: JavaScript testing framework
- React Testing Library: Testing utilities for React
- Supertest: HTTP assertions for API testing
- Cypress/Playwright: End-to-end testing framework
- MongoDB Memory Server: In-memory MongoDB for testing

## Testing Strategy

### Overview

This project implements a comprehensive testing strategy following the testing pyramid approach:
- **Unit Tests**: Fast, isolated tests for individual functions and components
- **Integration Tests**: Tests for API endpoints and component interactions
- **End-to-End Tests**: Full user flow tests using Cypress

### Test Coverage Goals

- **Unit Tests**: Minimum 70% coverage (statements, branches, functions, lines)
- **Integration Tests**: All API endpoints and critical component interactions
- **E2E Tests**: All critical user flows (registration, login, CRUD operations)

### Unit Testing Strategy

#### Server-Side Unit Tests
- **Location**: `server/tests/unit/`
- **Coverage**:
  - Authentication utilities (`auth.test.js`)
  - Logger utilities (`logger.test.js`)
  - Middleware functions (`middleware/auth.test.js`)
- **Approach**: Test functions in isolation with mocked dependencies

#### Client-Side Unit Tests
- **Location**: `client/src/tests/unit/`
- **Coverage**:
  - React components (`Button.test.jsx`, `ErrorBoundary.test.jsx`, `PostCard.test.jsx`, `PostForm.test.jsx`, `Login.test.jsx`, `Register.test.jsx`)
  - Custom hooks (`hooks/useAuth.test.js`, `hooks/usePosts.test.js`)
  - Utility functions (`validators.test.js`, `storage.test.js`)
- **Approach**: Test components in isolation using React Testing Library

### Integration Testing Strategy

#### Server-Side Integration Tests
- **Location**: `server/tests/integration/`
- **Coverage**:
  - Authentication endpoints (`auth.test.js`)
  - Posts CRUD operations (`posts.test.js`)
  - User management (`users.test.js`)
- **Approach**: 
  - Use MongoDB Memory Server for isolated test database
  - Test full request/response cycles with Supertest
  - Test authentication, authorization, and validation

#### Client-Side Integration Tests
- **Location**: `client/src/tests/integration/`
- **Coverage**:
  - Components that interact with APIs (`PostList.test.jsx`)
  - Form submissions and data validation
- **Approach**: Mock API calls and test component behavior

### End-to-End Testing Strategy

- **Location**: `client/cypress/e2e/`
- **Framework**: Cypress
- **Coverage**:
  - User registration and login flows (`authentication.cy.js`)
  - Posts CRUD operations (`critical-flows.cy.js`)
  - Navigation and routing
  - Error handling
  - Visual regression tests (`visual-regression.cy.js`)
- **Approach**: 
  - Test complete user journeys
  - Use custom Cypress commands for common operations
  - Test both happy paths and error scenarios
  - Visual regression testing with screenshots

### Debugging Techniques Implemented

#### Server-Side Debugging
1. **Structured Logging** (`server/src/utils/logger.js`)
   - Info, error, warn, and debug log levels
   - Request logging middleware
   - Error logging with stack traces in development

2. **Global Error Handler** (`server/src/middleware/errorHandler.js`)
   - Centralized error handling
   - Specific error types (validation, authentication, etc.)
   - Detailed error messages in development mode

3. **Request Logging**
   - Morgan middleware for HTTP request logging
   - Custom logging middleware for additional context

4. **Performance Monitoring** (`server/src/middleware/performance.js`)
   - Request duration tracking
   - Memory usage monitoring
   - Slow request detection (>1 second)
   - Response time headers (X-Response-Time)
   - Performance metrics logging

#### Client-Side Debugging
1. **Error Boundaries** (`client/src/components/ErrorBoundary.jsx`)
   - Catches React component errors
   - Displays user-friendly error messages
   - Shows detailed errors in development mode
   - Allows error recovery

2. **Browser Developer Tools**
   - Console logging for debugging
   - Network tab for API debugging
   - React DevTools for component inspection

3. **Error Handling in API Calls**
   - Centralized error handling in API utility
   - User-friendly error messages
   - Proper error propagation

### Running Tests

```bash
# Install all dependencies
npm run install-all

# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run E2E tests (requires server and client to be running)
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Test Coverage Reports

After running tests with coverage, reports are generated in:
- **Server**: `coverage/server/`
- **Client**: `coverage/client/`

Open `coverage/*/index.html` in a browser to view detailed coverage reports.

### Best Practices Followed

1. **Test Isolation**: Each test is independent and can run in any order
2. **Clean Setup/Teardown**: Database is cleaned between tests
3. **Mock External Dependencies**: API calls and external services are mocked
4. **Descriptive Test Names**: Tests clearly describe what they're testing
5. **AAA Pattern**: Arrange, Act, Assert structure in tests
6. **Edge Case Coverage**: Tests include error scenarios and edge cases
7. **Maintainable Tests**: Tests are easy to read and maintain

### Continuous Integration

Tests are designed to run in CI/CD pipelines:
- Fast execution (unit tests run quickly)
- No external dependencies (MongoDB Memory Server)
- Deterministic results (no flaky tests)

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. ✅ Complete all required tests (unit, integration, and end-to-end)
2. ✅ Achieve at least 70% code coverage for unit tests
3. ✅ Document your testing strategy in the README.md
4. 📸 Include screenshots of your test coverage reports (add to repository)
5. ✅ Demonstrate debugging techniques in your code

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [MongoDB Testing Best Practices](https://www.mongodb.com/blog/post/mongodb-testing-best-practices) 