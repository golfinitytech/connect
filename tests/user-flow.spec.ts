import { test, expect } from '@playwright/test';

test('User flow: Login -> Navigation -> Features', async ({ page }) => {
  await test.step('Login', async () => {
    console.log('Navigating to login page...');
    await page.goto('/');
    
    // Wait for login screen
    console.log('Waiting for login screen...');
    await expect(page.getByText('Sign in to continue')).toBeVisible({ timeout: 20000 });

    console.log('Filling login credentials...');
    await page.getByPlaceholder('Enter your email').fill('admin@golfinity.id');
    await page.getByPlaceholder('Enter your password').fill('admin123');
    
    console.log('Clicking Sign In...');
    await page.getByText('Sign In').click();

    // 2. Home Screen
    console.log('Waiting for Home screen...');
    await expect(page.getByText('Good morning')).toBeVisible({ timeout: 30000 });
    await expect(page.getByText('Start New Round')).toBeVisible();
  });

  await test.step('Navigate to Stats', async () => {
    console.log('Navigating to Stats...');
    await page.getByRole('link', { name: 'Stats' }).click();
    await expect(page.getByText('Round Summary')).toBeVisible();
  });

  await test.step('Navigate to Social', async () => {
    console.log('Navigating to Social...');
    await page.getByRole('link', { name: 'Social' }).click();
    await expect(page.getByText('Live Leaderboard')).toBeVisible();
  });

  await test.step('Navigate to Order', async () => {
    console.log('Navigating to Order...');
    await page.getByRole('link', { name: 'Order' }).click();
    await expect(page.getByText('Order Refreshments')).toBeVisible();
  });

  await test.step('Navigate to Profile', async () => {
    console.log('Navigating to Profile...');
    await page.getByRole('link', { name: 'Profile' }).click();
    await expect(page.getByText('Settings')).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
  });
  
  await test.step('Start New Round', async () => {
    console.log('Going back to Home to start new round...');
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByText('Start New Round').click();
    
    // 8. Select Course
    console.log('Selecting course...');
    await expect(page.getByText('1. Select Course')).toBeVisible();
    await page.getByText('Pebble Beach').first().click();
    
    console.log('Proceeding to player selection...');
    await page.getByText('Continue to Player Selection').click();
    
    console.log('In Player Selection...');
    await expect(page.getByText('Player Selection')).toBeVisible();
    
    // Select a player if needed
    // We try to click the first available player card just in case no one is selected
    // We look for text "HCP" which appears on player cards
    const playerCard = page.locator('text=HCP').first();
    if (await playerCard.isVisible()) {
        await playerCard.click();
    }
    
    console.log('Starting round...');
    await page.getByText('Start Round').click();
    
    // 10. In Round (Hole 1)
    console.log('Verifying round started...');
    await expect(page.getByText('Hole 1')).toBeVisible({ timeout: 20000 });
  });
});
