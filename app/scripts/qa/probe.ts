import { chromium } from '@playwright/test';
async function main(){
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4173/cx/alexden', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  const info = await p.evaluate(() => {
    const stage = document.querySelector('.world-stage') as HTMLElement | null;
    const inner = stage?.querySelector('.preserve-3d') as HTMLElement | null;
    const cards = Array.from(document.querySelectorAll('a[aria-label*="items"]')).slice(0,4).map((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      const parent = (el.parentElement as HTMLElement);
      const pr = parent.getBoundingClientRect();
      return { label: el.getAttribute('aria-label'), cardTop: Math.round(r.top), parentTop: Math.round(pr.top), parentStyleTop: parent.style.top, parentPos: getComputedStyle(parent).position, parentTransform: getComputedStyle(parent).transform.slice(0,40) };
    });
    return {
      stage: stage ? { h: Math.round(stage.getBoundingClientRect().height), pos: getComputedStyle(stage).position } : null,
      inner: inner ? { h: Math.round(inner.getBoundingClientRect().height), top: Math.round(inner.getBoundingClientRect().top), pos: getComputedStyle(inner).position } : null,
      cards,
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await b.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
