// ---------- Esfera: presionar para mostrar la información ----------
const hero = document.getElementById('inicio');
const orb = document.getElementById('orb');

orb.addEventListener('click', () => {
  const open = hero.classList.toggle('is-open');
  orb.setAttribute('aria-expanded', open);
  orb.setAttribute('aria-label', open ? 'Ocultar mi información' : 'Mostrar mi información');
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
    x += (tx - x) * 0.05;
    y += (ty - y) * 0.05;
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
const skills = [
  { n: 'SQL', t: 'Consultas, limpieza de datos e indicadores de negocio.' },
  { n: 'Python', t: 'Análisis de datos con pandas y visualización de resultados.' },
  { n: 'R', t: 'Modelos estadísticos y análisis econométrico.' },
  { n: 'Econometría', t: 'Regresión, datos de panel y pruebas de hipótesis.' },
  { n: 'Git', t: 'Control de versiones y proyectos publicados en GitHub.' },
];

const skillTitle = document.getElementById('skillTitle');
const skillText = document.getElementById('skillText');
const defaults = { n: skillTitle.textContent, t: skillText.textContent };
let current = null;

function selectSkill(i) {
  current = (i === current) ? null : i;
  const info = current === null ? defaults : skills[current];
  skillTitle.textContent = info.n;
  skillText.textContent = info.t;
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

// Distancia al borde (positiva dentro) de la estrella, a partir de su contorno real
function starSdf() {
  const p = document.createElementNS(SVGNS, 'path');
  p.setAttribute('d', document.getElementById('starPath').getAttribute('d'));
  glassHost.appendChild(p);
  const n = 240, len = p.getTotalLength(), pts = [];
  for (let i = 0; i < n; i++) { const q = p.getPointAtLength((len * i) / n); pts.push([q.x, q.y]); }
  glassHost.removeChild(p);
  return (x, y, w, h) => {
    const X = (x / w) * 100, Y = (y / h) * 100;
    let best = 1e9, inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [ax, ay] = pts[j], [bx, by] = pts[i];
      if ((ay > Y) !== (by > Y) && X < ((bx - ax) * (Y - ay)) / (by - ay) + ax) inside = !inside;
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((X - ax) * dx + (Y - ay) * dy) / (dx * dx + dy * dy || 1)));
      const ex = ax + t * dx - X, ey = ay + t * dy - Y;
      const dd = ex * ex + ey * ey;
      if (dd < best) best = dd;
    }
    return (inside ? 1 : -1) * Math.sqrt(best) * (w / 100);
  };
}

// Distancia al borde (positiva dentro) de un rectángulo con esquinas redondeadas
const roundedSdf = (r) => (x, y, w, h) => {
  const qx = Math.abs(x - w / 2) - (w / 2 - r), qy = Math.abs(y - h / 2) - (h / 2 - r);
  return -(Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r);
};

liquidGlass(starGlass, { sdf: starSdf(), bezel: (w) => w * 0.14, scale: 120, res: 160, blur: 1 });
liquidGlass(document.getElementById('skillCard'), { sdf: roundedSdf(32), bezel: () => 34, scale: 70, res: 220, blur: 5 });
