function roundedRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
function fitText(ctx,text,maxWidth,startSize,minSize=28){let size=startSize;while(size>minSize){ctx.font=`600 ${size}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;if(ctx.measureText(text).width<=maxWidth)return size;size-=2}return size}
function wrapText(ctx,text,x,y,maxWidth,lineHeight,maxLines=5){const words=String(text||'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines-1)break}else line=test}if(line&&lines.length<maxLines)lines.push(line);lines.forEach((l,i)=>ctx.fillText(l,x,y+i*lineHeight));return lines.length}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();if(/^https?:\/\//.test(src)&&!src.startsWith(location.origin))img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
function drawCover(ctx,img,x,y,w,h){const ir=img.width/img.height,rr=w/h;let sx=0,sy=0,sw=img.width,sh=img.height;if(ir>rr){sw=img.height*rr;sx=(img.width-sw)/2}else{sh=img.width/rr;sy=(img.height-sh)/2}ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h)}
function drawContain(ctx,img,x,y,w,h){const scale=Math.min(w/img.width,h/img.height);const dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh)}
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('blob failed')),'image/png',0.96))}

async function createStoryBlob(space){
 const W=1080,H=1920;const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');
 ctx.fillStyle='#070809';ctx.fillRect(0,0,W,H);
 if(space) await drawSpaceStory(ctx,space,W,H); else await drawProfileStory(ctx,W,H);
 return canvasBlob(canvas)
}
async function drawSpaceStory(ctx,space,W,H){
 const img=await loadImage(space.image);
 drawCover(ctx,img,0,0,W,H);
 const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,'rgba(5,6,7,.10)');grad.addColorStop(.44,'rgba(5,6,7,.15)');grad.addColorStop(.72,'rgba(5,6,7,.72)');grad.addColorStop(1,'rgba(5,6,7,.98)');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
 const vign=ctx.createRadialGradient(W/2,H*.38,80,W/2,H*.42,H*.85);vign.addColorStop(0,'rgba(0,0,0,0)');vign.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=vign;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(255,255,255,.20)';ctx.lineWidth=2;roundedRect(ctx,50,50,W-100,H-100,52);ctx.stroke();
 ctx.fillStyle='#fff';ctx.font='italic 600 68px Georgia,serif';ctx.fillText('Zat.',76,132);
 ctx.font='500 28px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,.82)';ctx.fillText(profile.name,76,184);
 ctx.font='500 22px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';const tag=space.disclosure.toUpperCase();const tw=ctx.measureText(tag).width;ctx.fillStyle='rgba(8,9,10,.58)';roundedRect(ctx,74,H-660,tw+48,54,27);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(tag,98,H-625);
 const titleSize=fitText(ctx,space.title,W-152,112,58);ctx.font=`600 ${titleSize}px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;ctx.fillStyle='#fff';ctx.fillText(space.title,76,H-500);
 ctx.font='400 42px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,.86)';wrapText(ctx,space.subtitle,76,H-430,W-152,54,3);
 ctx.font='400 28px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,.70)';wrapText(ctx,space.note,76,H-290,W-152,40,3);
 ctx.strokeStyle='rgba(255,255,255,.22)';ctx.beginPath();ctx.moveTo(76,H-124);ctx.lineTo(W-76,H-124);ctx.stroke();
 ctx.font='500 24px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillText(`zat · /${profile.username}/${slugify(space.title)}`,76,H-80);
 ctx.textAlign='right';ctx.fillText('Explore ↗',W-76,H-80);ctx.textAlign='left';
}
async function drawProfileStory(ctx,W,H){
 const [avatar,...cards]=await Promise.all([loadImage(profile.avatar),...(profile.spaces||[]).slice(0,4).map(s=>loadImage(s.image))]);
 const bg=ctx.createRadialGradient(W/2,H*.32,60,W/2,H*.38,H*.72);bg.addColorStop(0,'#26282a');bg.addColorStop(.42,'#0d0e10');bg.addColorStop(1,'#050607');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 ctx.strokeStyle='rgba(215,178,145,.22)';ctx.lineWidth=2;for(let r=360;r<1300;r+=170){ctx.beginPath();ctx.ellipse(W/2,H*.47,r,r*.55,0,0,Math.PI*2);ctx.stroke()}
 ctx.strokeStyle='rgba(255,255,255,.10)';for(let x=70;x<W;x+=188){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
 const positions=[[64,300,300,390],[716,260,300,390],[56,970,300,390],[724,1010,300,390]];
 cards.forEach((img,i)=>{const [x,y,w,h]=positions[i];ctx.save();roundedRect(ctx,x,y,w,h,32);ctx.clip();drawCover(ctx,img,x,y,w,h);const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(.4,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);ctx.restore();ctx.strokeStyle='rgba(255,255,255,.16)';roundedRect(ctx,x,y,w,h,32);ctx.stroke();ctx.font='600 32px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='#fff';ctx.fillText(profile.spaces[i].title,x+22,y+h-30)});
 ctx.save();ctx.shadowColor='rgba(0,0,0,.65)';ctx.shadowBlur=60;drawContain(ctx,avatar,280,290,520,1180);ctx.restore();
 ctx.fillStyle='#fff';ctx.font='italic 600 70px Georgia,serif';ctx.fillText('Zat.',62,116);
 ctx.textAlign='center';ctx.font='600 62px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillText(profile.name,W/2,H-390);
 ctx.font='400 36px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,.82)';wrapCentered(ctx,profile.headline,W/2,H-320,760,46,3);
 ctx.font='500 26px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='rgba(255,255,255,.62)';ctx.fillText(profile.roles,W/2,H-200);
 ctx.fillStyle='rgba(255,255,255,.10)';roundedRect(ctx,300,H-138,480,66,33);ctx.fill();ctx.font='600 25px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';ctx.fillStyle='#fff';ctx.fillText(`zat · /${profile.username}   ↗`,W/2,H-96);ctx.textAlign='left';
}
function wrapCentered(ctx,text,cx,y,maxWidth,lineHeight,maxLines){const words=String(text||'').split(/\s+/);let line='',lines=[];for(const word of words){const test=line?`${line} ${word}`:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;if(lines.length>=maxLines-1)break}else line=test}if(line&&lines.length<maxLines)lines.push(line);lines.forEach((l,i)=>ctx.fillText(l,cx,y+i*lineHeight));return lines.length}

window.addEventListener('popstate',render);
render();
