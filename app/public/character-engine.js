const THREE_VERSION = '0.180.0';
const THREE_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/build/three.module.js`;
const GLTF_URL = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/examples/jsm/loaders/GLTFLoader.js`;
let threePromise;
let gltfPromise;

const SKIN = {
  porcelain: '#f2d7c4', ivory: '#e9c8ae', sand: '#d8ad8b', honey: '#c9936e',
  caramel: '#ae7656', amber: '#925c43', bronze: '#744733', umber: '#573526',
  espresso: '#3b241b', ebony: '#261712',
};
const EYES = { brown: '#3a251d', hazel: '#6d5b35', green: '#45644e', blue: '#47647a', gray: '#697075' };
const HAIR = { black: '#151313', espresso: '#2a1b17', brown: '#4b3026', auburn: '#66372b', blonde: '#b99663', silver: '#8d8d8b' };
const BODIES = {
  slim: { shoulder: .88, torso: .86, hip: .86, limb: .86, height: 1.01 },
  regular: { shoulder: 1, torso: 1, hip: 1, limb: 1, height: 1 },
  athletic: { shoulder: 1.12, torso: 1.04, hip: .98, limb: 1.08, height: 1.015 },
  curvy: { shoulder: 1.02, torso: 1.05, hip: 1.16, limb: 1.04, height: .995 },
};
const FACE = {
  oval: [1, 1.08, .96], angular: [1.02, 1.03, .94], soft: [1.04, 1.05, 1],
  heart: [1, 1.06, .93], round: [1.06, 1.01, 1],
};
const POSES = {
  neutral: { lArm: .08, rArm: -.08, lFore: .03, rFore: -.03, hip: 0, head: 0 },
  editorial: { lArm: .14, rArm: -.28, lFore: -.16, rFore: -.52, hip: -.035, head: .025 },
  relaxed: { lArm: .26, rArm: -.18, lFore: -.36, rFore: .18, hip: .035, head: -.018 },
};

function loadThree() { return threePromise || (threePromise = import(THREE_URL)); }
function loadGLTF() { return gltfPromise || (gltfPromise = import(GLTF_URL)); }
function hex(v, fallback) { return /^#[0-9a-f]{6}$/i.test(v || '') ? v : fallback; }
function disposeObject(root) {
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose?.();
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => m.dispose?.());
    }
  });
}
function mat(THREE, color, rough = .72, metal = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}
function addMesh(THREE, parent, geometry, material, pos, scale = [1,1,1], rot = [0,0,0], name = '') {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot); m.name = name;
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function capsule(THREE, parent, radius, length, material, pos, scale = [1,1,1], rot = [0,0,0], name='') {
  return addMesh(THREE, parent, new THREE.CapsuleGeometry(radius, length, 6, 14), material, pos, scale, rot, name);
}
function sphere(THREE, parent, radius, material, pos, scale = [1,1,1], name='') {
  return addMesh(THREE, parent, new THREE.SphereGeometry(radius, 20, 16), material, pos, scale, [0,0,0], name);
}
function cylinder(THREE, parent, rt, rb, h, material, pos, scale=[1,1,1], rot=[0,0,0], name='') {
  return addMesh(THREE, parent, new THREE.CylinderGeometry(rt, rb, h, 20, 1, false), material, pos, scale, rot, name);
}
function box(THREE, parent, dims, material, pos, rot=[0,0,0], name='') {
  return addMesh(THREE, parent, new THREE.BoxGeometry(...dims), material, pos, [1,1,1], rot, name);
}
function torus(THREE, parent, radius, tube, material, pos, scale=[1,1,1], rot=[0,0,0], name='') {
  return addMesh(THREE, parent, new THREE.TorusGeometry(radius, tube, 8, 24), material, pos, scale, rot, name);
}

