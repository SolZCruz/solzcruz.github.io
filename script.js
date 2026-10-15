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
