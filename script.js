// =====================================================
// script.js completo
// =====================================================

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Traducción segura (idioma.js la define)
const tt = (k, d) => (typeof t === 'function' ? t(k) : d);

// ---------- Pantalla de carga: espera a que todo esté listo y luego inicia la intro ----------
history.scrollRestoration = 'manual';
window.scrollTo({ top: 0, behavior: 'instant' });

(function () {
  const cargador = document.getElementById('cargador');
  const barra = document.getElementById('cargaBarra');
  const num = document.getElementById('cargaNum');

  // Sin animaciones o sin pantalla de carga: todo se muestra directamente
  if (reduceMotion || !cargador) {
    root.classList.remove('loading', 'intro-lock');
    if (cargador) cargador.classList.add('listo');
    return;
  }

  function terminar() {
    root.classList.remove('loading');                 // la intro arranca desde el principio
    cargador.classList.add('listo');                  // la pantalla de carga se desvanece
    setTimeout(() => cargador.remove(), 900);
    setTimeout(() => root.classList.remove('intro-lock'), 5300);   // el scroll se libera al acabar la intro
  }

  // Qué hay que esperar
  const fondo = getComputedStyle(document.querySelector('.about-background')).backgroundImage;
  const urlFoto = (fondo.match(/url\(["']?(.*?)["']?\)/) || [])[1];

  const tareas = [
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((r) => window.addEventListener('load', r, { once: true })),
    document.fonts.ready,
    Promise.allSettled([
      '300 1em "Neue Montreal"',
      '500 1em "Neue Montreal"',
      '600 1em "Neue Montreal"',
      '700 1em "Neue Montreal"',
      '1em "Neue Montreal Italic"',
    ].map((f) => document.fonts.load(f))),
  ];
  if (urlFoto) {
    tareas.push(new Promise((r) => {
      const img = new Image();
      img.onload = img.onerror = r;
      img.src = urlFoto;
    }));
  }

  let hechas = 0;
  tareas.forEach((p) => Promise.resolve(p).catch(() => {}).then(() => { hechas++; }));

  const inicio = performance.now();
  let mostrado = 0;

  (function ciclo(ahora) {
    const objetivo = hechas / tareas.length;
    mostrado += (objetivo - mostrado) * 0.08;

    const listo = hechas === tareas.length && mostrado > 0.985 && ahora - inicio > 900;
    const vencido = ahora - inicio > 9000;               // nunca se queda trabado

    const t = (listo || vencido) ? 1 : Math.min(1, mostrado);
    barra.style.setProperty('--c', t.toFixed(3));
    num.textContent = Math.round(t * 100);

    if (listo || vencido) { terminar(); return; }
    requestAnimationFrame(ciclo);
  })(performance.now());
})();


// ---------- Esfera: presionar para mostrar la información ----------
const hero = document.getElementById('inicio');
const orb = document.getElementById('orb');

orb.addEventListener('click', () => {
  const open = hero.classList.toggle('is-open');
  orb.setAttribute('aria-expanded', open);
  orb.setAttribute('aria-label', open ? tt('orbHide', 'Ocultar mi información') : tt('orbShow', 'Mostrar mi información'));
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

// ---------- Portada: las manchas siguen suavemente al cursor ----------
const field = hero.querySelector('.field');

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

// ---------- Portada: de lejos rojo, de cerca azul ----------
if (!reduceMotion) {
  // Crea la gemela azul de cada mancha si no está en el HTML
  [1, 2, 3, 4].forEach((k) => {
    if (field.querySelector('.b' + k + '.azul')) return;
    const rojo = field.querySelector('.b' + k);
    if (!rojo) return;
    const azul = rojo.cloneNode(false);
    azul.classList.add('azul');
    rojo.after(azul);
  });

  const grupos = [1, 2, 3, 4].map((k) => [...field.querySelectorAll('.b' + k)]);
  const near = grupos.map(() => 0);
  let px = -1e5, py = -1e5;

  window.addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; });
  document.documentElement.addEventListener('mouseleave', () => { px = -1e5; py = -1e5; });

  (function colorLoop() {
    const r = hero.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) {
      const radio = Math.hypot(r.width, r.height) * 0.4;
      grupos.forEach((els, i) => {
        const b = els[0].getBoundingClientRect();
        const d = Math.hypot(px - (b.left + b.width / 2), py - (b.top + b.height / 2));
        let s = Math.max(0, Math.min(1, 1 - d / radio));
        s = s * s * (3 - 2 * s);
        if (Math.abs(s - near[i]) < 0.002) return;
        near[i] += (s - near[i]) * 0.06;
        els.forEach((el) => el.style.setProperty('--near', near[i].toFixed(3)));
      });
    }
    requestAnimationFrame(colorLoop);
  })();
}

// ---------- Transiciones: Sobre mí (al deslizar) y estrella (parpadeo) ----------
(function () {
  if (reduceMotion) return;

  const clamp = (v) => Math.max(0, Math.min(1, v));

  // Sobre mí: textos que se revelan según suben por la pantalla
  const textos = [...document.querySelectorAll('.about-title, .resume p, .resume dl > div')];
  textos.forEach((el) => el.setAttribute('data-sr', ''));

  const sobreMi = document.querySelector('.about');

  function update() {
    const H = window.innerHeight;

    textos.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      el.style.setProperty('--p', clamp((H - top) / (H * 0.3)).toFixed(3));
    });

    // La imagen baja desde arriba mientras la sección sube
    if (sobreMi) {
      sobreMi.style.setProperty('--p', clamp((H - sobreMi.getBoundingClientRect().top) / (H * 0.7)).toFixed(3));
    }
  }

  let esperando = false;
  const pedir = () => {
    if (esperando) return;
    esperando = true;
    requestAnimationFrame(() => { esperando = false; update(); });
  };

  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  window.addEventListener('load', pedir);
  document.addEventListener('langchange', pedir);

  // Estrella: el parpadeo se dispara al entrar en pantalla y se repite al volver
  const estrella = document.querySelector('.star-view');
  if (estrella && 'IntersectionObserver' in window) {
    const ioEstrella = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.intersectionRatio >= 0.4) en.target.classList.add('tin');
        else if (en.intersectionRatio === 0) en.target.classList.remove('tin');
      });
    }, { threshold: [0, 0.4] });
    ioEstrella.observe(estrella);
  } else if (estrella) {
    estrella.classList.add('tin');
  }

  update();
  root.classList.add('js');
})();