function buildHair(THREE, root, cfg, y, hairMat) {
  const group = new THREE.Group(); group.name = 'hair'; root.add(group);
  const style = cfg.hair || 'sidepart';
  if (style === 'crop') {
    sphere(THREE, group, .31, hairMat, [0, y + .17, -.025], [1.01,.62,1.02]);
  } else if (style === 'sidepart') {
    sphere(THREE, group, .315, hairMat, [0, y + .17, -.035], [1.03,.65,1.04]);
    sphere(THREE, group, .12, hairMat, [-.18, y + .29, .02], [1.5,.8,.9]);
  } else if (style === 'waves') {
    sphere(THREE, group, .30, hairMat, [0, y + .16, -.04], [1.02,.62,1.02]);
    [[-.19,.31],[0,.35],[.18,.30],[-.08,.40],[.10,.39]].forEach(([x,yy]) => sphere(THREE, group, .105, hairMat, [x,y+yy,.04],[1.1,.75,1]));
  } else if (style === 'bob') {
    sphere(THREE, group, .31, hairMat, [0, y + .15, -.04], [1.04,.66,1.03]);
    capsule(THREE, group, .11, .42, hairMat, [-.25,y-.02,-.02],[.85,1,1]);
    capsule(THREE, group, .11, .42, hairMat, [.25,y-.02,-.02],[.85,1,1]);
  } else if (style === 'bun') {
    sphere(THREE, group, .30, hairMat, [0, y + .14, -.04], [1.02,.61,1.02]);
    sphere(THREE, group, .145, hairMat, [0,y+.43,-.08],[1,1,1]);
  }
  if (style !== 'bob') {
    box(THREE, group, [.055,.16,.04], hairMat, [-.265,y+.03,.03],[0,0,.05]);
    box(THREE, group, [.055,.16,.04], hairMat, [.265,y+.03,.03],[0,0,-.05]);
  }
}

