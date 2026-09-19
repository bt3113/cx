import sharp from 'sharp';
import { PORTRAIT } from '../assets/extract/regions.ts';
const D='/tmp/claude-0/-home-user-ms/95cd0512-5894-5540-a425-6b434e98f9ab/scratchpad';
async function main(){
  const r = PORTRAIT.region, w=r.width, h=r.height;
  const cropped = await sharp('MBV.png').extract(r).ensureAlpha().png().toBuffer();
  const { data, info } = await sharp(cropped).raw().toBuffer({resolveWithObject:true});
  const ch = data.length/(w*h);
  console.log('channels', ch, 'info.channels', info.channels, 'len', data.length, 'expect', w*h*4);
  const lumaAt=(x:number,y:number)=>{const o=(y*w+x)*ch;return 0.2126*data[o]!+0.7152*data[o+1]!+0.0722*data[o+2]!;};
  const DELTA=5.5, RUN=4, ES=8;
  const alpha=Buffer.alloc(w*h,0);
  let rowsHit=0;
  for(let y=0;y<h;y++){
    let l=0,rr=0;
    for(let i=0;i<ES;i++){l+=lumaAt(i,y);rr+=lumaAt(w-1-i,y);}
    const bgL=l/ES,bgR=rr/ES;
    let start=-1;
    for(let x=0;x<w-RUN;x++){let run=0;for(let k=0;k<RUN;k++)if(Math.abs(lumaAt(x+k,y)-bgL)>DELTA)run++;if(run===RUN){start=x;break;}}
    if(start<0)continue;
    let end=-1;
    for(let x=w-1;x>RUN;x--){let run=0;for(let k=0;k<RUN;k++)if(Math.abs(lumaAt(x-k,y)-bgR)>DELTA)run++;if(run===RUN){end=x;break;}}
    if(end<=start)continue;
    rowsHit++;
    alpha.fill(255,y*w+start,y*w+end+1);
  }
  console.log('rows with figure:', rowsHit, '/', h);
  await sharp(alpha,{raw:{width:w,height:h,channels:1}}).png().toFile(`${D}/mask-raw.png`);
  console.log('wrote mask-raw.png');
}
main().catch(e=>{console.error(e);process.exit(1);});
