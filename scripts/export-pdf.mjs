import { chromium } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
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
const fontPath = resolve(repoRoot, 'site/assets/fonts/PretendardVariable.woff2');
if (!existsSync(fontPath)) {
    throw new Error('Pretendard font missing. Run node scripts/install-font.mjs before exporting PDF.');
}
const fontBuffer = readFileSync(fontPath);
if (fontBuffer.subarray(0, 4).toString('ascii') !== 'wOF2') {
    throw new Error('Invalid self-hosted Pretendard WOFF2 data.');
}
const fontDataUrl = 'data:font/woff2;base64,' + fontBuffer.toString('base64');
const css = readFileSync(cssPath, 'utf8').replace(
    'url("./fonts/PretendardVariable.woff2")',
    'url("' + fontDataUrl + '")'
);
const editorial = readFileSync(editorialPath, 'utf8');
const chapters = readFileSync(chaptersPath, 'utf8');
let markup = html
    .replace('<link rel="stylesheet" href="./assets/styles.css">', '<style>' + css + '</style>')
    .replace('<link rel="stylesheet" href="./assets/editorial.css">', '<style>' + editorial + '</style>')
    .replace(
        '<div id="portfolio-chapters" aria-label="프로젝트 및 포트폴리오 본문"></div>',
        '<div id="portfolio-chapters" aria-label="프로젝트 및 포트폴리오 본문">' + chapters + '</div>'
    );

// Inline checked-in production screenshots for Playwright setContent(), whose
// blank-document origin cannot resolve relative screenshot paths during PDF export.
for (const filename of ['instructor.png', 'support.png', 'survey.png', 'beauty.png']) {
    const file = resolve(repoRoot, 'site/assets/project-previews', filename);
    if (!existsSync(file)) {
        throw new Error('Project screenshot is missing: ' + filename + '. Run pnpm capture:previews first.');
    }
    const dataUrl = 'data:image/png;base64,' + readFileSync(file).toString('base64');
    markup = markup.replaceAll('src="./assets/project-previews/' + filename + '"', 'src="' + dataUrl + '"');
}


mkdirSync(dirname(target), { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1080 }, deviceScaleFactor: 1 });
    await page.setContent(markup, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const fontCheck = await page.evaluate(() => {
        const faces = [...document.fonts].filter(
            (font) => font.family.replaceAll('"', '') === 'Pretendard Variable'
        );
        return {
            loaded: faces.some((font) => font.status === 'loaded'),
            families: getComputedStyle(document.querySelector('.page h1')).fontFamily
        };
    });
    if (!fontCheck.loaded || !fontCheck.families.includes('Pretendard Variable')) {
        throw new Error('Pretendard not loaded in PDF renderer: ' + JSON.stringify(fontCheck));
    }
    console.log('PDF typeface: Pretendard Variable (verified loaded)');

    // Audit text after font load rather than truncating it with CSS line clamping.
    // Each visible sentence/card description should occupy at most two lines.
    const lineAudit = await page.evaluate(() => {
        const selector = '.page h1, .editorial-page h2, .editorial-page h3, .editorial-page p, .editorial-page .side-intro, .editorial-page .right-caption, .editorial-page .experience-bottom strong, .editorial-page .fit-skill-card > strong, .editorial-page .fit-contact-links strong';
        const nodes = [...document.querySelectorAll(selector)];
        return nodes.flatMap((el) => {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            const tops = [];
            let node;
            while ((node = walker.nextNode())) {
                if (!node.textContent.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                for (const rect of range.getClientRects()) {
                    if (rect.width > 0.5 && rect.height > 0.5) tops.push(rect.top);
                }
            }
            tops.sort((a, b) => a - b);
            const grouped = [];
            for (const top of tops) {
                if (!grouped.length || top - grouped[grouped.length - 1] > 7) grouped.push(top);
            }
            const lines = grouped.length;
            const horizontalOverflow = el.scrollWidth > el.clientWidth + 6;
            if (lines <= 2 && !horizontalOverflow) return [];
            return [{
                page: Number(el.closest('.page-wrap')?.querySelector('.doc-foot span:last-child')?.textContent?.match(/\d+/)?.[0] || 1),
                type: el.tagName.toLowerCase(),
                className: el.className || '',
                lines,
                horizontalOverflow,
                text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 125)
            }];
        });
    });
    console.log('TEXT_LINE_AUDIT:', JSON.stringify(lineAudit));

    if (lineAudit.length && process.env.STRICT_PORTFOLIO_LAYOUT === '1') {
        throw new Error('Portfolio contains text exceeding two lines or its allotted width');
    }
    // Review natural two-line wraps so editorial break points can be explicit.
    const naturalTwoLineWraps = await page.evaluate(() =>
        [...document.querySelectorAll('.editorial-page p, .editorial-page h2, .editorial-page h3, .editorial-page .side-intro, .editorial-page .right-caption')]
            .filter((el) => !el.querySelector('br') && (!el.querySelector('strong') || getComputedStyle(el.querySelector('strong')).display !== 'block'))
            .flatMap((el) => {
                const range = document.createRange();
                range.selectNodeContents(el);
                const positions = [...range.getClientRects()]
                    .filter((r) => r.width > 0.5 && r.height > 0.5)
                    .map((r) => r.top)
                    .sort((a, b) => a - b);
                const rows = [];
                for (const top of positions) {
                    if (!rows.length || top - rows[rows.length - 1] > 7) rows.push(top);
                }
                if (rows.length !== 2) return [];
                const text = el.textContent.trim().replace(/\s+/g, ' ');
                return [{page: el.closest('.page-wrap')?.querySelector('.doc-foot span:last-child')?.textContent?.trim(), className: el.className, tag: el.tagName, text: text.slice(0, 135)}];
            })
    );
    console.log('NATURAL_TWO_LINE_WRAPS:', JSON.stringify(naturalTwoLineWraps));


    const pageCount = await page.locator('article.page').count();
    if (pageCount !== 13) {
        throw new Error('Expected 13 A4 pages but rendered ' + pageCount);
    }

    const overflow = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.editorial-page')).flatMap((article, index) => {
            const elements = [article.querySelector('.doc-content'), ...article.querySelectorAll('.panel, .project-index-card, .link-item, .experience-card, .fit-skill-card, .fit-project, .fit-contact')]
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
    for (const index of [2, 5, 7, 9, 11, 12, 13]) {
        const file = resolve(repoRoot, 'exports/page-' + String(index).padStart(2, '0') + '.png');
        await page.locator('.page').nth(index - 1).screenshot({ path: file, animations: 'disabled' });
    }
    console.log('Pages: ' + pageCount);
    console.log('PDF: ' + target);
    console.log('Preview: ' + preview);
} finally {
    await browser.close();
}