function buildCharacter(THREE, sceneRoot, cfg) {
  while (sceneRoot.children.length) { const c = sceneRoot.children.pop(); if (c) disposeObject(c); }
  const body = BODIES[cfg.body] || BODIES.regular;
  const face = FACE[cfg.face] || FACE.oval;
  const pose = POSES[cfg.pose] || POSES.editorial;
  const skinMat = mat(THREE, SKIN[cfg.skinTone] || SKIN.honey, .76, 0);
  const hairMat = mat(THREE, HAIR[cfg.hairColor] || HAIR.espresso, .82, 0);
  const topMat = mat(THREE, hex(cfg.topColor, '#7a2535'), cfg.top === 'knit' ? .92 : .74, 0);
  const bottomMat = mat(THREE, hex(cfg.bottomColor, '#1e2126'), .82, 0);
  const shoeMat = mat(THREE, hex(cfg.shoeColor, '#eeeae2'), .58, .02);
  const eyeMat = mat(THREE, EYES[cfg.eyeColor] || EYES.brown, .4, 0);
  const whiteMat = mat(THREE, '#f6f2ea', .62, 0);
  const darkMat = mat(THREE, '#171719', .56, .04);
  const metalMat = mat(THREE, '#9f9184', .34, .55);

  const person = new THREE.Group(); person.name = 'zat-character'; person.scale.y = body.height; sceneRoot.add(person);
  const torsoY = 2.55, headY = 3.55;

  // Geometry hidden by clothes is not generated, mirroring CharacterStudio's
  // face-culling principle without requiring a heavy skinned base mesh in V1.
  const legSpread = .22 * body.hip;
  const legRadius = cfg.bottom === 'casual' ? .17 : .145;
  const upperLegMaterial = cfg.bottom === 'skirt' ? skinMat : bottomMat;
  const upperStart = cfg.bottom === 'skirt' ? .96 : 1.36;
  capsule(THREE, person, legRadius, upperStart, upperLegMaterial, [-legSpread, .88, 0], [body.limb,1,body.limb], [0,0,.012], 'left-leg');
  capsule(THREE, person, legRadius, upperStart, upperLegMaterial, [legSpread, .88, 0], [body.limb,1,body.limb], [0,0,-.012], 'right-leg');
  if (cfg.bottom === 'skirt') {
    cylinder(THREE, person, .39*body.hip, .55*body.hip, .82, bottomMat, [0,1.62,0], [1,1,1], [0,0,0], 'skirt');
  } else {
    cylinder(THREE, person, .42*body.hip, .34*body.hip, .62, bottomMat, [0,1.62,0], [1,1,1], [0,0,0], 'waist');
  }

  const shoeScale = cfg.shoes === 'boot' ? [1,.82,1.2] : cfg.shoes === 'loafer' ? [1,.55,1.15] : [1,.62,1.28];
  [-legSpread, legSpread].forEach((x, i) => {
    capsule(THREE, person, .15, .18, shoeMat, [x, .16, .12], shoeScale, [Math.PI/2,0,0], i ? 'right-shoe' : 'left-shoe');
    if (cfg.shoes === 'sneaker') box(THREE, person,[.31,.055,.55],whiteMat,[x,.06,.12],[0,0,0],'sole');
  });

  const torsoTop = .46 * body.shoulder;
  const torsoBottom = .34 * body.torso;
  cylinder(THREE, person, torsoTop, torsoBottom, 1.12, topMat, [0,torsoY,0], [1,1,1], [0,0,0], 'top');
  if (cfg.top === 'hoodie') torus(THREE, person,.31,.095,topMat,[0,3.05,-.12],[1,1,.75],[Math.PI/2,0,0],'hood');
  if (cfg.top === 'shirt') {
    box(THREE, person,[.035,.78,.025],whiteMat,[0,2.58,.47],[0,0,0],'placket');
    const collar = new THREE.ConeGeometry(.13,.24,3);
    addMesh(THREE,person,collar,whiteMat,[-.10,3.06,.43],[1,.72,1],[0,0,.28],'collar-l');
    addMesh(THREE,person,collar.clone(),whiteMat,[.10,3.06,.43],[1,.72,1],[0,0,-.28],'collar-r');
  }
  if (cfg.top === 'knit') box(THREE, person,[.32,.16,.08],whiteMat,[0,3.08,.36],[0,0,Math.PI/4],'shirt-collar');

  const shoulderY = 2.92, shoulderX = .53 * body.shoulder;
  const longSleeve = cfg.top === 'knit' || cfg.top === 'hoodie' || cfg.top === 'shirt';
  const refs = { eyes: [], chest: null };
  function arm(side) {
    const s = side === 'left' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(s*shoulderX,shoulderY,0);
    shoulder.rotation.z = s*(side==='left'?pose.lArm:pose.rArm);
    person.add(shoulder);
    capsule(THREE, shoulder,.115,.48,longSleeve ? topMat : skinMat,[0,-.34,0],[body.limb,1,body.limb]);
    const elbow = new THREE.Group();
    elbow.position.set(0,-.72,0);
    elbow.rotation.z = s*(side==='left'?pose.lFore:pose.rFore);
    shoulder.add(elbow);
    capsule(THREE, elbow,.105,.43,longSleeve ? topMat : skinMat,[0,-.31,0],[body.limb,1,body.limb]);
    sphere(THREE, elbow,.115,skinMat,[0,-.66,0],[.88,1.15,.72], side+'-hand');
  }
  arm('left'); arm('right');

  cylinder(THREE, person,.115,.13,.28,skinMat,[0,3.16,0]);
  const head = sphere(THREE, person,.32,skinMat,[0,headY,0],[face[0],face[1],face[2]],'head');
  head.rotation.z = pose.head;
  sphere(THREE, person,.075,skinMat,[-.31,headY,0],[.55,1,.45],'left-ear');
  sphere(THREE, person,.075,skinMat,[.31,headY,0],[.55,1,.45],'right-ear');
  sphere(THREE, person,.055,skinMat,[0,headY-.015,.305],[.62,1,.9],'nose');
  box(THREE,person,[.14,.018,.018],mat(THREE,'#8e5146',.8,0),[0,headY-.16,.305],[0,0,0],'mouth');
  const eyeY = headY+.055, eyeX=.112;
  [-eyeX,eyeX].forEach((x,i)=>{
    sphere(THREE,person,.043,whiteMat,[x,eyeY,.292],[1,.72,.42]);
    const pupil=sphere(THREE,person,.021,eyeMat,[x,eyeY,.326],[1,1,.35],i?'right-eye':'left-eye'); refs.eyes.push(pupil);
    const browScale = cfg.brow==='defined' ? [1.25,.75,1] : cfg.brow==='soft' ? [.95,.55,1] : [1,.65,1];
    box(THREE,person,[.115,.018,.024],hairMat,[x,eyeY+.10,.308],[0,0,i?.08:-.08],i?'right-brow':'left-brow').scale.set(...browScale);
  });
  buildHair(THREE,person,cfg,headY,hairMat);

  if (cfg.facialHair && cfg.facialHair !== 'none') {
    const beard = sphere(THREE,person,.235,hairMat,[0,headY-.12,.06],[.94,cfg.facialHair==='stubble'?.58:.78,.94],'facial-hair');
    beard.material.transparent = true; beard.material.opacity = cfg.facialHair==='stubble' ? .55 : .9;
  }
  if (cfg.accessory === 'glasses') {
    [-.115,.115].forEach((x)=>torus(THREE,person,.085,.012,darkMat,[x,eyeY,.345],[1,.72,1],[0,0,0],'glasses'));
    box(THREE,person,[.08,.012,.012],darkMat,[0,eyeY,.345]);
  } else if (cfg.accessory === 'watch') {
    torus(THREE,person,.105,.025,metalMat,[.57,2.05,0],[.65,1,1],[Math.PI/2,0,0],'watch');
  } else if (cfg.accessory === 'necklace') {
    torus(THREE,person,.19,.012,metalMat,[0,3.12,.12],[1,1,.55],[Math.PI/2,0,0],'necklace');
  }

  person.position.x = pose.hip;
  refs.chest = person.getObjectByName('top');
  return refs;
}

