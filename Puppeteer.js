const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');

const runForPincodes = async (pinCodes) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0...');

  for (let pincode of pinCodes) {
    try {
      await page.goto('https://www.amazon.in/s?k=neuherbs', { waitUntil: 'domcontentloaded' });

      await page.click('#nav-global-location-popover-link');
      await page.waitForSelector('#GLUXZipUpdateInput');
      await page.evaluate(() => document.querySelector('#GLUXZipUpdateInput').value = '');
      await page.type('#GLUXZipUpdateInput', pincode);
      await page.click('#GLUXZipUpdate');

      const continueButton = await page.$('input[name="glowDoneButton"]');
      if (continueButton) await continueButton.click();

      const html = await page.content();
      fs.writeFileSync(`amazon_${pincode}.html`, html, 'utf-8');

      console.log(`✅ Done for ${pincode}`);
    } catch (err) {
      console.error(`❌ Error for ${pincode}:`, err.message);
    }
  }

  await browser.close();
};

// Accept JSON input from command line or n8n webhook
const input = process.argv[2];
if (input) {
  const pinCodes = JSON.parse(input);
  runForPincodes(pinCodes);
}
