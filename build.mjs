import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import MarkdownIt from 'markdown-it';

const site = JSON.parse(await fs.readFile('site.json', 'utf8'));
const url = new URL(site.url);
if (url.protocol !== 'https:') throw new Error('site.url 必须使用 HTTPS');
const out = path.resolve('dist');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const absolute = file => new URL(file, site.url).href;
const md = new MarkdownIt({html:false, linkify:true, typographer:true});
const postFiles = (await fs.readdir('.')).filter(f => /^post-.*\.md$/.test(f));
const posts = await Promise.all(postFiles.map(async file => {
  const source = await fs.readFile(file, 'utf8');
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!front) throw new Error(`${file}: 缺少文章开头的 YAML 配置`);
  const data = parseYaml(front[1], { maxAliasCount: 50 });
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`${file}: 文章配置格式不正确`);
  const content = source.slice(front[0].length);
  for (const key of ['title','date','slug','category','summary']) if (typeof data[key] !== 'string') throw new Error(`${file}: ${key} 必须是字符串`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) throw new Error(`${file}: slug 只能包含小写字母、数字和连接号`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) throw new Error(`${file}: 日期不正确`);
  if (!Array.isArray(data.tags) || !data.tags.every(t => typeof t === 'string')) throw new Error(`${file}: tags 必须是文字列表`);
  const tokens = md.parse(content, {});
  const toc = [];
  for (let i=0; i<tokens.length; i++) if(tokens[i].type === 'heading_open') {
    const id = `section-${toc.length+1}`;
    tokens[i].attrSet('id', id);
    toc.push({id, text:tokens[i+1].content, level:Number(tokens[i].tag.slice(1))});
  }
  return {...data, content, toc, html:md.renderer.render(tokens, md.options, {}), file: `${data.slug}.html`, minutes:Math.max(1,Math.ceil(content.length/500))};
}));
posts.sort((a,b)=>b.date.localeCompare(a.date));
if (new Set(posts.map(p=>p.slug)).size!==posts.length) throw new Error('文章 slug 不能重复');
const categories=[...new Set(posts.map(p=>p.category))];

