import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = resolve(repoRoot, 'site/index.html');
const chaptersPath = resolve(repoRoot, 'site/chapters.html');
const markup = readFileSync(indexPath, 'utf8');
const chapters = readFileSync(chaptersPath, 'utf8');

const placeholder = '<div id="portfolio-chapters" aria-label="프로젝트 및 포트폴리오 본문"></div>';
if (!markup.includes(placeholder)) {
    throw new Error('Index chapter placeholder was not found. Refusing to overwrite or duplicate the site.');
}

const chapterPages = (chapters.match(/<article class="page editorial-page/g) || []).length;
if (chapterPages !== 13) {
    throw new Error('Expected 13 portfolio chapters, received ' + chapterPages);
}

const built = markup.replace(
    placeholder,
    '<div id="portfolio-chapters" aria-label="프로젝트 및 포트폴리오 본문">' +
        chapters +
        '</div>'
);
const totalPages = (built.match(/<article class="page /g) || []).length;
if (totalPages !== 14) {
    throw new Error('Expected 14 published pages; received ' + totalPages);
}
writeFileSync(indexPath, built, 'utf8');
console.log('Pre-rendered ' + totalPages + ' pages in site/index.html for GitHub Pages.');
