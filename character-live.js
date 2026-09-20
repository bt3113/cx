const STORAGE_KEY = 'zat:character:alexden';
const DEFAULT_CONFIG = {
  version: 1,
  body: 'regular',
  face: 'angular',
  skinTone: 'honey',
  eyeColor: 'brown',
  brow: 'defined',
  hair: 'sidepart',
  hairColor: 'espresso',
  facialHair: 'none',
  top: 'knit',
  topColor: '#7a2535',
  bottom: 'tailored',
  bottomColor: '#202228',
  shoes: 'sneaker',
  shoeColor: '#eeeae2',
  accessory: 'watch',
  pose: 'editorial',
};

const OPTIONS = {
  body: [['slim','Slim'],['regular','Regular'],['athletic','Athletic'],['curvy','Curvy']],
  face: [['oval','Oval'],['angular','Angular'],['soft','Soft'],['heart','Heart'],['round','Round']],
  skinTone: [['porcelain','Porcelain'],['ivory','Ivory'],['sand','Sand'],['honey','Honey'],['caramel','Caramel'],['amber','Amber'],['bronze','Bronze'],['umber','Umber'],['espresso','Espresso'],['ebony','Ebony']],
  eyeColor: [['brown','Brown'],['hazel','Hazel'],['green','Green'],['blue','Blue'],['gray','Gray']],
  brow: [['natural','Natural'],['defined','Defined'],['soft','Soft']],
  hair: [['crop','Crop'],['sidepart','Side part'],['waves','Waves'],['bob','Bob'],['bun','Bun']],
  hairColor: [['black','Black'],['espresso','Espresso'],['brown','Brown'],['auburn','Auburn'],['blonde','Blonde'],['silver','Silver']],
  facialHair: [['none','None'],['stubble','Stubble'],['short','Short beard']],
  top: [['fitted-tee','Fitted T-shirt'],['relaxed-tee','Relaxed T-shirt'],['shirt','Shirt'],['knit','Knit sweater'],['hoodie','Hoodie']],
  bottom: [['tailored','Tailored trousers'],['casual','Casual trousers'],['skirt','Skirt']],
  shoes: [['sneaker','Clean sneakers'],['loafer','Loafers'],['boot','Boots']],
  accessory: [['none','None'],['glasses','Glasses'],['watch','Watch'],['necklace','Necklace']],
  pose: [['neutral','Neutral'],['editorial','Editorial'],['relaxed','Relaxed']],
};

function readConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new CustomEvent('zat:character-updated', { detail: config }));
}

async function getEngine() {
  const url = new URL('./character-engine.js', import.meta.url);
  return import(url.href);
}

function weakDevice() {
  const nav = navigator;
  return Boolean(nav.connection?.saveData || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2));
}

async function enhanceProfile() {
  if (weakDevice()) return;
  if (!location.pathname.includes('/alexden')) return;
  const images = [...document.querySelectorAll('img[src*="media/portrait/alex-den"]')];
  if (!images.length) return;
  const { mountCharacter } = await getEngine();
  const config = readConfig();

  for (const img of images) {
    const picture = img.closest('picture');
    const host = picture?.parentElement;
    if (!picture || !host || host.dataset.zatCharacterHost) continue;
    host.dataset.zatCharacterHost = 'true';
    host.style.overflow = 'visible';
    picture.style.transition = 'opacity .45s ease';

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      opacity: '0', transition: 'opacity .45s ease', pointerEvents: 'none',
      transform: 'scale(1.08)', transformOrigin: '50% 58%'
    });
    host.appendChild(canvas);

    try {
      const engine = await mountCharacter(canvas, config, {
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        mobile: matchMedia('(max-width: 767px)').matches,
      });
      host._zatCharacterEngine = engine;
      requestAnimationFrame(() => {
        canvas.style.opacity = '1';
        picture.style.opacity = '0';
      });
    } catch (error) {
      console.warn('[Zat] Character WebGL unavailable; portrait fallback kept.', error);
      canvas.remove();
      host.dataset.zatCharacterHost = 'fallback';
    }
  }

  if (!document.querySelector('[data-zat-edit-character]')) {
    const a = document.createElement('a');
    a.href = new URL('./character.html', import.meta.url).href;
    a.dataset.zatEditCharacter = 'true';
    a.textContent = 'Edit character';
    Object.assign(a.style, {
      position: 'fixed', right: '18px', bottom: '18px', zIndex: '9999',
      padding: '11px 15px', borderRadius: '999px', border: '1px solid rgba(255,255,255,.18)',
      background: 'rgba(10,10,12,.82)', backdropFilter: 'blur(18px)', color: '#faf8f5',
      font: '500 12px Inter, system-ui, sans-serif', textDecoration: 'none', letterSpacing: '.02em',
      boxShadow: '0 10px 30px rgba(0,0,0,.28)'
    });
    document.body.appendChild(a);
  }
}

