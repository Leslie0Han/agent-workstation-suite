import { chromium } from 'playwright';
import path from 'node:path';

const root = 'D:/leslie/60_claude项目库/图像生成工作台';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

page.on('pageerror', (error) => {
  console.error('PAGE_ERROR', error.message);
});

await page.goto(`file:///${root}/index.html`);
await page.fill('#promptInput', '未来城市中的玻璃温室，晨光，电影感');
await page.selectOption('#aspectSelect', 'auto');
await page.fill('#countInput', '4');
await page.click('#generateBtn');
await page.waitForFunction(() => document.querySelectorAll('.thumb-card').length === 4, null, { timeout: 10000 });
await page.locator('.thumb-card').first().click();
await page.waitForSelector('#previewDialog[open]', { timeout: 10000 });
await page.click('#closePreviewBtn');

await page.mouse.move(360, 150);
await page.mouse.down();
await page.mouse.move(760, 560);
await page.mouse.up();
const selectedBeforeContext = await page.locator('.thumb-card.selected').count();

await page.locator('.thumb-card').first().click({ button: 'right' });
const menuVisible = await page.locator('#contextMenu').evaluate((el) => getComputedStyle(el).display);
await page.click('[data-action="stack"]');
await page.waitForFunction(() => document.querySelectorAll('.thumb-card').length === 2, null, { timeout: 10000 });
await page.locator('.stack-card').click();
await page.waitForSelector('#stackDialog[open]', { timeout: 10000 });
const stackItems = await page.locator('.stack-item').count();
await page.locator('.stack-item').first().click();
await page.waitForSelector('#previewDialog[open]', { timeout: 10000 });
await page.click('#closePreviewBtn');
await page.locator('.stack-card').click({ button: 'right' });
const unstackVisible = await page.locator('[data-action="unstack"]').evaluate(el => getComputedStyle(el).display);
await page.click('[data-action="unstack"]');
await page.waitForFunction(() => document.querySelectorAll('.thumb-card').length === 4, null, { timeout: 10000 });

await page.screenshot({ path: path.join(root, 'preview-workbench.png'), fullPage: true });
const result = await page.evaluate(({ stackItemsCount, unstackDisplay }) => ({
  cards: document.querySelectorAll('.thumb-card').length,
  selected: document.querySelectorAll('.thumb-card.selected').length,
  stacks: document.querySelectorAll('.stack-card').length,
  stackItems: stackItemsCount,
  unstackVisible: unstackDisplay,
  firstName: document.querySelector('.thumb-info strong')?.textContent,
  firstAspect: document.querySelector('.thumb-info span')?.textContent,
  meta: document.querySelector('#galleryMeta').innerText,
}), { stackItemsCount: stackItems, unstackDisplay: unstackVisible });

await browser.close();
console.log(JSON.stringify({ selectedBeforeContext, menuVisible, ...result }, null, 2));
