const defaults={
 username:'alex', name:'Alex Kim', city:'Seoul, KR', time:'10:24 PM', headline:'A More Meaningful Tomorrow', roles:'Designer · Creator · Explorer', bio:'Everything I use, love and keep coming back to.', avatar:ZAT_ASSETS.avatar,
 spaces:[
  ['Wardrobe','Style for a brighter me.',ZAT_ASSETS.wardrobe,'Purchased myself','The pieces I reach for when I want to feel put together without trying too hard.'],
  ['Music','Sounds that move me.',ZAT_ASSETS.music,'Affiliate','My everyday headphones. Comfortable for long edits and flights.'],
  ['Travel','New places. New perspectives.',ZAT_ASSETS.travel,'Editorial','Places, stays and travel gear I would genuinely return to.'],
  ['Memories','Moments that matter.',ZAT_ASSETS.memories,'Editorial','A small archive of places and moments worth keeping.'],
  ['Books','A calmer, sharper mind.',ZAT_ASSETS.books,'Purchased myself','Books I have actually finished, highlighted and recommended to friends.'],
  ['Work','Ideas into real impact.',ZAT_ASSETS.work,'Affiliate','The hardware and software I use to make things every day.'],
  ['Photography','Finding beauty in the everyday.',ZAT_ASSETS.photography,'Affiliate','My camera setup and the small tools that make shooting easier.'],
  ['Fitness','A stronger tomorrow.',ZAT_ASSETS.fitness,'Purchased myself','The simple equipment I consistently use rather than collect.'],
  ['Gaming','Play. Recharge. Level up.',ZAT_ASSETS.gaming,'Affiliate','Games and gear I come back to after work.'],
  ['Movies','Stories that stay.',ZAT_ASSETS.movies,'Editorial','Films I keep thinking about long after the credits.'],
  ['Ideas','Random thoughts. Better tomorrows.',ZAT_ASSETS.ideas,'Editorial','Small ideas, references and sparks that shape bigger work.'],
  ['Life','A collection of everything me.',ZAT_ASSETS.life,'Editorial','The things that do not fit a category but still feel essential.']
 ].map((s,i)=>({id:i+1,title:s[0],subtitle:s[1],image:s[2],disclosure:s[3],note:s[4],product:s[0]+' picks',url:'#'}))
};

const escapeHTML=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const slugify=s=>String(s||'space').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let profile=clone(defaults);
let serverAvailable=false;
let initialDeepSpace=null;

async function loadProfile(username='alex'){
  try{
    const r=await fetch(`/api/profile/${encodeURIComponent(username)}`,{headers:{'Accept':'application/json'}});
    if(r.ok){profile=await r.json();serverAvailable=true;return}
  }catch{}
  try{
    const saved=localStorage.getItem(`zat:${username}`);
    if(saved) profile=JSON.parse(saved); else profile=clone(defaults);
  }catch{profile=clone(defaults)}
}
function go(path){history.pushState({},'',path);render();window.scrollTo({top:0,behavior:'instant'})}
function navLink(label,path,cls=''){return `<a href="${path}" class="${cls}" data-nav>${label}</a>`}
function brand(){return `<a class="zat-wordmark" href="/" data-nav aria-label="Zat home">Zat<span class="zat-dot"></span></a>`}
function profilePath(space){const base=`/${encodeURIComponent(profile.username||'alex')}`;return space?`${base}/${slugify(space.title)}`:base}
function absoluteShareUrl(space){return `${location.origin}${profilePath(space)}`}

