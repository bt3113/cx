import sharp from 'sharp';
import { PORTRAIT } from '../assets/extract/regions.ts';
async function main(){
  const r = PORTRAIT.region;
  const { data, info } = await sharp('MBV.png').extract(r).raw().toBuffer({resolveWithObject:true});
  const ch = info.channels, W = info.width, H = info.height;
  const L = (x:number,y:number)=>{const o=(y*W+x)*ch; return +(0.2126*data[o]!+0.7152*data[o+1]!+0.0722*data[o+2]!).toFixed(1);};
  console.log('crop', W, 'x', H);
  const pts: [string,number,number][] = [
    ['top-left corner', 4, 4], ['top-mid bg', Math.round(W/2), 6], ['top-right corner', W-5, 4],
    ['left bg mid', 5, Math.round(H*0.5)], ['right bg mid', W-6, Math.round(H*0.5)],
    ['bg beside head', Math.round(W*0.18), Math.round(H*0.10)],
    ['bg right of head', Math.round(W*0.82), Math.round(H*0.10)],
    ['bg between legs', Math.round(W*0.50), Math.round(H*0.88)],
    ['hair', Math.round(W*0.50), Math.round(H*0.055)],
    ['sweater', Math.round(W*0.50), Math.round(H*0.32)],
    ['trousers', Math.round(W*0.42), Math.round(H*0.70)],
    ['shoe', Math.round(W*0.35), Math.round(H*0.965)],
    ['floor below', Math.round(W*0.5), H-4],
  ];
  for (const [n,x,y] of pts) console.log(n.padEnd(20), 'luma', String(L(x,y)).padStart(6), ' /255');
}
main().catch(e=>{console.error(e);process.exit(1);});
