// DOS LAXMI - Cinematic Typography Section Controller

function initTypography(phrases = [], videoUrl = '') {
  const stage = document.getElementById('typography-stage');
  const video = document.getElementById('typography-video');
  const canvas = document.getElementById('typography-aura-canvas');
  if (!stage) return;

  if (videoUrl && video) {
    video.src = videoUrl;
    video.classList.add('has-video');
    video.play().catch(() => {});
  } else if (canvas) {
    initAuraCanvas(canvas);
  }

  if (!phrases || phrases.length === 0) {
    phrases = [
      { lead: "YOU ARE", highlight: "UNSTOPPABLE", sub: "Fierce, smart, and effortlessly graceful" },
      { lead: "MY FAVORITE", highlight: "SMILE", sub: "The one that makes every bad day disappear in a second" },
      { lead: "FOREVER", highlight: "AWLLE CUTUUU", sub: "The sweetest chaos and purest heart I know" },
      { lead: "HAPPY BIRTHDAY", highlight: "LAXMI", sub: "With all my love, today and every single day" }
    ];
  }

  let currentIndex = 0;
  let timer = null;
  let isPlaying = true;

  // Build DOM
  stage.innerHTML = `
    <div class="typography-frame active" id="typo-frame">
      <div class="typo-lead" id="typo-lead"></div>
      <div class="typo-highlight" id="typo-highlight"></div>
      <div class="typo-sub" id="typo-sub"></div>
    </div>
    <div class="typography-controls">
      <button class="typo-ctrl-btn" id="typo-prev" title="Previous Word">❮</button>
      <button class="typo-ctrl-btn" id="typo-play-toggle" title="Pause / Play">⏸</button>
      <div class="typo-indicators" id="typo-indicators"></div>
      <button class="typo-ctrl-btn" id="typo-next" title="Next Word">❯</button>
    </div>
  `;

  const frame = document.getElementById('typo-frame');
  const leadEl = document.getElementById('typo-lead');
  const highEl = document.getElementById('typo-highlight');
  const subEl = document.getElementById('typo-sub');
  const indicatorsEl = document.getElementById('typo-indicators');
  const prevBtn = document.getElementById('typo-prev');
  const nextBtn = document.getElementById('typo-next');
  const playToggleBtn = document.getElementById('typo-play-toggle');

  // Build dots
  indicatorsEl.innerHTML = phrases.map((_, i) => `<div class="typo-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></div>`).join('');

  function renderSlide(index) {
    currentIndex = (index + phrases.length) % phrases.length;
    const current = phrases[currentIndex];

    frame.classList.remove('active');

    setTimeout(() => {
      leadEl.textContent = current.lead || '';
      highEl.textContent = current.highlight || '';
      subEl.textContent = current.sub || '';

      frame.classList.add('active');

      document.querySelectorAll('.typo-dot').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }, 250);
  }

  function nextSlide() {
    renderSlide(currentIndex + 1);
  }

  function prevSlide() {
    renderSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    timer = setInterval(nextSlide, 4500);
    isPlaying = true;
    if (playToggleBtn) playToggleBtn.textContent = '⏸';
  }

  function stopAutoplay() {
    if (timer) clearInterval(timer);
    timer = null;
    isPlaying = false;
    if (playToggleBtn) playToggleBtn.textContent = '▶';
  }

  prevBtn.addEventListener('click', () => {
    prevSlide();
    if (isPlaying) startAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    nextSlide();
    if (isPlaying) startAutoplay();
  });

  playToggleBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  indicatorsEl.addEventListener('click', (e) => {
    const dot = e.target.closest('.typo-dot');
    if (dot) {
      const idx = parseInt(dot.getAttribute('data-idx'), 10);
      renderSlide(idx);
      if (isPlaying) startAutoplay();
    }
  });

  // Initial render
  renderSlide(0);
  startAutoplay();
}

// Fluid glowing aura background canvas
function initAuraCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let t = 0;
  function draw() {
    t += 0.015;
    ctx.clearRect(0, 0, width, height);

    // Orb 1: Rose Gold
    const x1 = width * 0.45 + Math.sin(t * 0.8) * (width * 0.25);
    const y1 = height * 0.5 + Math.cos(t * 0.7) * (height * 0.25);
    const grad1 = ctx.createRadialGradient(x1, y1, 10, x1, y1, width * 0.45);
    grad1.addColorStop(0, 'rgba(224, 122, 153, 0.4)');
    grad1.addColorStop(1, 'transparent');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Orb 2: Warm Champagne Gold
    const x2 = width * 0.55 + Math.cos(t * 0.9) * (width * 0.2);
    const y2 = height * 0.45 + Math.sin(t * 0.6) * (height * 0.2);
    const grad2 = ctx.createRadialGradient(x2, y2, 10, x2, y2, width * 0.4);
    grad2.addColorStop(0, 'rgba(243, 198, 143, 0.35)');
    grad2.addColorStop(1, 'transparent');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(draw);
  }
  draw();
}

window.initTypography = initTypography;
