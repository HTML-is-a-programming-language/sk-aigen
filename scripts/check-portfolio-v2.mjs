import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('site');
const type = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server = createServer(async (request, response) => {
    try {
        const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
        const file = resolve(root, '.' + urlPath);
        if (!file.startsWith(root + sep)) return response.writeHead(403).end();
        const body = await readFile(file);
        response.setHeader('Content-Type', type[extname(file)] || 'application/octet-stream');
        response.writeHead(200).end(body);
    } catch {
        response.writeHead(404).end('Not found');
    }
});
const issues = [];
let browser;
try {
    await new Promise(ok => server.listen(0, '127.0.0.1', ok));
    const url = 'http://127.0.0.1:' + server.address().port + '/portfolio-v2.html';
    browser = await chromium.launch();
    await mkdir('v2-qa', {recursive:true});
    for (const v of [{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}]) {
        const page = await browser.newPage({viewport:{width:v.width,height:v.height}});
        page.on('pageerror', e => issues.push(v.name + ': JS ' + e.message));
        await page.goto(url, {waitUntil:'networkidle'});
        await page.locator('#page-17 .fit-project-grid').waitFor();
        await page.evaluate(() => document.fonts.ready);
        const metrics = await page.evaluate(() => {
            const sheets = [...document.styleSheets].map(s => s.href || '');
            const cards = [...document.querySelectorAll('.record-card')];
            const keyStyles = Object.fromEntries([
                ['#page-08 .careflow-evidence-grid','grid'],
                ['#page-11 .survey-retrospective-panel','flex'],
                ['#page-14 .beauty-lessons-list','grid'],
                ['#page-16 .experience-grid','grid'],
                ['#page-17 .fit-project-grid','grid']
            ].map(([s,w]) => [s, {want:w,got:getComputedStyle(document.querySelector(s)).display}]));
            return {
                pages:document.querySelectorAll('.page-wrap').length,
                records:cards.length,
                pageIds:[...document.querySelectorAll('.page-wrap[id]')].map(e=>e.id),
                overflowing:cards.map((el,i)=>({card:i+1,y:el.scrollHeight-el.clientHeight,x:el.scrollWidth-el.clientWidth})).filter(x=>x.x>3||x.y>3),
                missingImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
                cols:getComputedStyle(document.querySelector('#page-06 .record-grid')).gridTemplateColumns.split(' ').length,
                scrollWidth:document.documentElement.scrollWidth,
                viewportWidth:innerWidth,
                keyStyles,
                hasIsolatedCss:sheets.some(s=>s.endsWith('/editorial-v2.css'))
            };
        });
        console.log(v.name + ': ' + JSON.stringify(metrics));
        if(metrics.pages!==17||metrics.records!==24||new Set(metrics.pageIds).size!==16)issues.push(v.name+': wrong page or record count');
        if(!metrics.hasIsolatedCss)issues.push(v.name+': original stylesheet loaded instead of V2');
        if(metrics.cols!==3||metrics.overflowing.length)issues.push(v.name+': record clipping/grid '+JSON.stringify(metrics.overflowing));
        if(metrics.missingImages.length)issues.push(v.name+': missing images '+JSON.stringify(metrics.missingImages));
        if(metrics.scrollWidth>v.width+3)issues.push(v.name+': horizontal overflow');
        for(const [s,x] of Object.entries(metrics.keyStyles))if(x.got!==x.want)issues.push(v.name+': broken selector '+s+' '+x.got);
        for(const id of ['06','08','09','11','12','14','15','16','17']){
            await page.locator('#page-'+id+' article').screenshot({path:'v2-qa/'+v.name+'-'+id+'.png'});
        }
        await page.close();
    }
} catch(e) {
    issues.push('QA error: '+(e.stack||e.message));
} finally {
    await browser?.close();
    await new Promise(ok => server.close(ok));
}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}
else console.log('V2 desktop/mobile visual QA passed.');
