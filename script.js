// ---------- Esfera: presionar para mostrar la información ----------
const hero = document.getElementById('inicio');
const orb = document.getElementById('orb');

orb.addEventListener('click', () => {
  const open = hero.classList.toggle('is-open');
  orb.setAttribute('aria-expanded', open);
  orb.setAttribute('aria-label', open ? t('orbHide') : t('orbShow'));
});

// ---------- Índice ----------
const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');

function setMenu(open) {
  menuPanel.hidden = !open;
  menuBtn.setAttribute('aria-expanded', open);
}
menuBtn.addEventListener('click', () => setMenu(menuPanel.hidden));
menuPanel.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
document.addEventListener('click', (e) => { if (!e.target.closest('.menu')) setMenu(false); });

// ---------- Fondo en movimiento: las manchas siguen suavemente al cursor ----------
const field = hero.querySelector('.field');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  let tx = 0, ty = 0, x = 0, y = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
  });
  (function loop() {
    x += (tx - x) * 0.035;
    y += (ty - y) * 0.035;
    field.style.setProperty('--mx', x.toFixed(3));
    field.style.setProperty('--my', y.toFixed(3));
    requestAnimationFrame(loop);
  })();
}

// ---------- Sobre mí: la esfera de la foto aparece al llegar a la sección ----------
const about = document.getElementById('sobre-mi');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { about.classList.add('is-visible'); io.disconnect(); }
  }, { threshold: 0.15 });
  io.observe(about);
} else {
  about.classList.add('is-visible');
}

// ---------- Mi perfil: acercamiento a cada punto de la estrella ----------
const skillTitle = document.getElementById('skillTitle');
const skillText = document.getElementById('skillText');
let current = null;

function renderSkill() {
  if (current === null) {
    skillTitle.textContent = t('skillDefaultTitle');
    skillText.textContent = t('skillDefaultText');
  } else {
    skillTitle.textContent = t('skill' + current + 'Name');
    skillText.textContent = t('skill' + current + 'Text');
  }
}

function selectSkill(i) {
  current = (i === current) ? null : i;
  renderSkill();
  document.querySelectorAll('[data-skill]').forEach((el) => {
    const on = Number(el.dataset.skill) === current;
    el.classList.toggle('on', on);
    if (el.classList.contains('chip')) el.setAttribute('aria-pressed', on);
  });
}
 
document.querySelectorAll('[data-skill]').forEach((el) =>
  el.addEventListener('click', () => selectSkill(Number(el.dataset.skill))));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && current !== null) selectSkill(current); });

// El brillo de la estrella sigue al cursor
const perfil = document.getElementById('estrella');
const starView = document.getElementById('starView');
const starGlass = document.getElementById('starGlass');
if (!reduceMotion) {
  perfil.addEventListener('pointermove', (e) => {
    const r = starView.getBoundingClientRect();
    const lx = Math.min(90, Math.max(10, ((e.clientX - r.left) / r.width) * 100));
    const ly = Math.min(90, Math.max(10, ((e.clientY - r.top) / r.height) * 100));
    starGlass.style.setProperty('--lx', lx.toFixed(0) + '%');
    starGlass.style.setProperty('--ly', ly.toFixed(0) + '%');
  });
}

// ---------- Vidrio líquido: refracción real con filtros SVG (solo Chrome y Edge) ----------
// Técnica: un mapa de desplazamiento generado en canvas + feDisplacementMap aplicado con backdrop-filter.
// En Safari y Firefox queda el vidrio esmerilado definido en el CSS.
const isChromium = !!(navigator.userAgentData && navigator.userAgentData.brands.some((b) => /Chromium/.test(b.brand)));
const SVGNS = 'http://www.w3.org/2000/svg';
const glassHost = document.createElementNS(SVGNS, 'svg');
glassHost.setAttribute('width', '0');
glassHost.setAttribute('height', '0');
glassHost.style.cssText = 'position:absolute;pointer-events:none';
document.body.appendChild(glassHost);

