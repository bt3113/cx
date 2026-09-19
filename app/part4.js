async function openStoryStudio(space){
 document.querySelector('.story-backdrop')?.remove();
 document.body.insertAdjacentHTML('beforeend',storySheet({space}));
 currentStory={space,blob:null,url:null};
 bindStorySheet();
 try{
   const blob=await createStoryBlob(space);
   const url=URL.createObjectURL(blob);
   currentStory={space,blob,url};
   const img=document.getElementById('story-preview-image');if(img){img.src=url;img.onload=()=>document.getElementById('story-generating')?.classList.add('hidden')}
   track('story_generated',{type:space?'space':'profile',space:space?.title||null});
 }catch(err){
   document.getElementById('story-generating')?.classList.add('error');
   document.getElementById('story-generating')?.querySelector('b')?.replaceChildren(document.createTextNode('Could not generate preview. You can still share the link.'));
 }
}
function bindStorySheet(){
 document.querySelectorAll('[data-close-story]').forEach(el=>el.addEventListener('click',()=>closeStory()));
 document.querySelectorAll('[data-copy-link]').forEach(el=>el.addEventListener('click',()=>copyShareLink(currentStory.space)));
 document.querySelector('[data-download-story]')?.addEventListener('click',downloadStory);
 document.querySelector('[data-native-share]')?.addEventListener('click',nativeShareStory);
}
function closeStory(){if(currentStory.url)URL.revokeObjectURL(currentStory.url);currentStory={space:null,blob:null,url:null};document.querySelector('.story-backdrop')?.remove()}
async function copyShareLink(space){const url=absoluteShareUrl(space);try{await navigator.clipboard.writeText(url);toast('Share link copied')}catch{prompt('Copy this link:',url)}track('share_link_copy',{space:space?.title||'profile'})}
function downloadStory(){
 if(!currentStory.blob){toast('Story is still generating');return}
 const a=document.createElement('a');a.href=currentStory.url||URL.createObjectURL(currentStory.blob);a.download=`zat-${profile.username}-${currentStory.space?slugify(currentStory.space.title):'profile'}-story.png`;document.body.append(a);a.click();a.remove();track('story_download',{space:currentStory.space?.title||'profile'})
}
async function nativeShareStory(){
 const space=currentStory.space;const shareUrl=absoluteShareUrl(space);const title=space?`${profile.name} · ${space.title}`:`${profile.name} on Zat`;
 const text=space?`${space.title} — ${space.subtitle}`:`Explore ${profile.name}'s world on Zat.`;
 try{
   if(currentStory.blob){
     const file=new File([currentStory.blob],`zat-${space?slugify(space.title):'profile'}-story.png`,{type:'image/png'});
     if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){await navigator.share({files:[file],title,text:`${text}\n${shareUrl}`});track('native_share',{space:space?.title||'profile',withFile:true});return}
   }
   if(navigator.share){await navigator.share({title,text,url:shareUrl});track('native_share',{space:space?.title||'profile',withFile:false});return}
   downloadStory();await copyShareLink(space);toast('Story saved and link copied');
 }catch(err){if(err?.name!=='AbortError')toast('Share sheet unavailable — use Save story image')}
}

