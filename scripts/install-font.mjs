import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const target = resolve(root, 'site/assets/fonts/PretendardVariable.woff2');
const source = [
    'https://raw.githubusercontent.com/orioncactus/pretendard/main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@main/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'
];

function isValid(font) {
    return font.length > 100_000 && font.length < 8_000_000 &&
        font.subarray(0, 4).toString('ascii') === 'wOF2';
}

if (existsSync(target) && isValid(readFileSync(target))) {
    console.log('Self-hosted Pretendard Variable font already present.');
    process.exit(0);
}

let lastError;
for (const url of source) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);
        let response;
        try {
            response = await fetch(url, { signal: controller.signal });
        } finally {
            clearTimeout(timeout);
        }
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const font = Buffer.from(await response.arrayBuffer());
        if (!isValid(font)) throw new Error('Invalid Pretendard WOFF2 font data');
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, font);
        console.log('Installed authentic Pretendard Variable: ' +
            font.length + ' bytes, sha256=' +
            createHash('sha256').update(font).digest('hex'));
        process.exit(0);
    } catch (error) {
        lastError = error;
        console.warn('Font source unavailable: ' + new URL(url).host +
            ' (' + error.message + ')');
    }
}
throw new Error('Unable to install Pretendard Variable font: ' + lastError?.message);
