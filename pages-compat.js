(function(){
  const isPages = location.hostname.endsWith('github.io');
  if(!isPages) return;

  const first = location.pathname.split('/').filter(Boolean)[0] || 'cx';
  const base = `/${first}`;
  const routeHref = (path='/') => `${base}/#${path.startsWith('/') ? path : `/${path}`}`;
  const routeFromLocation = () => {
    const hash = location.hash.replace(/^#/, '');
    return hash || '/';
  };

  // GitHub Pages is static, so use browser storage instead of the server API.
  loadProfile = async function(username='alex'){
    serverAvailable = false;
    try{
      const saved = localStorage.getItem(`zat:${username}`);
      profile = saved ? JSON.parse(saved) : clone(defaults);
    }catch{
      profile = clone(defaults);
    }
  };

  parseRoute = function(){
    const parts = routeFromLocation().split('/').filter(Boolean).map(decodeURIComponent);
    if(!parts.length) return {page:'home'};
    if(parts[0] === 'studio') return {page:'studio'};
    if(parts[0] === 'pricing') return {page:'pricing'};
    return {page:'profile', username:parts[0] || 'alex', spaceSlug:parts[1] || null};
  };

  go = function(path){
    const clean = (path || '/').replace(/^#/, '');
    history.pushState({}, '', routeHref(clean));
    render();
    window.scrollTo({top:0, behavior:'instant'});
  };

  navLink = function(label,path,cls=''){
    return `<a href="${routeHref(path)}" class="${cls}" data-nav>${label}</a>`;
  };

  brand = function(){
    return `<a class="zat-wordmark" href="${routeHref('/')}" data-nav aria-label="Zat home">Zat<span class="zat-dot"></span></a>`;
  };

  profilePath = function(space){
    const route = `/${encodeURIComponent(profile.username || 'alex')}${space ? `/${slugify(space.title)}` : ''}`;
    return routeHref(route);
  };

  absoluteShareUrl = function(space){
    return `${location.origin}${profilePath(space)}`;
  };

  // Server analytics are intentionally disabled on the static Pages build.
  track = async function(){};

  // Catch all app-navigation links, including hard-coded /studio and /alex links.
  document.addEventListener('click', function(e){
    const a = e.target.closest && e.target.closest('a[data-nav]');
    if(!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const raw = a.getAttribute('href') || '/';
    if(raw.startsWith('mailto:') || raw.startsWith('http://') || raw.startsWith('https://')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    let route = raw;
    if(raw.includes('#/')) route = raw.slice(raw.indexOf('#') + 1);
    else if(raw.startsWith(base + '/')) route = raw.slice(base.length);
    go(route || '/');
  }, true);

  // Normalize the root URL once so refresh/back navigation stays inside the project path.
  if(!location.hash) history.replaceState({}, '', routeHref('/'));
})();