function head(title,description,file,extra='') {return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>${esc(title)}${title===site.title?'':` · ${esc(site.title)}`}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(absolute(file))}"><meta property="og:type" content="${posts.some(p=>p.file===file)?'article':'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(absolute(file))}"><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${esc(site.title)} RSS" href="feed.xml"><script>try{if(localStorage.getItem('learn-ai-theme')==='dark')document.documentElement.dataset.theme='dark'}catch{}</script><link rel="stylesheet" href="style.css"><script src="app.js" defer></script>${extra}</head>`;}
function layout(title,description,file,body,active='notes',extra='') {return `${head(title,description,file,extra)}<body><a class="skip-link" href="#main">跳到正文</a><header class="site-header wrap"><a class="brand" href="index.html" aria-label="${esc(site.title)} 首页">${esc(site.title)}</a><nav aria-label="主导航"><a ${active==='notes'?'aria-current="page"':''} href="index.html">博客</a><a ${active==='archive'?'aria-current="page"':''} href="archive.html">归档</a><a ${active==='about'?'aria-current="page"':''} href="about.html">关于</a><a href="archive.html?search=1#search-panel">搜索</a></nav></header><main id="main">${body}</main><footer class="site-footer wrap"><div class="footer-links"><a href="${esc(site.repository)}" target="_blank" rel="noopener noreferrer">GitHub</a><a href="feed.xml">RSS</a><button type="button" class="theme-toggle" aria-label="切换深色模式">夜间</button></div><p class="copyright">© ${new Date().getFullYear()} ${esc(site.title)}. 保持好奇，持续记录。</p></footer><div class="toast" role="status" aria-live="polite"></div></body></html>`;}
function articleRow(p){return `<li class="post-row" data-category="${esc(p.category)}" data-search="${esc([p.title,p.summary,...p.tags,p.category].join(' ').toLowerCase())}"><a href="${p.file}"><span class="post-meta"><time datetime="${p.date}">${p.date}</time>${p.sample?'<span class="sample-label">示例笔记</span>':''}</span><span class="post-title">${esc(p.title)}</span></a></li>`;}
function yearGroups(list=posts){const years=[...new Set(list.map(p=>p.date.slice(0,4)))];return years.map(year=>`<section class="year-group" aria-labelledby="year-${year}"><h2 id="year-${year}" class="year-heading">${year}</h2><ul class="post-list">${list.filter(p=>p.date.startsWith(year)).map(articleRow).join('')}</ul></section>`).join('');}
const filterButtons=`<button type="button" class="filter active" data-filter="all" aria-pressed="true">全部</button>${categories.map(c=>`<button type="button" class="filter" data-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join('')}`;
await fs.mkdir(out,{recursive:true});
for(const file of await fs.readdir(out)) await fs.rm(path.join(out,file),{recursive:true,force:true});
const write=(file,content)=>fs.writeFile(path.join(out,file),content);
await write('index.html',layout(site.title,site.description,'index.html',`<div class="site-main wrap" id="notes"><h1 class="sr-only">${esc(site.title)} · 学习笔记</h1>${posts.length?yearGroups():'<p class="page-description">第一篇笔记，正在酝酿。</p>'}</div>`));
for(const [index,p] of posts.entries()) {
  const older=posts[index+1], newer=posts[index-1];
  const body=`<div class="site-main wrap"><article><header class="article-header"><h1>${esc(p.title)}</h1><div class="post-meta"><span>${esc(site.author)}</span><time datetime="${p.date}">${p.date}</time><span>${p.minutes} 分钟阅读</span>${p.sample?'<span class="sample-label">示例笔记</span>':''}</div><div class="tags">${[p.category,...p.tags].map(t=>`<a href="archive.html?q=${encodeURIComponent(t)}">${esc(t)}</a>`).join('')}</div></header>${p.toc.length?`<details class="toc"><summary>本篇目录</summary><nav aria-label="文章目录">${p.toc.filter(t=>t.level<=2).map(t=>`<a href="#${t.id}">${esc(t.text)}</a>`).join('')}</nav></details>`:''}<div class="prose">${p.html.replaceAll('<table>','<div class="table-scroll" role="region" aria-label="数据表格" tabindex="0"><table>').replaceAll('</table>','</table></div>')}</div></article>${older||newer?`<nav class="article-navigation" aria-label="相邻文章">${older?`<a class="older" href="${older.file}"><small>← 更早的笔记</small><span>${esc(older.title)}</span></a>`:''}${newer?`<a class="newer" href="${newer.file}"><small>更新的笔记 →</small><span>${esc(newer.title)}</span></a>`:''}</nav>`:''}<a class="back-link" href="index.html#notes">← 全部笔记</a></div>`;
  const json=JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:p.title,description:p.summary,datePublished:p.date,url:absolute(p.file),author:{'@type':'Person',name:site.author}}).replaceAll('<','\\u003c');
  await write(p.file,layout(p.title,p.summary,p.file,body,'notes',`<script type="application/ld+json">${json}</script>`));
}
await write('archive.html',layout('文章归档',`按时间浏览 ${site.title} 的全部学习笔记。`,'archive.html',`<section class="site-main wrap library"><h1 class="page-title">文章归档</h1><p class="page-description">关于 AI、代码，以及持续学习。</p><div class="library-controls" id="search-panel"><label class="search-field"><span class="sr-only">搜索笔记</span><input type="search" placeholder="搜索标题、摘要或标签…" aria-label="搜索笔记" autocomplete="off"><kbd>/</kbd></label><div class="filters" role="group" aria-label="按分类筛选">${filterButtons}</div></div><p class="result-count" role="status" aria-live="polite">${posts.length} 篇笔记</p>${yearGroups()}<div class="empty-state" hidden><h2>没有找到相关笔记</h2><p>换一个关键词，或试试其他分类。</p><button class="text-button reset-search" type="button">查看全部笔记 →</button></div></section>`,'archive'));
await write('about.html',layout('关于',site.description,'about.html',`<section class="site-main wrap"><h1 class="page-title">关于 ${esc(site.title)}</h1><div class="prose"><p>${esc(site.title)} 是一个记录 AI 概念、动手实践与学习思考的个人笔记空间。</p><p>这里从小问题出发：把不熟悉的概念拆开，把实践的过程留下，把新的理解连接起来。</p><h2>这本笔记里会有什么</h2><ul><li><strong>学习方法</strong>：整理问题，找到适合自己的学习路径。</li><li><strong>动手实践</strong>：保存实验过程、输入输出与仍需验证的想法。</li><li><strong>阅读笔记</strong>：用自己的话记录理解，并保留参考资料。</li></ul><h2>慢一点，也没有关系</h2><p>不追求把所有内容一次学完。能解释清楚一个概念，能重现一次小实验，能提出一个更好的问题，都是值得记录的进展。</p><p class="starter-note">目前的起步文章标记为「示例笔记」，用于展示内容结构，可以随时替换为真实的学习记录。</p></div><div class="about-links"><a href="index.html">阅读笔记 →</a><a href="feed.xml">订阅 RSS →</a></div></section>`,'about'));
await write('404.html',layout('页面未找到',`返回 ${site.title} 继续阅读。`,'404.html',`<section class="site-main wrap not-found"><h1 class="page-title">这页笔记，还没有写到。</h1><p class="page-description">404 · 可能是地址有误，也可能是内容已经移动。</p><a href="${esc(site.url)}">← 回到首页</a></section>`,'').replaceAll('href="style.css"',`href="${esc(absolute('style.css'))}"`).replaceAll('src="app.js"',`src="${esc(absolute('app.js'))}"`).replaceAll('href="index.html',`href="${esc(absolute('index.html'))}`).replaceAll('href="about.html"',`href="${esc(absolute('about.html'))}"`).replaceAll('href="archive.html',`href="${esc(absolute('archive.html'))}`).replaceAll('href="favicon.svg"',`href="${esc(absolute('favicon.svg'))}"`).replaceAll('href="feed.xml"',`href="${esc(absolute('feed.xml'))}"`));
await write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.title)}</title><link>${esc(site.url)}</link><description>${esc(site.description)}</description><language>zh-cn</language>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${esc(absolute(p.file))}</link><guid>${esc(absolute(p.file))}</guid><pubDate>${new Date(p.date+'T00:00:00+08:00').toUTCString()}</pubDate><description>${esc(p.summary)}</description><category>${esc(p.category)}</category></item>`).join('')}</channel></rss>`);
await write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['index.html','about.html','archive.html',...posts.map(p=>p.file)].map(file=>`<url><loc>${esc(absolute(file))}</loc></url>`).join('')}</urlset>`);
for(const file of ['style.css','app.js','favicon.svg']) await fs.copyFile(file,path.join(out,file));
await write('.nojekyll','');
console.log(`Built ${posts.length} articles and 4 pages → dist/`);
