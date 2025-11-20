# Generating Test Coverage Screenshots

This guide explains how to generate screenshots of test coverage reports for submission.

## Steps to Generate Coverage Screenshots

### 1. Run Coverage Report

```bash
# From the root directory
npm run test:coverage
```

This will generate coverage reports in:
- `coverage/server/` - Server-side coverage
- `coverage/client/` - Client-side coverage

### 2. Open Coverage Reports

#### Option A: Using Browser

1. Open the HTML coverage reports:
   - Server: `coverage/server/index.html`
   - Client: `coverage/client/index.html`

2. Take screenshots of:
   - Overall coverage summary (main page)
   - Coverage by file (file list page)
   - Individual file coverage (at least 2-3 files)

#### Option B: Using Command Line

```bash
# View coverage summary in terminal
npm run test:coverage | grep -A 10 "Coverage summary"
```

### 3. Screenshots to Take

Take screenshots of:

1. **Overall Coverage Summary**
   - Shows statements, branches, functions, lines percentages
   - Should show coverage meeting 70% threshold

2. **Server Coverage Summary**
   - `coverage/server/index.html`
   - Shows all server files and their coverage

3. **Client Coverage Summary**
   - `coverage/client/index.html`
   - Shows all client files and their coverage

4. **Sample File Coverage**
   - Pick 2-3 files showing good coverage
   - Example: `server/src/utils/auth.js`
   - Example: `client/src/components/Button.jsx`

### 4. Save Screenshots

Save screenshots in a `coverage-screenshots/` directory:

```
coverage-screenshots/
├── overall-coverage.png
├── server-coverage-summary.png
├── client-coverage-summary.png
├── server-auth-utils-coverage.png
└── client-button-component-coverage.png
```

### 5. Alternative: Automated Screenshot Script

If you have a headless browser setup, you can use:

```bash
# Install puppeteer (if not already installed)
npm install --save-dev puppeteer

# Run screenshot script
node scripts/screenshot-coverage.js
```

## Coverage Thresholds

The project is configured with these coverage thresholds (in `jest.config.js`):

- **Statements**: 70%
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 70%

Ensure your coverage meets these thresholds before taking screenshots.

## Notes

- Coverage reports are generated in HTML format for easy viewing
- Screenshots should clearly show coverage percentages
- Include timestamps if possible to show recent test runs
- Make sure screenshots are readable and not blurry