function field(label, key, config, onChange) {
  const wrap = document.createElement('label');
  wrap.className = 'zat-field';
  const span = document.createElement('span');
  span.textContent = label;
  const select = document.createElement('select');
  for (const [value, text] of OPTIONS[key]) {
    const option = document.createElement('option');
    option.value = value; option.textContent = text; option.selected = config[key] === value;
    select.appendChild(option);
  }
  select.addEventListener('change', () => onChange(key, select.value));
  wrap.append(span, select);
  return wrap;
}

async function initStudio() {
  const mount = document.querySelector('[data-zat-character-studio]');
  if (!mount) return false;
  let config = readConfig();
  const canvas = mount.querySelector('canvas');
  const status = mount.querySelector('[data-status]');
  const controls = mount.querySelector('[data-controls]');
  const { mountCharacter } = await getEngine();
  let engine;

  try {
    engine = await mountCharacter(canvas, config, {
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      mobile: matchMedia('(max-width: 767px)').matches,
    });
    status.textContent = 'Live 3D · saved locally on this device';
  } catch (error) {
    status.textContent = 'WebGL unavailable on this device. Your configuration can still be saved.';
    console.warn(error);
  }

  const labels = {
    body:'Body', face:'Face', skinTone:'Skin tone', eyeColor:'Eyes', brow:'Eyebrows', hair:'Hair',
    hairColor:'Hair colour', facialHair:'Facial hair', top:'Top', bottom:'Bottom', shoes:'Shoes',
    accessory:'Accessory', pose:'Pose'
  };
  const update = (key, value) => {
    config = { ...config, [key]: value };
    engine?.update(config);
  };
  for (const key of Object.keys(labels)) controls.appendChild(field(labels[key], key, config, update));

  for (const [key, label] of [['topColor','Top colour'],['bottomColor','Bottom colour'],['shoeColor','Shoe colour']]) {
    const wrap = document.createElement('label'); wrap.className = 'zat-field';
    const span = document.createElement('span'); span.textContent = label;
    const input = document.createElement('input'); input.type = 'color'; input.value = config[key];
    input.addEventListener('input', () => update(key, input.value));
    wrap.append(span, input); controls.appendChild(wrap);
  }

  mount.querySelector('[data-save]').addEventListener('click', () => {
    saveConfig(config); status.textContent = 'Saved. Alex now uses this character on this device.';
  });
  mount.querySelector('[data-reset]').addEventListener('click', () => {
    config = { ...DEFAULT_CONFIG }; saveConfig(config); location.reload();
  });
  mount.querySelector('[data-png]').addEventListener('click', () => {
    if (!engine) return;
    const a = document.createElement('a'); a.href = engine.capture(); a.download = 'zat-alex-character.png'; a.click();
  });
  mount.querySelector('[data-json]').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'zat-character.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  return true;
}

const isStudio = await initStudio();
if (!isStudio) {
  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(() => enhanceProfile().catch(console.warn), 60);
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('popstate', schedule);
  schedule();
}
