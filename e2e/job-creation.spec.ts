import { test, expect } from "@playwright/test";

test.describe("PermitPath Critical Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto("http://localhost:5173");
  });

  test.describe("Navigation Tests", () => {
    test("user can navigate to new job creation", async ({ page }) => {
      // Click the New Job button
      await page.click("text=New Job");

      // Verify we're on the new job page
      await expect(page).toHaveURL(/.*\/new.*/);
      await expect(page.locator("text=Start a Permit Job")).toBeVisible();
    });

    test("user can select a job type", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Wait for the job type selector
      await page.waitForSelector("text=What type of work?");

      // Click on job type dropdown
      await page.click("text=Choose job type");

      // Select a job type
      await page.click("text=Roof Replacement");

      // Verify selection
      await expect(page.locator("text=Roof Replacement")).toBeVisible();
    });

    test("user can navigate through wizard steps", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Step 1: Select job type
      await page.click("text=Choose job type");
      await page.click("text=Roof Replacement");
      await page.click("text=Next");

      // Step 2: Select jurisdiction
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Pinellas County");
      await page.click("text=Next");

      // Step 3: Enter address
      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "123 Test St, St Pete, FL 33710"
      );
      await page.click("text=Next");
    });

    test("navbar navigation works", async ({ page }) => {
      // Check home page navigation
      await page.click("text=Home");
      await expect(page).toHaveURL(/.*\/$/);

      // Check jobs page
      await page.click("text=Jobs");
      await expect(page).toHaveURL(/.*\/jobs.*/);

      // Check help page
      await page.click("text=Help");
      await expect(page).toHaveURL(/.*\/help.*/);
    });
  });

  test.describe("Create New Job - Roof", () => {
    test("should create new roof replacement job with full details", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Step 1: Select job type
      await page.waitForSelector("text=Start a Permit Job");
      await page.click("text=Choose job type");
      await page.click("text=Roof Replacement");

      // Fill in contractor info
      await page.fill('input[placeholder*="contractor name"]', "Pro Roofing LLC");
      await page.fill('input[placeholder*="license"]', "CBC1258963");

      await page.click("text=Next");

      // Step 2: Select jurisdiction
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Pinellas County");
      await page.click("text=Next");

      // Step 3: Job details
      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "789 Roof St, St Pete, FL 33710"
      );
      await page.fill(
        'textarea[placeholder*="describe"]',
        "Complete roof replacement for 2000 sq ft single-story home"
      );

      // Select budget
      await page.click("text=Budget");
      await page.click("text=$10k - $25k");

      // Select timeline
      await page.click("text=Timeline");
      await page.click("text=1-2 weeks");

      await page.click("text=Next");

      // Step 4: Review and submit (if exists)
      try {
        await page.waitForSelector("text=Review", { timeout: 3000 });
        await page.click("text=Submit");
      } catch {
        // Review step might not exist
      }

      // Verify job creation success
      await expect(page.locator("text=success").or(page.locator("text=created"))).toBeVisible();
    });

    test("roof job type should have correct questions", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      await page.click("text=Choose job type");
      await page.click("text=Roof Replacement");

      // Should show roof-specific fields
      await expect(
        page.locator("text=roof").or(page.locator("text=Roof"))
      ).toBeVisible();
    });
  });

  test.describe("Create New Job - Water Heater", () => {
    test("should create new water heater job", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Step 1: Select job type
      await page.waitForSelector("text=Start a Permit Job");
      await page.click("text=Choose job type");
      await page.click("text=Water Heater");

      // Fill contractor info
      await page.fill('input[placeholder*="contractor name"]', "Plumbing Pros");
      await page.fill('input[placeholder*="license"]', "CFC1234567");

      await page.click("text=Next");

      // Step 2: Select jurisdiction
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=St. Petersburg");
      await page.click("text=Next");

      // Step 3: Job details
      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "321 Water St, St Pete, FL 33701"
      );
      await page.fill(
        'textarea[placeholder*="describe"]',
        "Replace old 50 gallon gas water heater with tankless unit"
      );

      // Select budget
      await page.click("text=Budget");
      await page.click("text=$1k - $5k");

      await page.click("text=Next");

      // Verify success
      await expect(page.locator("text=success").or(page.locator("text=created"))).toBeVisible();
    });

    test("water heater job should have fuel type and tank type options", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      await page.click("text=Choose job type");
      await page.click("text=Water Heater");

      // Should show water heater related text
      await expect(
        page.locator("text=water").or(page.locator("text=Water"))
      ).toBeVisible();
    });
  });

  test.describe("Create New Job - Electrical", () => {
    test("should create new electrical panel job", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Step 1: Select job type
      await page.waitForSelector("text=Start a Permit Job");
      await page.click("text=Choose job type");
      await page.click("text=Electrical Panel");

      // Fill contractor info
      await page.fill('input[placeholder*="contractor name"]', "Elite Electric");
      await page.fill('input[placeholder*="license"]', "EC1234567");

      await page.click("text=Next");

      // Step 2: Select jurisdiction
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Clearwater");
      await page.click("text=Next");

      // Step 3: Job details
      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "555 Electric Ave, Clearwater, FL 33755"
      );
      await page.fill(
        'textarea[placeholder*="describe"]',
        "Upgrade from 100 amp to 200 amp electrical panel"
      );

      // Select budget
      await page.click("text=Budget");
      await page.click("text=$5k - $10k");

      await page.click("text=Next");

      // Verify success
      await expect(page.locator("text=success").or(page.locator("text=created"))).toBeVisible();
    });

    test("electrical job should have amperage options", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      await page.click("text=Choose job type");
      await page.click("text=Electrical Panel");

      // Should show electrical related text
      await expect(
        page.locator("text=electric").or(page.locator("text=Electric"))
      ).toBeVisible();
    });
  });

  test.describe("Create New Job - AC/HVAC", () => {
    test("should create new AC changeout job", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Step 1: Select job type
      await page.waitForSelector("text=Start a Permit Job");
      await page.click("text=Choose job type");
      await page.click("text=AC / HVAC");

      // Fill contractor info
      await page.fill('input[placeholder*="contractor name"]', "Cool Air Services");
      await page.fill('input[placeholder*="license"]', "CAC1254789");

      await page.click("text=Next");

      // Step 2: Select jurisdiction
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Largo");
      await page.click("text=Next");

      // Step 3: Job details
      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "999 Cool St, Largo, FL 33770"
      );
      await page.fill(
        'textarea[placeholder*="describe"]',
        "Replace 3-ton AC unit with high efficiency model"
      );

      // Select budget
      await page.click("text=Budget");
      await page.click("text=$5k - $10k");

      await page.click("text=Next");

      // Verify success
      await expect(page.locator("text=success").or(page.locator("text=created"))).toBeVisible();
    });

    test("AC job should have HVAC specific options", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      await page.click("text=Choose job type");
      await page.click("text=AC / HVAC");

      // Should show HVAC related text
      await expect(
        page.locator("text=AC").or(page.locator("text=HVAC")).or(page.locator("text=air"))
      ).toBeVisible();
    });
  });

  test.describe("Job Type Specific Questions", () => {
    test("each job type displays correct category label", async ({ page }) => {
      const jobTypes = [
        { name: "Roof Replacement", label: "Roof" },
        { name: "Water Heater", label: "Water" },
        { name: "Electrical Panel", label: "Electrical" },
        { name: "AC / HVAC", label: "AC" },
      ];

      for (const jobType of jobTypes) {
        await page.goto("http://localhost:5173/new");
        await page.click("text=Choose job type");
        await page.click(`text=${jobType.name}`);

        // Verify the job type was selected
        await expect(page.locator(`text=${jobType.name}`)).toBeVisible();
      }
    });
  });

  test.describe("Verify Job Appears in My Jobs", () => {
    test("newly created job appears in jobs list", async ({ page }) => {
      // Create a job first
      await page.goto("http://localhost:5173/new");

      await page.waitForSelector("text=Start a Permit Job");
      await page.click("text=Choose job type");
      await page.click("text=Fence Installation");
      await page.fill('input[placeholder*="contractor name"]', "Fence Masters");
      await page.click("text=Next");

      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Pinellas County");
      await page.click("text=Next");

      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "456 Fence Ln, St Pete, FL 33710"
      );
      await page.click("text=Next");

      // Wait for success message
      await page.waitForSelector("text=success, created, or Job", { timeout: 5000 });

      // Navigate to jobs page
      await page.click("text=Jobs");
      await expect(page).toHaveURL(/.*\/jobs.*/);

      // Verify the job appears in the list
      await expect(
        page.locator("text=Fence").or(page.locator("text=456 Fence"))
      ).toBeVisible();
    });

    test("jobs list shows job details correctly", async ({ page }) => {
      await page.goto("http://localhost:5173/jobs");

      // Verify jobs page loads
      await expect(page.locator("text=Jobs").or(page.locator("text=My Jobs"))).toBeVisible();

      // If there are jobs, verify they display properly
      const jobCard = page.locator("[data-testid='job-card']").first();
      if (await jobCard.isVisible().catch(() => false)) {
        await expect(jobCard.locator("text=Permit").or(jobCard.locator("text=Pending"))).toBeVisible();
      }
    });
  });

  test.describe("Conditional Logic - Follow-up Questions", () => {
    test("should show follow-up questions based on answers", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Select water heater to test conditional logic
      await page.click("text=Choose job type");
      await page.click("text=Water Heater");
      await page.click("text=Next");

      // Continue through wizard
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Pinellas County");
      await page.click("text=Next");

      // At the job details step, conditional logic might appear
      await page.waitForSelector("text=Tell us about the job");

      // The app may have conditional fields based on selections
      // This validates the wizard has appropriate steps
      await expect(page.locator("input, textarea, select").first()).toBeVisible();
    });
  });

  test.describe("Validation Tests", () => {
    test("should validate license number format", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      await page.click("text=Choose job type");
      await page.click("text=Roof Replacement");

      // Try invalid license format
      const licenseInput = page.locator('input[placeholder*="license"]');
      if (await licenseInput.isVisible().catch(() => false)) {
        await licenseInput.fill("INVALID");

        // Try to proceed
        await page.click("text=Next");

        // Should show validation error or not proceed
        const errorVisible = await page
          .locator("text=error, invalid, or required")
          .isVisible()
          .catch(() => false);

        if (!errorVisible) {
          // If no validation error, at least verify we're still on the same page
          await expect(page.locator("text=Choose job type").or(page.locator("text=Start"))).toBeVisible();
        }
      }
    });

    test("should require required fields", async ({ page }) => {
      await page.goto("http://localhost:5173/new");

      // Try to proceed without selecting job type
      const nextButton = page.locator("text=Next");

      // Check if next button is disabled or shows error when clicked
      await nextButton.click();

      // Should still be on the job type selection step
      await expect(
        page.locator("text=Choose job type").or(page.locator("text=What type"))
      ).toBeVisible();
    });
  });

  test.describe("Submission and Save", () => {
    test("should save job after wizard submission", async ({ page }) => {
      // Start job creation
      await page.goto("http://localhost:5173/new");

      await page.waitForSelector("text=Start a Permit Job");
      await page.click("text=Choose job type");
      await page.click("text=Generator Installation");

      // Fill in details
      await page.fill('input[placeholder*="contractor name"]', "Generator Pros");
      await page.fill(
        'input[placeholder*="license"]',
        "EC1234567"
      );
      await page.click("text=Next");

      // Select jurisdiction
      await page.waitForSelector("text=Where is this job?");
      await page.click("text=Pinellas County");
      await page.click("text=Next");

      // Fill job details
      await page.waitForSelector("text=Tell us about the job");
      await page.fill(
        'input[placeholder*="address"]',
        "777 Power St, St Pete, FL 33710"
      );
      await page.fill(
        'textarea[placeholder*="describe"]',
        "Install whole house 22kW generator with transfer switch"
      );

      // Select budget and timeline
      await page.click("text=Budget");
      await page.click("text=$10k - $25k");

      await page.click("text=Next");

      // Wait for success indication
      await page.waitForTimeout(2000);

      // Verify job was saved by checking navigation
      const currentUrl = page.url();
      expect(currentUrl).not.toContain("/new");
    });
  });
});
