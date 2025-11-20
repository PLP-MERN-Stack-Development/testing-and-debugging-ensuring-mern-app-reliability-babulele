// screenshot-coverage.js - Script to generate coverage report screenshots
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'coverage-screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function takeScreenshot(url, filename, options = {}) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to coverage report
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait a bit for any animations
    await page.waitForTimeout(1000);
    
    // Take screenshot
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({
      path: filepath,
      fullPage: true,
      ...options,
    });
    
    console.log(`✓ Screenshot saved: ${filepath}`);
  } catch (error) {
    console.error(`✗ Error taking screenshot for ${filename}:`, error.message);
  } finally {
    await browser.close();
  }
}

async function generateScreenshots() {
  console.log('Generating coverage report screenshots...\n');
  
  const basePath = path.join(__dirname, '..');
  const serverCoverage = `file://${path.join(basePath, 'coverage', 'server', 'index.html')}`;
  const clientCoverage = `file://${path.join(basePath, 'coverage', 'client', 'index.html')}`;
  
  // Check if coverage reports exist
  const serverExists = fs.existsSync(path.join(basePath, 'coverage', 'server', 'index.html'));
  const clientExists = fs.existsSync(path.join(basePath, 'coverage', 'client', 'index.html'));
  
  if (!serverExists || !clientExists) {
    console.error('Error: Coverage reports not found. Please run "npm run test:coverage" first.');
    process.exit(1);
  }
  
  try {
    // Server coverage
    await takeScreenshot(serverCoverage, 'server-coverage-summary.png');
    
    // Client coverage
    await takeScreenshot(clientCoverage, 'client-coverage-summary.png');
    
    console.log('\n✓ All screenshots generated successfully!');
    console.log(`  Location: ${SCREENSHOT_DIR}`);
  } catch (error) {
    console.error('Error generating screenshots:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateScreenshots();
}

module.exports = { generateScreenshots };


