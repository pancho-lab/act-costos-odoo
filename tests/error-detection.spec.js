const { test, expect } = require('@playwright/test');

test.describe('Error Detection in Costos Odoo App', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });

    // Listen for page errors
    page.on('pageerror', (error) => {
      console.log(`❌ Page Error: ${error.message}`);
    });

    // Listen for failed network requests
    page.on('response', (response) => {
      if (response.status() >= 400) {
        console.log(`❌ Failed Request: ${response.url()} - Status: ${response.status()}`);
      }
    });
  });

  test('should check for errors on the main dashboard', async ({ page }) => {
    console.log('🔍 Testing Dashboard Page...');
    
    try {
      await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
      
      // Wait for the main content to load
      await page.waitForSelector('body', { timeout: 10000 });
      
      // Check if the page loaded successfully
      const title = await page.title();
      console.log(`📄 Page Title: ${title}`);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'tests/dashboard-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved: tests/dashboard-screenshot.png');
      
      // Check for common error indicators
      const errorElements = await page.$$('*:has-text("Error"), *:has-text("error"), *:has-text("failed"), *:has-text("undefined")');
      if (errorElements.length > 0) {
        console.log(`⚠️ Found ${errorElements.length} potential error elements on the page`);
      }
      
      // Wait a bit more to catch any delayed errors
      await page.waitForTimeout(3000);
      
    } catch (error) {
      console.log(`❌ Test Error: ${error.message}`);
      throw error;
    }
  });

  test('should check for errors on products page', async ({ page }) => {
    console.log('🔍 Testing Products Page...');
    
    try {
      await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
      
      // Try to navigate to products page
      const productsLink = await page.$('a[href*="products"], button:has-text("Productos")');
      if (productsLink) {
        await productsLink.click();
        await page.waitForTimeout(2000);
        console.log('✅ Navigated to Products page');
      } else {
        console.log('⚠️ Could not find products navigation link');
      }
      
      await page.screenshot({ path: 'tests/products-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved: tests/products-screenshot.png');
      
    } catch (error) {
      console.log(`❌ Products Page Error: ${error.message}`);
      throw error;
    }
  });

  test('should check for errors on changes page', async ({ page }) => {
    console.log('🔍 Testing Changes Page...');
    
    try {
      await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
      
      // Try to navigate to changes page
      const changesLink = await page.$('a[href*="changes"], button:has-text("Cambios")');
      if (changesLink) {
        await changesLink.click();
        await page.waitForTimeout(2000);
        console.log('✅ Navigated to Changes page');
      } else {
        console.log('⚠️ Could not find changes navigation link');
      }
      
      await page.screenshot({ path: 'tests/changes-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved: tests/changes-screenshot.png');
      
    } catch (error) {
      console.log(`❌ Changes Page Error: ${error.message}`);
      throw error;
    }
  });

  test('should check for errors on sync page', async ({ page }) => {
    console.log('🔍 Testing Sync Page...');
    
    try {
      await page.goto('http://localhost:3005', { waitUntil: 'networkidle' });
      
      // Try to navigate to sync page
      const syncLink = await page.$('a[href*="sync"], button:has-text("Sync")');
      if (syncLink) {
        await syncLink.click();
        await page.waitForTimeout(2000);
        console.log('✅ Navigated to Sync page');
      } else {
        console.log('⚠️ Could not find sync navigation link');
      }
      
      await page.screenshot({ path: 'tests/sync-screenshot.png', fullPage: true });
      console.log('📸 Screenshot saved: tests/sync-screenshot.png');
      
    } catch (error) {
      console.log(`❌ Sync Page Error: ${error.message}`);
      throw error;
    }
  });

  test('should check backend API endpoints', async ({ page }) => {
    console.log('🔍 Testing Backend API endpoints...');
    
    const endpoints = [
      'http://localhost:3010/api/products',
      'http://localhost:3010/api/categories',
      'http://localhost:3010/api/changes'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.request.get(endpoint);
        console.log(`📡 ${endpoint}: ${response.status()}`);
        
        if (response.status() >= 400) {
          const text = await response.text();
          console.log(`❌ Error response: ${text.substring(0, 200)}...`);
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${endpoint}: ${error.message}`);
      }
    }
  });
});