export async function loadLicensedModel(url) {
  const [THREE, { GLTFLoader }] = await Promise.all([loadThree(), loadGLTF()]);
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  // VRM is glTF-based. Verified .vrm files can already be displayed as scenes;
  // humanoid retargeting can be added later without changing CharacterConfig.
  return { THREE, scene: gltf.scene, animations: gltf.animations || [] };
}

export async function mountCharacter(canvas, initialConfig, options = {}) {
  const THREE = await loadThree();
  if (!canvas || !canvas.getContext) throw new Error('Character canvas unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(27, 1, .1, 100);
  camera.position.set(0, 1.85, 8.0); camera.lookAt(0, 1.9, 0);
  const root = new THREE.Group(); root.position.y = -.2; scene.add(root);

  scene.add(new THREE.HemisphereLight(0xf5eee6, 0x272129, 1.7));
  const key = new THREE.DirectionalLight(0xffeadf, 3.2); key.position.set(-3.2,5.4,4.5); key.castShadow = true; scene.add(key);
  const fill = new THREE.DirectionalLight(0xc7d5e8, 1.25); fill.position.set(3.4,2.6,4); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffb9a0, 2.0); rim.position.set(2.2,3.8,-4.2); scene.add(rim);
  const groundMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .24, depthWrite: false });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(1.28, 48), groundMat); ground.rotation.x = -Math.PI/2; ground.scale.y=.34; ground.position.y=-.03; scene.add(ground);

  let refs = buildCharacter(THREE, root, initialConfig);
  let disposed = false, frame = 0, start = performance.now();
  const reduced = !!options.reducedMotion;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width)); const h = Math.max(1, Math.floor(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, options.mobile ? 1.35 : 1.6);
    renderer.setPixelRatio(dpr); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize();

  function animate(now) {
    if (disposed) return;
    const t = (now-start)/1000;
    if (!reduced) {
      if (refs.chest) refs.chest.scale.y = 1 + Math.sin(t*1.45)*.008;
      root.rotation.y = Math.sin(t*.42)*.012;
      root.rotation.z = Math.sin(t*.31)*.004;
      const phase = t % 4.8; const blink = phase > 4.58 ? Math.max(.07, Math.abs((phase-4.69)/.11)) : 1;
      refs.eyes.forEach((e)=>{ e.scale.y = Math.min(1,blink); });
      const entrance = Math.min(1,(now-start)/700); const eased = 1-Math.pow(1-entrance,3); root.position.y = -.26 + .06*eased; root.scale.setScalar(.985+.015*eased);
    }
    renderer.render(scene,camera); frame=requestAnimationFrame(animate);
  }
  frame=requestAnimationFrame(animate);

  return {
    update(next) { refs=buildCharacter(THREE,root,next); },
    capture(type='image/png', quality=.94) { renderer.render(scene,camera); return canvas.toDataURL(type,quality); },
    dispose() { disposed=true; cancelAnimationFrame(frame); ro.disconnect(); disposeObject(root); ground.geometry.dispose(); groundMat.dispose(); renderer.dispose(); },
  };
}
