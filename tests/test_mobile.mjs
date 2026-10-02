import { launch, login, BASE, SHOTS } from './harness.mjs';
import fs from 'fs'; fs.mkdirSync(SHOTS, { recursive: true });
const { browser, context } = await launch({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.goto(BASE + '/11601/hub.html'); await login(page);
for (const p of ['index.html?stay', '11601/hub.html', '11601/digital/index.html', '11601/digital/1.html', '11601/digital/2.html', '11601/digital/3.html', '11601/digital/4.html', '11601/python.html', '11601/platform.html#G4', '11601/5016b.html#S3', '11602/hub.html', '11602/media.html', '11602/media.html#demo', '11602/media.html#ai', '11602/media.html#W1', '11602/media.html#W2', '11602/media.html#W3', '11602/media.html#W4', '11602/media.html#W5', '11602/network.html#N4', '11602/unit6.html', '11602/data.html#D4', '11602/sheet.html#T5', '11602/cipher.html', '11602/5016b.html#S3']) {
  await page.goto(BASE + '/' + p); await page.waitForTimeout(p.includes('python') ? 4000 : 1200);
  if (/platform|network|data\.html/.test(p)) { await page.click('#go'); await page.waitForTimeout(300); }
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const name = p.replace(/[\/#?.]/g, '_');
  await page.screenshot({ path: `${SHOTS}m-${name}.png`, fullPage: false });
  console.log(p, 'overflow', ov);
}
await browser.close();
