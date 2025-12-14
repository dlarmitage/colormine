import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_IMAGE = '/Users/darmitage/GitHub/color-wheel/public/new icon.png';
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateIcons() {
    try {
        console.log('Reading source image...');
        const image = await Jimp.read(SOURCE_IMAGE);

        // List of icons to generate
        const icons = [
            { name: 'icon-512.png', size: 512 },
            { name: 'icon-192.png', size: 192 },
            { name: 'icon-maskable.png', size: 512 }, // Using regular for maskable for now
            { name: 'apple-touch-icon.png', size: 180 },
            { name: 'favicon.ico', size: 32 } // Browser usually accepts PNG in ICO wrapper or just usage
        ];

        for (const icon of icons) {
            console.log(`Generating ${icon.name}...`);
            const resized = image.clone().resize({ w: icon.size, h: icon.size });

            const outputPath = path.join(PUBLIC_DIR, icon.name);
            // Force PNG format for all, even if named .ico (modern browsers support this)
            // Jimp v1+ syntax might differ slightly, but typically we pass mime or just path.
            // The error 'Unsupported MIME type: null' suggests it couldn't map .ico to a writer.

            if (icon.name.endsWith('.ico')) {
                // Write as PNG buffer then save to file
                const buffer = await resized.getBuffer("image/png");
                fs.writeFileSync(outputPath, buffer);
            } else {
                await resized.write(outputPath);
            }
        }

        console.log('All icons generated successfully!');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
