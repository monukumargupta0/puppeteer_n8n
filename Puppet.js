const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true if you want no GUI
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  try {
    console.log("🌐 Navigating to Amazon...");
    await page.goto('https://www.amazon.in/s?k=neuherbs', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    console.log("📍 Clicking location icon...");
    await page.waitForSelector('#nav-global-location-popover-link', { timeout: 15000 });
    await page.click('#nav-global-location-popover-link');
    await sleep(5000);

    console.log("⌛ Waiting for pincode input...");
    await page.waitForSelector('#GLUXZipUpdateInput', { timeout: 15000 });
    await page.type('#GLUXZipUpdateInput', '835222', { delay: 100 });
    await sleep(1000);

    console.log("✅ Clicking apply...");
    await page.click('#GLUXZipUpdate');
    await sleep(7000); // wait for location update

    // Optional: click continue if confirmation appears
    const continueButton = await page.$('span.a-button-inner > input[name="glowDoneButton"]');
    if (continueButton) {
      await continueButton.click();
      await sleep(5000);
    }

    console.log("📸 Taking screenshot...");
    await page.screenshot({ path: 'final_with_address.png', fullPage: true });


  } catch (error) {
    console.warn("⚠️ Error in setting location:", error.message);
    await page.screenshot({ path: 'error_page.png', fullPage: true });
  }

  await browser.close();
})();

