import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check if essential elements are present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in fake credentials
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Click submit
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Since we're using Supabase, it will attempt a real login and fail
    // We expect the error message from Supabase to appear
    await expect(page.locator('text=Invalid login credentials')).toBeVisible();
  });
});
