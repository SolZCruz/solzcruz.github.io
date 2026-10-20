(function () {
  const i18n = {
    es: {
      title: 'Portafolio de ciencia de datos',
      langAria: 'Idioma',
      siteName: 'Portafolio de ciencia de datos',
      menuBtn: 'Índice', menuAria: 'Índice',
      navAbout: 'Sobre mí', navProjects: 'Habilidades y proyectos', navContact: 'Contacto',
      role: 'Economista en formación',
      stack: 'Datos, econometría y análisis con SQL, Python y R.',
      w0: 'ANÁLISIS DE DATOS', w1: 'ECONOMÍA APLICADA', w2: 'FINANZAS',
      w3: 'INVESTIGACIÓN', w4: 'TOMA DE DECISIONES', w5: 'ECONOMETRÍA',
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
      langAria: 'Language',
      siteName: 'Data science portfolio',
      menuBtn: 'Menu', menuAria: 'Menu',
      navAbout: 'About me', navProjects: 'Skills and projects', navContact: 'Contact',
      role: 'Economist in training',
      stack: 'Data, econometrics and analysis with SQL, Python and R.',
      w0: 'Data analysis', w1: 'Applied economics', w2: 'Finance',
      w3: 'Research', w4: 'Decision-making', w5: 'Econometrics',
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

  let lang = 'es';
  try { lang = localStorage.getItem('lang') || 'es'; } catch (e) {}
  if (!i18n[lang]) lang = 'es';

  // Disponible para script.js
  window.t = function (key) { return i18n[lang][key]; };

  function applyLang(l) {
    lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    document.documentElement.lang = l;
    document.title = i18n[l].title;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = i18n[l][el.dataset.i18n];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', i18n[l][el.dataset.i18nAria]);
    });

    const orb = document.getElementById('orb');
    const hero = document.getElementById('inicio');
    if (orb && hero) {
      orb.setAttribute('aria-label', hero.classList.contains('is-open') ? i18n[l].orbHide : i18n[l].orbShow);
    }

    const cv = document.getElementById('cvLink');
    if (cv) cv.setAttribute('href', l === 'es' ? './CV.pdf' : './CV-en.pdf');

    document.querySelectorAll('.lang-switch [data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.lang === l);
    });

    document.dispatchEvent(new CustomEvent('langchange'));
  }

  document.querySelectorAll('.lang-switch [data-lang]').forEach((b) => {
    b.addEventListener('click', () => applyLang(b.dataset.lang));
  });

  applyLang(lang);
})();
