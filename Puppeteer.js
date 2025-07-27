const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
puppeteer.use(StealthPlugin());

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// List of pin codes to loop through
const pinCodes = ['400001', '835222','201301', '560001','600001'];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
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

  for (let i = 0; i < pinCodes.length; i++) {
    const pincode = pinCodes[i];

    try {
      console.log(`🌐 Navigating to Amazon for pincode ${pincode}...`);
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
      await page.evaluate(() => document.querySelector('#GLUXZipUpdateInput').value = '');
      await page.type('#GLUXZipUpdateInput', pincode, { delay: 100 });
      await sleep(1000);

      console.log("✅ Clicking apply...");
      await page.click('#GLUXZipUpdate');
      await sleep(5000);

      const continueButton = await page.$('span.a-button-inner > input[name="glowDoneButton"]');
      if (continueButton) {
        await continueButton.click();
        await sleep(5000);
      }

      console.log(`📸 Taking screenshot for ${pincode}...`);
      await page.screenshot({ path: `screenshot_${pincode}.png`, fullPage: true });

      console.log(`💾 Saving HTML for ${pincode}...`);
      const html = await page.content();
      fs.writeFileSync(`amazon_${pincode}.html`, html, 'utf-8');

      console.log(`✅ Done for ${pincode} ✅`);
      await sleep(4000);

    } catch (error) {
      console.warn(`⚠️ Error for pincode ${pincode}:`, error.message);
      await page.screenshot({ path: `error_${pincode}.png`, fullPage: true });
    }
  }

  await browser.close();
})();
