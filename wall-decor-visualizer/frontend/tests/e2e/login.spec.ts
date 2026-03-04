import { test, expect } from '@playwright/test';

test.describe('Login Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should complete full login flow and reach dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the login page
    await expect(page.locator('h1')).toContainText('Wall Decor Visualizer', { timeout: 10000 });
    
    // Enter phone number
    const phoneInput = page.locator('input[placeholder="Enter phone number"]');
    await phoneInput.waitFor({ state: 'visible', timeout: 10000 });
    await phoneInput.fill('1234567890');
    
    // Click "Send OTP" button
    const sendOtpButton = page.locator('button:has-text("Send OTP")');
    await sendOtpButton.click();
    
    // Wait for OTP form to appear
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 5000 });
    
    // Enter OTP
    const otpInput = page.locator('input[placeholder="Enter 4-digit OTP"]');
    await otpInput.fill('2213');
    
    // Click "Verify OTP" button
    const verifyButton = page.locator('button:has-text("Verify OTP")');
    await verifyButton.click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Verify dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for incorrect OTP and allow retry', async ({ page }) => {
    // Navigate and enter phone number
    await page.goto('/');
    const phoneInput = page.locator('input[placeholder="Enter phone number"]');
    await phoneInput.fill('1234567890');
    await page.locator('button:has-text("Send OTP")').click();
    
    // Wait for OTP form
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 5000 });
    
    // Enter wrong OTP
    const otpInput = page.locator('input[placeholder="Enter 4-digit OTP"]');
    await otpInput.fill('1111');
    await page.locator('button:has-text("Verify OTP")').click();
    
    // Verify error message appears
    await expect(page.locator('text=/Incorrect OTP/i')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/attempts remaining/i')).toBeVisible();
    
    // Clear and enter correct OTP
    await otpInput.clear();
    await otpInput.fill('2213');
    await page.locator('button:has-text("Verify OTP")').click();
    
    // Verify success - redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('should persist session after browser refresh', async ({ page, context }) => {
    // Complete login
    await page.goto('/');
    await page.locator('input[placeholder="Enter phone number"]').fill('1234567890');
    await page.locator('button:has-text("Send OTP")').click();
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 5000 });
    await page.locator('input[placeholder="Enter 4-digit OTP"]').fill('2213');
    await page.locator('button:has-text("Verify OTP")').click();
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Refresh the page
    await page.reload();
    
    // Verify still on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid phone number', async ({ page }) => {
    await page.goto('/');
    
    // Enter invalid phone number (too short)
    const phoneInput = page.locator('input[placeholder="Enter phone number"]');
    await phoneInput.fill('123');
    
    // Try to submit
    const sendOtpButton = page.locator('button:has-text("Send OTP")');
    await sendOtpButton.click();
    
    // Verify error message
    await expect(page.locator('text=/Phone number must be 10 digits/i')).toBeVisible({ timeout: 3000 });
  });

  test('should allow going back to phone form from OTP form', async ({ page }) => {
    // Navigate and enter phone number
    await page.goto('/');
    await page.locator('input[placeholder="Enter phone number"]').fill('1234567890');
    await page.locator('button:has-text("Send OTP")').click();
    
    // Wait for OTP form
    await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 5000 });
    
    // Click back button
    await page.locator('button:has-text("Back to Phone Number")').click();
    
    // Verify we're back on phone form
    await expect(page.locator('input[placeholder="Enter phone number"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send OTP")')).toBeVisible();
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Send OTP multiple times quickly
    const phoneInput = page.locator('input[placeholder="Enter phone number"]');
    const sendOtpButton = page.locator('button:has-text("Send OTP")');
    
    for (let i = 0; i < 4; i++) {
      await phoneInput.fill('1234567890');
      await sendOtpButton.click();
      
      if (i < 3) {
        // Wait for OTP form and go back
        await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 5000 });
        await page.locator('button:has-text("Back to Phone Number")').click();
        await page.waitForTimeout(100);
      }
    }
    
    // On 4th attempt, should see rate limit error
    await expect(page.locator('text=/Rate limit exceeded/i')).toBeVisible({ timeout: 3000 });
  });
});
