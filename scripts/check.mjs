import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const files=await fs.readdir('dist');
const htmlFiles=files.filter(f=>f.endsWith('.html'));
let links=0;
for (const file of htmlFiles) {
  const html=await fs.readFile(path.join('dist',file),'utf8');
  assert.match(html,/<title>[^<]+<\/title>/,`${file}: 页面标题`);
  assert.match(html,/<main id="main">/,`${file}: 正文区域`);
  assert.match(html,/<html lang="zh-CN">/,`${file}: 页面语言`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`${file}: 重复 ID`);
  for (const [,target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(target)) continue;
    const [name,anchor]=target.split('#');
    const targetFile=name.split('?')[0]||file;
    assert(files.includes(targetFile),`${file}: 链接目标不存在 ${target}`);
    if (anchor) {
      const targetHtml=targetFile===file?html:await fs.readFile(path.join('dist',targetFile),'utf8');
      assert(targetHtml.includes(`id="${anchor}"`),`${file}: 锚点不存在 ${target}`);
    }
    links++;
  }
  for (const [,json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(json);
}
assert(files.includes('feed.xml'));
assert(files.includes('sitemap.xml'));
assert(files.includes('.nojekyll'));
console.log(`PASS: ${htmlFiles.length} pages, ${links} internal links, metadata and article anchors.`);