function liquidGlass(el, { sdf, bezel, scale, res = 160, blur = 1.5 }) {
  if (!isChromium) return;
  const id = 'lg-' + Math.random().toString(36).slice(2, 8);
  const pass = (k, ch) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(scale * k).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="d${ch}"/>` +
    `<feColorMatrix in="d${ch}" type="matrix" values="${ch === 'r' ? '1 0 0 0 0' : '0 0 0 0 0'} ${ch === 'g' ? '0 1 0 0 0' : '0 0 0 0 0'} ${ch === 'b' ? '0 0 1 0 0' : '0 0 0 0 0'} 0 0 0 1 0" result="${ch}"/>`;
  glassHost.insertAdjacentHTML('beforeend',
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feImage result="map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none"/>` +
    pass(1, 'r') + pass(1.07, 'g') + pass(1.14, 'b') +
    `<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/></filter>`);
  const feImage = glassHost.querySelector(`#${id} feImage`);

  function build() {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    const k = res / Math.max(w, h);
    const cw = Math.max(2, Math.round(w * k)), ch = Math.max(2, Math.round(h * k));
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(cw, ch);
    const px = img.data, bz = bezel(w, h), e = 1 / k;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const rx = ((x + 0.5) / cw) * w, ry = ((y + 0.5) / ch) * h;
        const i = (y * cw + x) * 4;
        px[i] = px[i + 1] = px[i + 2] = 128; px[i + 3] = 255;
        const d = sdf(rx, ry, w, h);
        if (d > 0 && d < bz) {
          const gx = sdf(rx + e, ry, w, h) - sdf(rx - e, ry, w, h);
          const gy = sdf(rx, ry + e, w, h) - sdf(rx, ry - e, w, h);
          const len = Math.hypot(gx, gy) || 1;
          const m = Math.pow(1 - d / bz, 2);
          px[i] = 128 + 127 * m * (gx / len);
          px[i + 1] = 128 + 127 * m * (gy / len);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    feImage.setAttribute('href', cv.toDataURL());
    const f = `url(#${id}) blur(${blur}px) saturate(1.5) brightness(1.1)`;
    el.style.backdropFilter = f;
    el.style.webkitBackdropFilter = f;
  }
  let raf;
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(build); }).observe(el);
}


// Distancia al borde (positiva dentro) de un rectángulo con esquinas redondeadas
const roundedSdf = (r) => (x, y, w, h) => {
  const qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
  return -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r);
};

function liquidGlass(el, { sdf, bezel, scale, res = 160, blur = 1.5, sat = 1.5, bri = 1.1 }) {
  if (!isChromium) return;
  const id = 'lg-' + Math.random().toString(36).slice(2, 8);
  const pass = (k, ch) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(scale * k).toFixed(1)}" xChannelSelector="R" yChannelSelector="G" result="d${ch}"/>` +
    `<feColorMatrix in="d${ch}" type="matrix" values="${ch === 'r' ? '1 0 0 0 0' : '0 0 0 0 0'} ${ch === 'g' ? '0 1 0 0 0' : '0 0 0 0 0'} ${ch === 'b' ? '0 0 1 0 0' : '0 0 0 0 0'} 0 0 0 1 0" result="${ch}"/>`;
  glassHost.insertAdjacentHTML('beforeend',
    `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
    `<feImage result="map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none"/>` +
    pass(1, 'r') + pass(1.07, 'g') + pass(1.14, 'b') +
    `<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/></filter>`);
  const feImage = glassHost.querySelector(`#${id} feImage`);

  function build() {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) return;
    const k = res / Math.max(w, h);
    const cw = Math.max(2, Math.round(w * k)), ch = Math.max(2, Math.round(h * k));
    const cv = document.createElement('canvas');
    cv.width = cw; cv.height = ch;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(cw, ch);
    const px = img.data, bz = bezel(w, h), e = 1 / k;
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const rx = ((x + 0.5) / cw) * w, ry = ((y + 0.5) / ch) * h;
        const i = (y * cw + x) * 4;
        px[i] = px[i + 1] = px[i + 2] = 128; px[i + 3] = 255;
        const d = sdf(rx, ry, w, h);
        if (d > 0 && d < bz) {
          const gx = sdf(rx + e, ry, w, h) - sdf(rx - e, ry, w, h);
          const gy = sdf(rx, ry + e, w, h) - sdf(rx, ry - e, w, h);
          const len = Math.hypot(gx, gy) || 1;
          const m = Math.pow(1 - d / bz, 2);
          px[i] = 128 + 127 * m * (gx / len);
          px[i + 1] = 128 + 127 * m * (gy / len);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    feImage.setAttribute('href', cv.toDataURL());
    const f = `url(#${id}) blur(${blur}px) saturate(${sat}) brightness(${bri})`;
    el.style.backdropFilter = f;
    el.style.webkitBackdropFilter = f;
  }
  let raf;
  new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(build); }).observe(el);
}

// ---------- Proyectos: cada recuadro aparece al deslizar ----------
const tarjetas = document.querySelectorAll('.proyecto');
if ('IntersectionObserver' in window) {
  const ioP = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.intersectionRatio >= 0.35) en.target.classList.add('visible');
      else if (en.intersectionRatio === 0) en.target.classList.remove('visible');
    });
  }, { threshold: [0, 0.35] });
  tarjetas.forEach((t) => ioP.observe(t));
} else {
  tarjetas.forEach((t) => t.classList.add('visible'));
}

// ---------- Proyectos: vidrio con refracción ----------
document.querySelectorAll('.proyecto').forEach((el) =>
  liquidGlass(el, { sdf: roundedSdf(32), bezel: () => 42, scale: 95, res: 220, blur: 10, sat: 0.5, bri: 1.1 }));

