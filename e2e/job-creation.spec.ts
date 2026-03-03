import { test, expect } from '@playwright/test';

test.describe('PermitPath Critical Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:5173');
  });

  test('user can navigate to new job creation', async ({ page }) => {
    // Click the New Job button
    await page.click('text=New Job');
    
    // Verify we're on the new job page
    await expect(page).toHaveURL(/.*\/new.*/);
    await expect(page.locator('text=Start a Permit Job')).toBeVisible();
  });

  test('user can select a job type', async ({ page }) => {
    await page.goto('http://localhost:5173/new');
    
    // Wait for the job type selector
    await page.waitForSelector('text=What type of work?');
    
    // Click on job type dropdown
    await page.click('text=Choose job type');
    
    // Select a job type
    await page.click('text=Roof Replacement');
    
    // Verify selection
    await expect(page.locator('text=Roof Replacement')).toBeVisible();
  });

  test('user can navigate through wizard steps', async ({ page }) => {
    await page.goto('http://localhost:5173/new');
    
    // Step 1: Select job type
    await page.click('text=Choose job type');
    await page.click('text=Roof Replacement');
    await page.click('text=Next');
    
    // Step 2: Select jurisdiction
    await page.waitForSelector('text=Where is this job?');
    await page.click('text=Pinellas County');
    await page.click('text=Next');
    
    // Step 3: Enter address
    await page.waitForSelector('text=Tell us about the job');
    await page.fill('input[placeholder*="address"]', '123 Test St, St Pete, FL 33710');
    await page.click('text=Next');
  });

  test('navbar navigation works', async ({ page }) => {
    // Check home page navigation
    await page.click('text=Home');
    await expect(page).toHaveURL(/.*\/$/);
    
    // Check jobs page
    await page.click('text=Jobs');
    await expect(page).toHaveURL(/.*\/jobs.*/);
    
    // Check help page
    await page.click('text=Help');
    await expect(page).toHaveURL(/.*\/help.*/);
  });
});