// DOS LAXMI - Main Application Orchestrator

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[DOS LAXMI] Booting birthday experience...');

  // 1. Initialize background stars & prologue
  if (window.initStarfield) window.initStarfield();
  if (window.initPrologue) window.initPrologue();

  // 2. Determine whether we are in preview mode
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get('preview') === 'true';

  let contentData = null;

  if (isPreview) {
    const banner = document.getElementById('preview-banner');
    if (banner) banner.classList.add('active');

    // Fetch draft content (using admin token if stored)
    const token = localStorage.getItem('laxmi_admin_token');
    try {
      const res = await fetch('/api/content/draft', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const json = await res.json();
        contentData = json.content;
      }
    } catch (e) {
      console.warn('[Preview] Could not load draft, falling back to published:', e);
    }
  }

  // Fallback to published content
  if (!contentData) {
    try {
      const res = await fetch('/api/content/published');
      const json = await res.json();
      contentData = json.content;
    } catch (err) {
      console.error('[App] Failed to load published content:', err);
    }
  }

  if (!contentData) {
    console.error('[App] No content data available.');
    return;
  }

  // Apply dynamic theme
  applyTheme(contentData.meta?.theme);

  // Render & setup Hero
  renderHero(contentData.meta);

  // Initialize Typography
  if (contentData.typography?.enabled !== false && window.initTypography) {
    window.initTypography(contentData.typography.phrases, contentData.typography.videoUrl);
  } else {
    hideSection('typography-section');
  }

  // Initialize Jukebox
  if (contentData.jukebox?.enabled !== false && window.initJukebox) {
    window.initJukebox(contentData.music);
  } else {
    hideSection('jukebox-section');
  }

  // Initialize Scrapbook
  if (contentData.scrapbook?.enabled !== false && window.initScrapbook) {
    window.initScrapbook(contentData.scrapbook.pages);
  } else {
    hideSection('scrapbook-section');
  }

  // Initialize Love Arcade Games
  if (contentData.arcade?.enabled !== false && window.initArcade) {
    window.initArcade(contentData.arcade, contentData.fortunes);
  } else {
    hideSection('arcade-section');
  }

  // Initialize Reasons Constellation
  if (contentData.reasons?.enabled !== false && window.initReasons) {
    window.initReasons(contentData.reasons, contentData.meta?.startDate);
  } else {
    hideSection('reasons-section');
  }

  // Initialize Questions
  if (contentData.questions?.enabled !== false && window.initQuiz) {
    window.initQuiz(contentData.questions.items);
  } else {
    hideSection('questions-section');
  }

  // Initialize Surprises
  if (contentData.surprises?.enabled !== false && window.initSurprises) {
    window.initSurprises(contentData.surprises.cards);
  } else {
    hideSection('surprises-section');
  }

  // Initialize Letter
  if (contentData.letter?.enabled !== false && window.initLetter) {
    window.initLetter(contentData.letter);
  } else {
    hideSection('letter-section');
  }

  // Initialize Finale
  if (contentData.finale?.enabled !== false && window.initFinale) {
    window.initFinale(contentData.finale);
  } else {
    hideSection('finale-section');
  }

  // Initialize Audio
  if (contentData.music && window.ambientAudio) {
    window.ambientAudio.init(contentData.music);
  }

  // Handle section ordering if configured
  if (Array.isArray(contentData.sectionOrder)) {
    reorderSections(contentData.sectionOrder);
  }
});

function applyTheme(theme = {}) {
  const root = document.documentElement;
  if (theme.primaryColor) {
    root.style.setProperty('--color-primary', theme.primaryColor);
  }
  if (theme.secondaryColor) {
    root.style.setProperty('--color-secondary', theme.secondaryColor);
  }
  if (theme.bgColor) {
    root.style.setProperty('--color-bg', theme.bgColor);
  }
}

function renderHero(meta = {}) {
  const greetingEl = document.getElementById('hero-greeting');
  const subtitleEl = document.getElementById('hero-subtitle');
  const badgeEl = document.getElementById('hero-badge-text');
  const ctaBtn = document.getElementById('hero-cta-btn');
  const heroImg = document.getElementById('hero-img');
  const captionEl = document.getElementById('hero-caption-text');
  const pageTitle = document.querySelector('title');

  if (meta.siteTitle && pageTitle) pageTitle.textContent = meta.siteTitle;
  if (meta.heroGreeting && greetingEl) greetingEl.innerHTML = meta.heroGreeting;
  if (meta.heroSubtitle && subtitleEl) subtitleEl.textContent = meta.heroSubtitle;
  if (meta.heroBadge && badgeEl) badgeEl.textContent = meta.heroBadge;
  if (meta.heroCtaText && ctaBtn) ctaBtn.textContent = meta.heroCtaText;
  if (meta.heroPhotoUrl && heroImg) heroImg.src = meta.heroPhotoUrl;
  if (captionEl) captionEl.textContent = meta.birthdayPerson ? `${meta.birthdayPerson} ✨` : 'Laxmi ✨';
}

function hideSection(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function reorderSections(order) {
  const main = document.querySelector('main');
  if (!main) return;
  const map = {
    hero: 'hero-section',
    typography: 'typography-section',
    jukebox: 'jukebox-section',
    scrapbook: 'scrapbook-section',
    arcade: 'arcade-section',
    reasons: 'reasons-section',
    questions: 'questions-section',
    surprises: 'surprises-section',
    letter: 'letter-section',
    finale: 'finale-section'
  };

  order.forEach(key => {
    const id = map[key];
    if (id) {
      const el = document.getElementById(id);
      if (el) main.appendChild(el);
    }
  });
}
