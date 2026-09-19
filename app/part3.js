
function parseRoute(){
 const parts=location.pathname.split('/').filter(Boolean).map(decodeURIComponent);
 if(!parts.length)return {page:'home'};
 if(parts[0]==='studio')return {page:'studio'};
 if(parts[0]==='pricing')return {page:'pricing'};
 return {page:'profile',username:parts[0]||'alex',spaceSlug:parts[1]||null};
}
async function render(){
 const route=parseRoute();
 if(route.page==='profile') await loadProfile(route.username); else if(route.page==='studio') await loadProfile('alex');
 const root=document.getElementById('app');
 if(route.page==='home') root.outerHTML=marketingPage(); else if(route.page==='studio') root.outerHTML=studioPage(); else if(route.page==='pricing') root.outerHTML=pricingPage(); else root.outerHTML=profilePage();
 bind();
 if(route.page==='profile'&&route.spaceSlug){
   const match=(profile.spaces||[]).find(s=>slugify(s.title)===route.spaceSlug);
   if(match){initialDeepSpace=match;setTimeout(()=>openSpace(match),80)}
 }
}
function bind(){
 document.querySelectorAll('[data-nav]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();go(new URL(a.href,location.href).pathname)}));
 document.querySelectorAll('[data-space]').forEach(cardEl=>{
   cardEl.addEventListener('click',e=>{if(e.target.closest('[data-share-space]'))return;const s=profile.spaces.find(x=>x.id===+cardEl.dataset.space);openSpace(s)});
   cardEl.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.target.closest('[data-share-space]')){e.preventDefault();const s=profile.spaces.find(x=>x.id===+cardEl.dataset.space);openSpace(s)}})
 });
 document.querySelectorAll('[data-share-space]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const s=profile.spaces.find(x=>x.id===+el.dataset.shareSpace);openStoryStudio(s)}));
 document.querySelectorAll('[data-share-profile]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openStoryStudio(null)}));
 document.getElementById('save-profile')?.addEventListener('click',saveProfile);document.getElementById('save-profile-bottom')?.addEventListener('click',saveProfile);
 document.getElementById('reset-profile')?.addEventListener('click',()=>{profile=clone(defaults);try{localStorage.removeItem('zat:alex')}catch{}render();toast('Demo reset')});
}
function openSpace(space){if(!space)return;document.querySelector('.modal-backdrop')?.remove();document.body.insertAdjacentHTML('beforeend',modal(space));track('space_open',{space:space.title});bindModal(space)}
function bindModal(space){
 document.querySelectorAll('[data-close-modal]').forEach(el=>el.addEventListener('click',()=>{document.querySelector('.modal-backdrop')?.remove();if(initialDeepSpace){initialDeepSpace=null;history.replaceState({},'',profilePath())}}));
 document.addEventListener('keydown',escOnce,{once:true});
 document.querySelector('[data-save]')?.addEventListener('click',()=>{toast('Saved to your Zat list');track('save_item',{space:space.title})});
 document.querySelector('.item-modal [data-share-space]')?.addEventListener('click',e=>{e.preventDefault();openStoryStudio(space)});
}
function escOnce(e){if(e.key==='Escape'){document.querySelector('.modal-backdrop')?.remove();document.querySelector('.story-backdrop')?.remove()}}

let currentStory={space:null,blob:null,url:null};
