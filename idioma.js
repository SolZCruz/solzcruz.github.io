(function () {
  const i18n = {
    es: {
      title: 'Portafolio Sol Cruz',
      langAria: 'Idioma',
      siteName: 'Portafolio Sol Cruz',
      menuBtn: 'Menú', menuAria: 'Menú',
      navAbout: 'Sobre mí', navProjects: 'Habilidades y proyectos', navContact: 'Contacto',
      role: 'Economista',
      stack: 'Convierto datos en decisiones',
      w0: 'ANÁLISIS DE DATOS', w1: 'ECONOMÍA APLICADA', w2: 'FINANZAS',
      w3: 'INVESTIGACIÓN', w4: 'TOMA DE DECISIONES', w5: 'ECONOMETRÍA',
      orbShow: 'Mostrar mi información', orbHide: 'Ocultar mi información',
      aboutTitle: 'Sobre mí',
      aboutText: 'Soy economista de la Universidad Industrial de Santander. Me interesa el análisis de la toma de decisiones de personas, empresas y gobiernos, y el uso de la evidencia, incluidos los datos, para proponer soluciones con fundamento. Me atraen la economía aplicada, la evaluación de políticas y el análisis para la toma de decisiones empresariales, y busco aplicarlos en consultoría, finanzas, política pública o investigación.',
      eduLabel: 'Formación complementaria', edu: 'Técnico en Contabilización de Operaciones Comerciales y Financieras',
      toolsLabel: 'Herramientas', tools: 'SQL, Python, R, Stata, Microsoft Office, Visualización: Power BI, Tableau',
      interestsLabel: 'Idiomas', interests: 'Español, Inglés, Francés',
      profileTitle: 'Habilidades',
      skillDefaultTitle: 'Economista',
      skillDefaultText: 'Convierto datos en decisiones. Elige un punto de la estrella para ver cada habilidad.',
      skill0Name: 'Gestión y tranformación de datos', skill0Text: 'Consulta, limpieza y transformación de datos, así como construcción de indicadores de negocio para garantizar su calidad y utilidad.',
      skill1Name: 'Modelación econométrica', skill1Text: 'Aplicación de métodos estadísticos y econométricos para analizar relaciones entre variables, contrastar hipótesis e interpretar resultados empíricos.',
      skill2Name: 'Comunicación de resultados', skill2Text: 'Transformación de información compleja en visualizaciones y narrativas claras que facilitan la comprensión y comunicación de los hallazgos.',
      skill3Name: 'Investigación', skill3Text: 'Formulación de preguntas de investigación, recopilación y revisión de fuentes relevantes y examen sistemático de evidencia para obtener conclusiones fundamentadas.',
      skill4Name: 'Análisis estrátegico', skill4Text: 'Evaluación de información, alternativas y factores contextuales para identificar oportunidades, valorar posibles resultados y apoyar la toma de decisiones informadas.',
      projectsTitle: 'Proyectos',
      cv: 'Descargar CV',
      
    },
    en: {
      title: 'Portfolio Sol Cruz',
      langAria: 'Language',
      siteName: 'Portfolio Sol Cruz',
      menuBtn: 'Menu', menuAria: 'Menu',
      navAbout: 'About me', navProjects: 'Skills and projects', navContact: 'Contact',
      role: 'Economist',
      stack: 'I turn data into decisions',
      w0: 'DATA ANALYSIS', w1: 'APPLIED ECONOMICS', w2: 'FINANCE',
      w3: 'RESEARCH', w4: 'DECISION-MAKING', w5: 'ECONOMETRICS',
      orbShow: 'Show my information', orbHide: 'Hide my information',
      aboutTitle: 'About me',
      aboutText: "I am an economist from the Industrial University of Santander. I am interested in the analysis of decision-making by individuals, businesses, and governments, and in the use of evidence, including data, to develop well-founded solutions. My interests include applied economics, policy evaluation, and analysis to support business decision-making, and I aim to apply these skills in consulting, finance, public policy, or research.",
      eduLabel: 'Addition Education', edu: 'Technical Qualification in Accounting for Commercial and Financial Transactions',
      toolsLabel: 'Tools', tools: 'SQL, Python, R, Stata, Microsoft Office, Data Visualization: Power BI, Tableau',
      interestsLabel: 'Languages', interests: 'Spanish, English, French',
      profileTitle: 'Skills',
      skillDefaultTitle: 'Economist',
      skillDefaultText: 'I turn data into decisions. Pick a point on the star to see each skill.',
      skill0Name: 'Data Management', skill0Text: 'Data querying, cleaning, transformation, and the development of business indicators to ensure data quality and usability.',
      skill1Name: 'Econometric Modeling', skill1Text: 'Application of statistical and econometric methods to analyze relationships between variables, test hypotheses, and interpret empirical results.',
      skill2Name: 'Data Storytelling', skill2Text: 'Translating complex information into clear visualizations and compelling narratives that make findings easier to understand and communicate.',
      skill3Name: 'Research', skill3Text: 'Formulation of research questions, collection and review of relevant sources, and systematic examination of evidence to develop well-supported findings.',
      skill4Name: 'Strategic Analysis', skill4Text: 'Evaluation of information, alternatives, and contextual factors to identify opportunities, assess potential outcomes, and support informed decision-making.',
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