// ---------- Habilidades: tarjeta de la estrella ----------
const skillTitle = document.getElementById('skillTitle');
const skillText = document.getElementById('skillText');
let current = null;

function renderSkill() {
  if (current === null) {
    skillTitle.textContent = tt('skillDefaultTitle', 'Economista');
    skillText.textContent = tt('skillDefaultText', 'Convierto datos en decisiones.');
  } else {
    skillTitle.textContent = tt('skill' + current + 'Name', '');
    skillText.textContent = tt('skill' + current + 'Text', '');
  }
}

function selectSkill(i) {
  current = (i === current) ? null : i;
  renderSkill();
  document.querySelectorAll('[data-skill]').forEach((el) => {
    el.classList.toggle('on', Number(el.dataset.skill) === current);
  });
}

document.addEventListener('langchange', renderSkill);
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
const isChromium = !!(navigator.userAgentData && navigator.userAgentData.brands.some((b) => /Chromium/.test(b.brand)));
const SVGNS = 'http://www.w3.org/2000/svg';
const glassHost = document.createElementNS(SVGNS, 'svg');
glassHost.setAttribute('width', '0');
glassHost.setAttribute('height', '0');
glassHost.style.cssText = 'position:absolute;pointer-events:none';
document.body.appendChild(glassHost);

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
      const u = Math.max(0, Math.min(1, ((X - ax) * dx + (Y - ay) * dy) / (dx * dx + dy * dy || 1)));
      const ex = ax + u * dx - X, ey = ay + u * dy - Y;
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

// ---------- Proyectos: cada recuadro aparece al deslizar ----------
const tarjetas = document.querySelectorAll('.proyecto');
if ('IntersectionObserver' in window) {
  const ioP = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.intersectionRatio >= 0.35) en.target.classList.add('visible');
      else if (en.intersectionRatio === 0) en.target.classList.remove('visible');
    });
  }, { threshold: [0, 0.35] });
  tarjetas.forEach((c) => ioP.observe(c));
} else {
  tarjetas.forEach((c) => c.classList.add('visible'));
}

// ---------- Aplicar el vidrio ----------
tarjetas.forEach((el) =>
  liquidGlass(el, { sdf: roundedSdf(32), bezel: () => 42, scale: 95, res: 220, blur: 10, sat: 0.5, bri: 1.1 }));

liquidGlass(starGlass, { sdf: starSdf(), bezel: (w) => w * 0.14, scale: 120, res: 160, blur: 1, sat: 3, bri: 1 });
liquidGlass(document.getElementById('skillCard'), { sdf: roundedSdf(32), bezel: () => 22, scale: 45, res: 220, blur: 3, sat: 1.3, bri: 1 });

// El nombre de la esquina lleva al inicio sin cambiar la dirección
document.querySelector('.site-name').addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});
