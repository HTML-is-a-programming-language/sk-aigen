import { chromium } from 'playwright';
import { existsSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Screenshot the PUBLIC, deployed project websites — never locally invented mockups.
// Captured PNGs are versioned so the portfolio also works without JavaScript/network access.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const directory = resolve(root, 'site/assets/project-previews');
const projects = [
    { file: 'instructor.png', url: 'https://ai-instructor-agent.vercel.app/' },
    { file: 'support.png', url: 'https://careflow-ai-support.vercel.app/' },
    { file: 'survey.png', url: 'https://ai-survey-insight-agen-html-is-a-programming-languages-projects.vercel.app/' },
    { file: 'beauty.png', url: 'https://beautyranks.com/' }
];

mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ headless: true });
let failed = false;

try {
    for (const project of projects) {
        const output = resolve(directory, project.file);
        if (process.env.REFRESH_PROJECT_PREVIEWS !== '1' &&
            existsSync(output) && statSync(output).size > 12_000) {
            console.log('Using existing production screenshot: ' + project.file);
            continue;
        }

        let captured = false;
        for (let attempt = 1; attempt <= 3 && !captured; attempt++) {
            const page = await browser.newPage({
                viewport: { width: 1280, height: 900 },
                deviceScaleFactor: 1,
                colorScheme: 'light',
                reducedMotion: 'reduce'
            });
            try {
                const response = await page.goto(project.url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 50_000
                });
                if (!response || !response.ok()) {
                    throw new Error('HTTP ' + (response?.status() ?? 'no response'));
                }
                await page.waitForLoadState('networkidle', { timeout: 12_000 }).catch(() => {});
                await page.evaluate(() => document.fonts.ready);
                await page.waitForTimeout(1_400);
                const title = await page.title();
                const excerpt = await page.locator('body').innerText({ timeout: 8_000 });
                const errorText = (title + ' ' + excerpt.slice(0, 400)).toLowerCase();
                if (
                    excerpt.trim().length < 60 ||
                    /vercel authentication|deployment protection|authentication required|404: not_found|application error|internal server error|access denied|this deployment is protected/.test(errorText)
                ) {
                    throw new Error('Site returned a protected/error/empty screen: ' + title);
                }
                await page.screenshot({
                    path: output,
                    type: 'png',
                    animations: 'disabled',
                    fullPage: false
                });
                if (statSync(output).size <= 12_000) {
                    throw new Error('Screenshot suspiciously small');
                }
                console.log('Captured: ' + project.url + ' → ' + project.file);
                captured = true;
            } catch (error) {
                console.warn('Attempt ' + attempt + ' failed for ' + project.url + ': ' + error.message);
                if (attempt < 3) await new Promise((done) => setTimeout(done, 1_500));
            } finally {
                await page.close();
            }
        }
        if (!captured) {
            failed = true;
            console.error('Could not capture an authentic screenshot of ' + project.url);
        }
    }
} finally {
    await browser.close();
}

if (failed) {
    throw new Error('Some real website previews could not be captured; refusing to publish misleading mockups.');
}
