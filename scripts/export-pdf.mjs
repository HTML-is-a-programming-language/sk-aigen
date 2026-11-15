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
    const pageCount = await page.locator('article.page').count();
    if (pageCount !== 13) {
        throw new Error('Expected 13 A4 pages but rendered ' + pageCount);
    }
    // Keep page 4's problem, implementation and product principle to two lines.
    const pageFourCopyLines = await page.evaluate(() =>
        [...document.querySelectorAll('#page-04 .case-copy > p, #page-04 .case-copy .accent-box p')]
            .map((element) => {
                const style = getComputedStyle(element);
                const lineHeight = parseFloat(style.lineHeight);
                const actualHeight = element.getBoundingClientRect().height;
                return {
                    lines: Math.round(actualHeight / lineHeight),
                    overflows: element.scrollWidth > element.clientWidth + 2,
                    text: element.textContent.trim().slice(0, 75)
                };
            })
    );
    console.log('Page 04 copy line counts:', JSON.stringify(pageFourCopyLines));
    if (pageFourCopyLines.length !== 3 || pageFourCopyLines.some((item) => item.lines > 2 || item.overflows)) {
        throw new Error('Page 04 case-copy paragraphs must each fit within two lines');
    }

    // Verify the three sample evidence rows remain readable as exactly two lines.
    const sampleEvidenceLines = await page.evaluate(() =>
        [...document.querySelectorAll('#page-05 .sample-row-list .case-row p')]
            .map((element) => {
                const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
                return {
                    lines: Math.round(element.getBoundingClientRect().height / lineHeight),
                    overflows: element.scrollWidth > element.clientWidth + 2,
                    text: element.textContent.trim().slice(0, 75)
                };
            })
    );
    console.log('Page 05 sample row line counts:', JSON.stringify(sampleEvidenceLines));
    if (sampleEvidenceLines.length !== 3 || sampleEvidenceLines.some((item) => item.lines !== 2 || item.overflows)) {
        throw new Error('Page 05 sample evidence descriptions must each fit exactly two lines');
    }

    const retrospectiveLeadLayout = await page.evaluate(() => {
        const element = document.querySelector('#page-05 .retrospective-lead');
        const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
        return {
            lines: Math.round(element.getBoundingClientRect().height / lineHeight),
            overflows: element.scrollWidth > element.clientWidth + 2
        };
    });
    console.log('Page 05 retrospective lead:', JSON.stringify(retrospectiveLeadLayout));
    if (retrospectiveLeadLayout.lines !== 2 || retrospectiveLeadLayout.overflows) {
        throw new Error('Page 05 retrospective lead must render in exactly two lines');
    }

    const requestedCopyLayout = await page.evaluate(() => {
        const selectors = [
            '#page-06 .case-copy > .lead-copy', '#page-06 .accent-box p',
            '#page-07 .careflow-row-list .case-row p',
            '#page-07 .careflow-retrospective-lead',
            '#page-07 .careflow-retrospective-item p',
            '#page-08 .case-copy .body-sm', '#page-08 .accent-box p',
            '#page-09 .white-panel .body-sm',
            '#page-10 .case-copy .body-sm', '#page-10 .accent-box p',
            '#page-11 .beauty-incident-list .incident p',
            '#page-11 .beauty-before-after p:last-child',
            '#page-11 .beauty-watchdog',
            '#page-12 .experience-steps p', '#page-12 .experience-insight',
            '#page-12 .experience-sub'
        ];
        return selectors.flatMap((selector) =>
            [...document.querySelectorAll(selector)].map((element) => {
                const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                const positions = [];
                let node;
                while ((node = walker.nextNode())) {
                    if (!node.textContent.trim()) continue;
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    for (const rect of range.getClientRects()) {
                        if (rect.width > 0.5 && rect.height > 0.5) positions.push(rect.top);
                    }
                }
                positions.sort((a, b) => a - b);
                const rowTops = [];
                for (const top of positions) {
                    if (!rowTops.some((existing) => Math.abs(existing - top) < 7)) rowTops.push(top);
                }
                return {
                    page: element.closest('.page-wrap')?.id || element.closest('.page-wrap')?.querySelector('article')?.getAttribute('aria-label'),
                    selector,
                    lines: rowTops.length,
                    overflows: element.scrollWidth > element.clientWidth + 2,
                    text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 110)
                };
            })
        );
    });
    console.log('REQUESTED_COPY_LINE_AUDIT:', JSON.stringify(requestedCopyLayout));
    const invalidCopy = requestedCopyLayout.filter((item) =>
        item.lines > 2 || item.lines === 0 || item.overflows ||
        (item.selector === '#page-11 .beauty-before-after p:last-child' && item.lines !== 1)
    );
    if (invalidCopy.length) {
        throw new Error('Requested copy line limits failed: ' + JSON.stringify(invalidCopy));
    }

    const endingLayout = await page.evaluate(() => {
        const lineCount = (selector) => {
            const element = document.querySelector(selector);
            if (!element) return {missing: true};
            const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
            return {
                lines: Math.round(element.getBoundingClientRect().height / lineHeight),
                overflows: element.scrollWidth > element.clientWidth + 2
            };
        };
        const compare = document.querySelector('#page-11 .beauty-before-after');
        const before = compare?.querySelector('.beauty-state-before');
        const arrow = compare?.querySelector(':scope > b');
        const after = compare?.querySelector('.beauty-state-after');
        const measuredGap = (left, right) =>
            left && right ? right.getBoundingClientRect().left - left.getBoundingClientRect().right : -1;
        const textOverflow = (element) =>
            element && element.scrollWidth > element.clientWidth + 2;
        return {
            watchdog: lineCount('#page-11 .beauty-watchdog'),
            roleFit: lineCount('#page-13 .fit-skill-card:nth-child(2) > p'),
            sideIntro: lineCount('#page-13 .side-intro'),
            afterText: lineCount('#page-11 .beauty-state-after p'),
            comparison: {
                beforeToArrow: measuredGap(before, arrow),
                arrowToAfter: measuredGap(arrow, after),
                beforeTextOverflow: textOverflow(before?.querySelector('p')),
                afterTextOverflow: textOverflow(after?.querySelector('p'))
            },
            removedContactDescription: !document.querySelector('#page-13 .fit-contact-name p')
        };
    });
    console.log('FINAL_COPY_LAYOUT:', JSON.stringify(endingLayout));
    if (
        endingLayout.watchdog.lines !== 1 || endingLayout.watchdog.overflows ||
        endingLayout.roleFit.lines !== 2 || endingLayout.roleFit.overflows ||
        endingLayout.sideIntro.lines !== 3 || endingLayout.sideIntro.overflows ||
        endingLayout.afterText.lines !== 1 || endingLayout.afterText.overflows ||
        endingLayout.comparison.beforeToArrow < 2 ||
        endingLayout.comparison.arrowToAfter < 2 ||
        endingLayout.comparison.beforeTextOverflow ||
        endingLayout.comparison.afterTextOverflow ||
        !endingLayout.removedContactDescription
    ) {
        throw new Error('Final requested typography or comparison spacing check failed');
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