function marketingPage(){
 return `<main id="app" class="marketing">
 <nav class="marketing-nav">${brand()}<div class="marketing-links">${navLink('For creators','/alex')} ${navLink('Pricing','/pricing')} ${navLink('Studio','/studio')} <a class="pill light" href="/studio" data-nav>Build my Zat ↗</a></div></nav>
 <section class="hero-wrap"><div class="hero-copy"><div class="kicker">A personal space on the internet</div><h1>Your world, beautifully organized.</h1><p>Zat turns a creator's taste, tools, work and recommendations into a polished, permanent destination people can explore, save, shop and share.</p><div class="hero-cta"><a class="pill light" href="/alex" data-nav>Open the live profile ↗</a><a class="pill" href="/studio" data-nav>Open creator studio</a></div><div class="hero-note">Every Space can become a ready-to-post 9:16 story with one tap.</div></div>
 <div class="preview-shell" aria-label="Zat profile preview"><img class="preview-avatar" src="${ZAT_ASSETS.avatar}" alt="Creator avatar"><div class="preview-card a"><img src="${ZAT_ASSETS.wardrobe}" alt="Wardrobe"></div><div class="preview-card b"><img src="${ZAT_ASSETS.music}" alt="Music"></div><div class="preview-card c"><img src="${ZAT_ASSETS.photography}" alt="Photography"></div><div class="preview-card d"><img src="${ZAT_ASSETS.travel}" alt="Travel"></div></div></section>
 <div class="brand-band">Identity · Taste · Trust · Commerce · Shareability · Analytics</div>
 <section class="feature-grid"><article class="feature"><span class="num">01</span><b>One permanent destination</b><p>Replace scattered links with an editorial identity page that actually explains who you are and what belongs in your world.</p></article><article class="feature"><span class="num">02</span><b>One-tap Story cards</b><p>Every Space and full profile generates a polished 1080×1920 visual for Instagram Stories, Messages, WhatsApp and the native share sheet.</p></article><article class="feature"><span class="num">03</span><b>Built for creator revenue</b><p>Track interest, saves and outbound clicks so creators can understand what their audience values before they monetize it.</p></article></section>
 </main>`;
}

function card(space,i){
 return `<article class="space-card card-${i+1}" data-space="${space.id}" tabindex="0" role="button" aria-label="Open ${escapeHTML(space.title)}">
  <img src="${escapeHTML(space.image)}" alt="" loading="${i>3?'lazy':'eager'}">
  <span class="space-index">${String(i+1).padStart(2,'0')}</span>
  <button class="space-share" data-share-space="${space.id}" aria-label="Share ${escapeHTML(space.title)} as a story" title="Share story">↗</button>
  <div class="space-copy"><small>${escapeHTML(space.product||'')}</small><h3>${escapeHTML(space.title)}</h3><p>${escapeHTML(space.subtitle)}</p></div>
  <span class="space-arrow" aria-hidden="true">→</span>
 </article>`
}
function profilePage(){
 const spaces=profile.spaces||defaults.spaces;
 return `<main id="app" class="profile-page">
  <header class="profile-topbar"><div class="profile-top-left">${brand()}<span class="profile-tagline">Ideas &nbsp; Shape &nbsp; A &nbsp; Kinder &nbsp; Tomorrow</span></div><div></div><div class="profile-top-right"><span>• &nbsp;${escapeHTML(profile.city)} &nbsp; · &nbsp; ${escapeHTML(profile.time)}</span><button class="pill profile-share-btn" data-share-profile>Share profile ↗</button><a class="pill light" href="mailto:hello@example.com">Let's Connect ↗</a></div></header>
  <section class="profile-grid" aria-label="${escapeHTML(profile.name)}'s spaces">
   ${spaces.map(card).join('')}
   <div class="creator-stage"><button class="creator-share" data-share-profile aria-label="Share ${escapeHTML(profile.name)}'s full profile">Share<br>Story ↗</button><img class="creator-avatar" src="${escapeHTML(profile.avatar)}" alt="Portrait of ${escapeHTML(profile.name)}"><div class="creator-copy"><strong>${escapeHTML(profile.headline)}</strong><p>${escapeHTML(profile.roles)}</p></div></div>
  </section>
  <div class="profile-footer-note">SCROLL TO EXPLORE</div><div class="profile-social">— &nbsp; IG &nbsp; IN &nbsp; ◉</div>
  <nav class="profile-bottom-nav" aria-label="Profile sections"><a class="active" href="${profilePath()}" data-nav data-short="Home">⌂ &nbsp; Home</a><a href="#about" data-short="About">♙ &nbsp; About</a><button data-share-profile data-short="Share">↗ &nbsp; Share</button><a href="mailto:hello@example.com" data-short="Contact">✈ &nbsp; Contact</a></nav>
 </main>`;
}
