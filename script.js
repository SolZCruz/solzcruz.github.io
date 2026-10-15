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
const zoomEl = document.querySelector('.star-zoom');
const skillTitle = document.getElementById('skillTitle');
const skillText = document.getElementById('skillText');
const defaults = { n: skillTitle.textContent, t: skillText.textContent };
let current = null;

function selectSkill(i) {
  current = (i === current) ? null : i;
  const s = 2.2;
  if (current === null) {
    zoomEl.style.setProperty('--s', 1);
    zoomEl.style.setProperty('--tx', 0);
    zoomEl.style.setProperty('--ty', 0);
  } else {
    const tip = zoomEl.querySelector(`.tip[data-skill="${current}"]`);
    zoomEl.style.setProperty('--s', s);
    zoomEl.style.setProperty('--tx', (-(parseFloat(tip.style.left) - 50) * s).toFixed(1));
    zoomEl.style.setProperty('--ty', (-(parseFloat(tip.style.top) - 50) * s).toFixed(1));
  }
  const info = current === null ? defaults : { n: skills[current].n, t: skills[current].t };
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
