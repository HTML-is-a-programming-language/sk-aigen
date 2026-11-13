import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(repoRoot, 'site/index.html');
const cssPath = resolve(repoRoot, 'site/assets/styles.css');
const target = resolve(repoRoot, 'exports/sk-aigen-portfolio.pdf');
const preview = resolve(repoRoot, 'exports/cover-preview.png');

const html = readFileSync(htmlPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const markup = html.replace(
    '<link rel="stylesheet" href="./assets/styles.css">',
    '<style>' + css + '</style>'
);
mkdirSync(dirname(target), { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
    await page.setContent(markup, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
        path: target,
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });
    await page.locator('.page').first().screenshot({ path: preview, animations: 'disabled' });
    console.log('PDF: ' + target);
    console.log('Preview: ' + preview);
} finally {
    await browser.close();
}