// ---------- Vidrio de la estrella y de la tarjeta ----------
liquidGlass(starGlass, { sdf: starSdf(), bezel: (w) => w * 0.14, scale: 120, res: 160, blur: 1, sat: 3, bri: 1 });
liquidGlass(document.getElementById('skillCard'), { sdf: roundedSdf(32), bezel: () => 22, scale: 45, res: 220, blur: 3, sat: 1.3, bri: 1 });

// ---------- Intro: sin scroll mientras dura ----------
if (!reduceMotion) {
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.classList.add('intro-lock');
  setTimeout(() => document.documentElement.classList.remove('intro-lock'), 5300);
}


// ---------- Idioma ----------
const i18n = {
  es: {
    title: 'Portafolio de ciencia de datos',
    langAria: 'Cambiar idioma',
    siteName: 'Portafolio de ciencia de datos',
    menuBtn: 'Índice', menuAria: 'Índice',
    navAbout: 'Sobre mí', navProjects: 'Habilidades y proyectos', navContact: 'Contacto',
    role: 'Economista en formación',
    stack: 'Datos, econometría y análisis con SQL, Python y R.',
    orbShow: 'Mostrar mi información', orbHide: 'Ocultar mi información',
    aboutTitle: 'Sobre mí',
    aboutText: 'Estudio Economía en la Universidad Industrial de Santander y uso los datos para responder preguntas económicas con rigor y claridad. Me interesa pasar del dato crudo a una conclusión que sirva para decidir.',
    eduLabel: 'Formación', edu: 'Economía, Universidad Industrial de Santander',
    toolsLabel: 'Herramientas', tools: 'SQL, Python, R y Git',
    interestsLabel: 'Intereses', interests: 'Econometría, análisis de datos y economía aplicada',
    profileTitle: 'Mi perfil',
    skillDefaultTitle: 'Economista en formación',
    skillDefaultText: 'Convierto datos en decisiones. Elige un punto de la estrella para ver cada habilidad.',
    skill0Name: 'SQL', skill0Text: 'Consultas, limpieza de datos e indicadores de negocio.',
    skill1Name: 'Python', skill1Text: 'Análisis de datos con pandas y visualización de resultados.',
    skill2Name: 'R', skill2Text: 'Modelos estadísticos y análisis econométrico.',
    skill3Name: 'Econometría', skill3Text: 'Regresión, datos de panel y pruebas de hipótesis.',
    skill4Name: 'Git', skill4Text: 'Control de versiones y proyectos publicados en GitHub.',
    projectsTitle: 'Proyectos',
    cv: 'Descargar CV',
  },
  en: {
    title: 'Data science portfolio',
    langAria: 'Change language',
    siteName: 'Data science portfolio',
    menuBtn: 'Menu', menuAria: 'Menu',
    navAbout: 'About me', navProjects: 'Skills and projects', navContact: 'Contact',
    role: 'Economist in training',
    stack: 'Data, econometrics and analysis with SQL, Python and R.',
    orbShow: 'Show my information', orbHide: 'Hide my information',
    aboutTitle: 'About me',
    aboutText: "I study Economics at Universidad Industrial de Santander and use data to answer economic questions with rigor and clarity. I'm interested in going from raw data to a conclusion that helps make decisions.",
    eduLabel: 'Education', edu: 'Economics, Universidad Industrial de Santander',
    toolsLabel: 'Tools', tools: 'SQL, Python, R and Git',
    interestsLabel: 'Interests', interests: 'Econometrics, data analysis and applied economics',
    profileTitle: 'My profile',
    skillDefaultTitle: 'Economist in training',
    skillDefaultText: 'I turn data into decisions. Pick a point on the star to see each skill.',
    skill0Name: 'SQL', skill0Text: 'Queries, data cleaning and business metrics.',
    skill1Name: 'Python', skill1Text: 'Data analysis with pandas and results visualization.',
    skill2Name: 'R', skill2Text: 'Statistical models and econometric analysis.',
    skill3Name: 'Econometrics', skill3Text: 'Regression, panel data and hypothesis testing.',
    skill4Name: 'Git', skill4Text: 'Version control and projects published on GitHub.',
    projectsTitle: 'Projects',
    cv: 'Download CV',
  },
};

let lang = localStorage.getItem('lang') || 'es';
function t(key) { return i18n[lang][key]; }

const langBtn = document.getElementById('langBtn');
const cvLink = document.getElementById('cvLink');

function applyLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l;
  document.title = t('title');
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  orb.setAttribute('aria-label', hero.classList.contains('is-open') ? t('orbHide') : t('orbShow'));
  langBtn.textContent = l === 'es' ? 'EN' : 'ES';
  cvLink.href = l === 'es' ? './CV.pdf' : './CV-en.pdf';
  renderSkill();
}

langBtn.addEventListener('click', () => applyLang(lang === 'es' ? 'en' : 'es'));
applyLang(lang);
