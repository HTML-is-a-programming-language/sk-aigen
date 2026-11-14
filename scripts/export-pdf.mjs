import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const htmlPath = resolve(repoRoot, 'site/index.html');
const cssPath = resolve(repoRoot, 'site/assets/styles.css');
const editorialPath = resolve(repoRoot, 'site/assets/editorial.css');
const chaptersPath = resolve(repoRoot, 'site/chapters.html');
const target = resolve(repoRoot, 'exports/sk-aigen-portfolio.pdf');
const preview = resolve(repoRoot, 'exports/cover-preview.png');

const html = readFileSync(htmlPath, 'utf8');
const css = readFileSync(cssPath, 'utf8');
const editorial = readFileSync(editorialPath, 'utf8');
const chapters = readFileSync(chaptersPath, 'utf8');
const markup = html
    .replace('<link rel="stylesheet" href="./assets/styles.css">', '<style>' + css + '</style>')
    .replace('<link rel="stylesheet" href="./assets/editorial.css">', '<style>' + editorial + '</style>')
    .replace(
        '<div id="portfolio-chapters" aria-label="프로젝트 및 포트폴리오 본문"></div>',
        '<div id="portfolio-chapters" aria-label="프로젝트 및 포트폴리오 본문">' + chapters + '</div>'
    );

mkdirSync(dirname(target), { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
    await page.setContent(markup, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const pageCount = await page.locator('article.page').count();
    if (pageCount !== 14) {
        throw new Error('Expected 14 A4 pages but rendered ' + pageCount);
    }

    const overflow = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.editorial-page')).flatMap((article, index) => {
            const elements = [article.querySelector('.doc-content'), ...article.querySelectorAll('.panel, .project-index-card, .link-item')]
                .filter(Boolean);
            return elements
                .filter((node) => node.scrollHeight > node.clientHeight + 7)
                .map((node) => ({
                    page: index + 2,
                    element: String(node.className),
                    scrollHeight: node.scrollHeight,
                    clientHeight: node.clientHeight
                }));
        })
    );
    if (overflow.length) {
        console.warn('Content overflow candidates: ' + JSON.stringify(overflow, null, 2));
        if (process.env.STRICT_PORTFOLIO_LAYOUT === '1') {
            throw new Error('Portfolio content overflow detected');
        }
    }
    await page.pdf({
        path: target,
        format: 'A4',
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' }
    });
    await page.locator('.page').first().screenshot({ path: preview, animations: 'disabled' });
    for (const index of [2, 5, 7, 9, 11, 14]) {
        const file = resolve(repoRoot, 'exports/page-' + String(index).padStart(2, '0') + '.png');
        await page.locator('.page').nth(index - 1).screenshot({ path: file, animations: 'disabled' });
    }
    console.log('Pages: ' + pageCount);
    console.log('PDF: ' + target);
    console.log('Preview: ' + preview);
} finally {
    await browser.close();
}
