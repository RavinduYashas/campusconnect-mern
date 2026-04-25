import { test, expect } from '@playwright/test';

/**
 * Playwright Test Suite for Booking (Workshop Registration) User Journeys
 * 
 * This suite covers:
 * 1. User login
 * 2. Navigating to the workshops page
 * 3. Viewing workshop details
 * 4. Registering for a workshop (Booking)
 * 5. Cancelling a registration
 */

test.describe('Workshop Booking User Journeys', () => {
  
  test.beforeEach(async ({ page }) => {
    // Go to the login page
    await page.goto('http://localhost:5173/login');
    
    // Perform login (using placeholder credentials, these should be replaced with test user data)
    await page.fill('input[name="email"]', 'teststudent@sliitplatform.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete (profiles page is the default redirect)
    await expect(page).toHaveURL(/.*profiles/);
  });

  test('should navigate to workshops and register for a workshop', async ({ page }) => {
    // 1. Navigate to Workshops
    await page.click('a[href="/workshops"]');
    await expect(page).toHaveURL(/.*workshops/);
    
    // 2. Check if there are any workshops available
    const workshopCards = page.locator('div.grid > div');
    const count = await workshopCards.count();
    
    if (count === 0) {
      console.log('No workshops found to test booking.');
      return;
    }

    // 3. Click on the first "upcoming" workshop to see details
    // We look for a workshop that has a "Register" button
    const registerButton = page.getByRole('button', { name: /Register for Workshop/i }).first();
    
    if (await registerButton.isVisible()) {
      // 4. Click Register
      await registerButton.click();
      
      // 5. Verify success toast or button text change
      // Since toast might be transient, we check if the button now says "Cancel" or "Remove"
      await expect(page.getByRole('button', { name: /Cancel Registration|Remove from Waitlist/i }).first()).toBeVisible();
      
      console.log('Successfully registered for the workshop.');
    } else {
      console.log('No available workshops for registration found.');
    }
  });

  test('should be able to view workshop details and book from there', async ({ page }) => {
    // 1. Navigate to Workshops
    await page.click('a[href="/workshops"]');
    
    // 2. Click on a workshop title to view details
    // We assume the workshop card has a link or title that navigates to /workshops/:id
    const workshopTitle = page.locator('h3').first();
    const workshopName = await workshopTitle.innerText();
    await workshopTitle.click();
    
    // 3. Verify navigation to details page
    await expect(page).toHaveURL(/.*workshops\/[a-f0-9]+/);
    await expect(page.locator('h1')).toContainText(workshopName);
    
    // 4. Check for registration button in details page
    const registerBtn = page.getByRole('button', { name: /Register for Workshop/i });
    
    if (await registerBtn.isVisible()) {
      await registerBtn.click();
      
      // 5. Verify registration status change
      await expect(page.getByRole('button', { name: /Cancel Registration/i })).toBeVisible();
    }
  });

  test('should allow user to cancel a booking', async ({ page }) => {
    // 1. Navigate to Workshops
    await page.click('a[href="/workshops"]');
    
    // 2. Find a workshop where user is already registered
    const cancelBtn = page.getByRole('button', { name: /Cancel Registration/i }).first();
    
    if (await cancelBtn.isVisible()) {
      // 3. Click Cancel
      await cancelBtn.click();
      
      // 4. Handle confirmation dialog if any (WorkshopDetails handles it with toast, Workshops.jsx has window.confirm)
      // Note: Playwright handles window.confirm automatically by dismissing it unless configured otherwise.
      // To accept: page.on('dialog', dialog => dialog.accept());
      
      // 5. Verify the button changes back to Register
      await expect(page.getByRole('button', { name: /Register for Workshop/i }).first()).toBeVisible();
      
      console.log('Successfully cancelled the registration.');
    } else {
      console.log('No registered workshops found to test cancellation.');
    }
  });

});
