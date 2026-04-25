import { test, expect } from '@playwright/test';

/**
 * Playwright Test Suite for Facility Booking User Journeys
 * 
 * Target Component: BookingManagement.jsx (Facility Operations)
 * Feature: Logistics and Facility Reservations
 */

test.describe('Facility Booking User Journeys', () => {
    
    // Base URL should be configured in playwright.config.js, or used directly
    const BASE_URL = 'http://localhost:5173';

    test.beforeEach(async ({ page }) => {
        // 1. Navigate to login page
        await page.goto(`${BASE_URL}/login`);

        // 2. Perform login (Assuming standard credentials for testing)
        // Adjust selectors according to your Login page implementation
        await page.fill('input[type="email"]', 'testuser@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for navigation/dashboard load
        await expect(page).not.toHaveURL(/login/);
    });

    test('should allow user to view available facilities and make a booking', async ({ page }) => {
        // 1. Navigate to Booking Management (Facility Operations)
        // Replace with the actual path in your application (e.g., /bookings or /reports)
        await page.goto(`${BASE_URL}/reports`);

        // 2. Verify "Available Facilities" section is visible
        await expect(page.locator('text=Available Facilities')).toBeVisible();

        // 3. Select a facility and click "Book Facility"
        // We look for a facility card and click its book button
        const facilityCard = page.locator('.bg-slate-800\\/50').first(); 
        await expect(facilityCard).toBeVisible();
        
        const facilityName = await facilityCard.locator('h4').textContent();
        console.log(`Testing booking for facility: ${facilityName}`);

        await facilityCard.getByRole('button', { name: /Book/i }).click();

        // 4. Fill the Booking Form Modal
        await expect(page.locator('text=Book a Facility')).toBeVisible();

        // Select facility in dropdown if not auto-selected
        await page.selectOption('select', { label: new RegExp(facilityName, 'i') });

        // Set Date (Tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        await page.fill('input[type="date"]', dateString);

        // Set Start and End Time
        await page.fill('input[name="startTime"]', '10:00'); // Note: adjust selector if name attribute differs
        await page.fill('input[name="endTime"]', '12:00');

        // Set Attendees
        await page.fill('input[type="number"]', '5');

        // Set Purpose
        await page.fill('textarea', 'Research Collaboration and Project Meeting');

        // 5. Submit the request
        await page.click('button:has-text("Submit Request")');

        // 6. Verify Success (Modal closes and booking appears in history)
        await expect(page.locator('text=Book a Facility')).not.toBeVisible();
        
        // Check if the new booking appears in "My Booking History"
        const historySection = page.locator('text=My Booking History');
        await expect(historySection).toBeVisible();
        await expect(page.locator(`text=${facilityName}`)).toBeVisible();
        await expect(page.locator('text=PENDING')).toBeVisible();
    });

    test('should allow user to cancel an existing pending booking', async ({ page }) => {
        await page.goto(`${BASE_URL}/reports`);

        // 1. Locate a pending booking in the history
        const pendingBooking = page.locator('div:has(span:text("PENDING"))').first();
        await expect(pendingBooking).toBeVisible();

        // 2. Click Cancel button
        // Note: BookingManagement uses window.confirm, so we must handle it
        page.once('dialog', dialog => dialog.accept());
        await pendingBooking.getByRole('button', { name: /Cancel/i }).click();

        // 3. Verify status changes or item is removed/updated
        // Depending on implementation, it might show "CANCELLED"
        await expect(page.locator('text=CANCELLED')).toBeVisible();
    });

    test('should allow user to download the booking history report', async ({ page }) => {
        await page.goto(`${BASE_URL}/reports`);

        // 1. Ensure there are bookings to download
        await expect(page.locator('text=My Booking History')).toBeVisible();

        // 2. Click "Download Report" and verify download
        const downloadPromise = page.waitForEvent('download');
        await page.click('button:has-text("Download Report")');
        const download = await downloadPromise;

        // 3. Verify file name
        expect(download.suggestedFilename()).toBe('My_Booking_History.pdf');
    });

    test('should show QR pass for approved bookings', async ({ page }) => {
        await page.goto(`${BASE_URL}/reports`);

        // 1. Locate an approved booking
        const approvedBooking = page.locator('div:has(span:text("APPROVED"))').first();
        
        // If an approved booking exists, check QR functionality
        if (await approvedBooking.isVisible()) {
            await approvedBooking.getByRole('button', { name: /QR Pass/i }).click();
            
            // 2. Verify QR Modal appears
            await expect(page.locator('text=Access Protocol')).toBeVisible();
            await expect(page.locator('svg')).toBeVisible(); // The QR code SVG
            
            // 3. Close Modal
            await page.click('button:has(svg.lucide-x)'); 
            await expect(page.locator('text=Access Protocol')).not.toBeVisible();
        } else {
            console.log('No approved bookings found to test QR Pass.');
        }
    });

});
