import { test, expect } from '@playwright/test';

test.describe('Sign Up Flow', () => {
  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('should show validation error for short username', async ({ page }) => {
    await page.goto('/signup');

    // Fill in a username that is too short (< 3 chars)
    await page.getByLabel('Username').fill('ab');
    await page.getByLabel('Email Address').fill('test@example.com');
    await page.getByLabel('Password').fill('Password123!');

    await page.getByRole('button', { name: 'Create Account' }).click();

    // The app uses `toast.error` for this validation
    await expect(page.getByText(/username must be at least 3 characters/i)).toBeVisible();
  });

  test('should navigate to login page from signup', async ({ page }) => {
    await page.goto('/signup');

    await page.getByRole('link', { name: /sign in/i }).click();

    await expect(page).toHaveURL('/login');
  });
});
