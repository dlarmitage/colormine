import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630 });

    // Navigate to the app (assuming it's running on localhost:5174 as per previous step)
    // We'll wait for the network to be idle to ensure fonts and styles are loaded.
    try {
        await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });

        // Initial wait for animations
        await new Promise(r => setTimeout(r, 2000));

        const outputPath = join(__dirname, '../public/og-image.png');
        await page.screenshot({ path: outputPath });
        console.log(`Screenshot saved to ${outputPath}`);
    } catch (e) {
        console.error('Error taking screenshot:', e);
    } finally {
        await browser.close();
        process.exit(0);
    }
})();
