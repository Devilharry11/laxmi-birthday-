// DOS LAXMI - Love Arcade Mini-Games Controller

function initArcade(arcadeData = {}, fortunesList = []) {
  const container = document.getElementById('arcade-container');
  if (!container) return;

  const defaultFortunes = [
    "Aryan is officially declaring today as National Laxmi Day! 👑",
    "Prediction: You will receive infinite forehead kisses and warm hugs this year. 🥰",
    "Special Pass: Aryan will cook/order your favorite food with zero complaints today. 🍕",
    "The stars confirm: You are officially 1,000,000 times cuter than any kitten. 🐱",
    "Voucher: 1 late-night drive with the windows down and your favorite playlist on loop. 🚗💨",
    "A secret wish you made in silence is about to come true this year. ✨"
  ];

  const fortunes = (fortunesList && fortunesList.length > 0) ? fortunesList : defaultFortunes;

  let activeGame = 'falling'; // 'falling' or 'cookie'

  function render() {
    container.innerHTML = `
      <div class="arcade-tabs-nav">
        <button class="arcade-tab-btn ${activeGame === 'falling' ? 'active' : ''}" data-game="falling">
          <span>💖</span> Catch Falling Hearts & Jhumkas
        </button>
        <button class="arcade-tab-btn ${activeGame === 'cookie' ? 'active' : ''}" data-game="cookie">
          <span>🥠</span> Aryan's Fortune Cookie
        </button>
      </div>

      <div id="arcade-active-stage">
        ${activeGame === 'falling' ? renderFallingGameHtml() : renderCookieHtml()}
      </div>

      <!-- Secret Vault Modal -->
      <div class="vault-modal" id="vault-modal">
        <div class="vault-box">
          <div style="font-size: 4rem; margin-bottom: 1rem;">🏆</div>
          <span style="font-family: var(--font-cinematic); font-size: 0.8rem; letter-spacing: 0.2em; color: var(--color-secondary); text-transform: uppercase;">
            Secret Vault Unlocked!
          </span>
          <h3 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin: 0.5rem 0 1rem 0;">
            You Scored 100+ Points! 🎉
          </h3>
          <p style="color: #ffd6e0; font-family: var(--font-handwriting); font-size: 1.6rem; line-height: 1.5; margin-bottom: 2rem;">
            "You caught every single piece of my heart, Laxmi. Happy Birthday my love, my favorite story, and my forever queen." — Aryan ❤️
          </p>
          <button class="btn-primary" id="btn-close-vault">Close Vault ✨</button>
        </div>
      </div>
    `;

    // Tab Switchers
    container.querySelectorAll('.arcade-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeGame = btn.getAttribute('data-game');
        render();
        if (activeGame === 'falling') setupFallingGame();
        else setupFortuneCookie();
      });
    });

    const closeVaultBtn = container.querySelector('#btn-close-vault');
    const vaultModal = container.querySelector('#vault-modal');
    if (closeVaultBtn && vaultModal) {
      closeVaultBtn.addEventListener('click', () => {
        vaultModal.classList.remove('active');
      });
    }

    if (activeGame === 'falling') setupFallingGame();
    else setupFortuneCookie();
  }

  function renderFallingGameHtml() {
    return `
      <div class="arcade-game-wrapper">
        <div class="game-hud">
          <span style="color: var(--color-text-muted); font-size: 0.95rem;">Catch hearts 💖 and jhumkas 🪙</span>
          <div class="hud-score-box">Score: <span id="game-score">0</span></div>
        </div>

        <div class="game-canvas-container" id="game-canvas-container">
          <canvas id="arcade-canvas"></canvas>
          <div class="game-start-overlay" id="game-start-overlay">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">🎁</div>
            <h3 style="font-family: var(--font-heading); font-size: 1.8rem; color: #fff; margin-bottom: 0.5rem;">
              Catch Laxmi's Jhumkas & Hearts
            </h3>
            <p style="color: var(--color-text-muted); max-width: 450px; margin-bottom: 1.75rem;">
              Move your mouse or drag your finger across the screen to catch falling treasures. Reach 100 points to unlock the Secret Vault!
            </p>
            <button class="btn-primary" id="btn-start-game">Start Game 🕹️</button>
          </div>
        </div>

        <div style="font-size: 0.85rem; color: var(--admin-text-dim);">
          Tip: 🪙 Silver Jhumkas are worth +25 points!
        </div>
      </div>
    `;
  }

  function renderCookieHtml() {
    return `
      <div class="fortune-cookie-wrapper">
        <span class="section-tag">Daily Love Oracle</span>
        <h3 style="font-family: var(--font-heading); font-size: 2rem; color: #fff; margin-bottom: 0.5rem;">
          Aryan's Golden Fortune Cookie 🥠
        </h3>
        <p style="color: var(--color-text-muted); max-width: 500px; margin: 0 auto;">
          Baked with endless love. Click or tap the golden cookie to crack it open!
        </p>

        <div class="cookie-interactive-stage" id="cookie-stage" title="Click to crack open!">
          <div class="fortune-cookie-3d" id="cookie-icon">🥠</div>
        </div>

        <div class="fortune-parchment-slip" id="fortune-slip">
          <p class="fortune-slip-text" id="fortune-text"></p>
          <span class="fortune-slip-sub">Certified Genuine Fortune • From Aryan With Love</span>
          <div style="margin-top: 1.5rem;">
            <button class="btn-secondary" id="btn-crack-another">Crack Another Cookie 🥠</button>
          </div>
        </div>
      </div>
    `;
  }

  // GAME 1 LOGIC
  function setupFallingGame() {
    const canvas = document.getElementById('arcade-canvas');
    const startOverlay = document.getElementById('game-start-overlay');
    const startBtn = document.getElementById('btn-start-game');
    const scoreEl = document.getElementById('game-score');
    const vaultModal = document.getElementById('vault-modal');
    if (!canvas || !startBtn) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    function resize() {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();

    let score = 0;
    let isRunning = false;
    let basket = { x: width / 2, y: height - 35, w: 90, h: 25 };
    let items = [];
    let particles = [];
    let spawnTimer = 0;
    let animationId = null;
    let vaultUnlocked = false;

    const types = [
      { emoji: '💖', val: 10, speed: 2.2 },
      { emoji: '🪙', val: 25, speed: 2.8 },
      { emoji: '☕', val: 15, speed: 2.0 },
      { emoji: '🧁', val: 20, speed: 2.4 }
    ];

    function spawnItem() {
      const type = types[Math.floor(Math.random() * types.length)];
      items.push({
        x: Math.random() * (width - 50) + 25,
        y: -30,
        emoji: type.emoji,
        val: type.val,
        speed: type.speed + Math.random() * 0.8
      });
    }

    // Controls
    canvas.parentElement.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      basket.x = e.clientX - rect.left - basket.w / 2;
      basket.x = Math.max(0, Math.min(width - basket.w, basket.x));
    });

    canvas.parentElement.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        basket.x = e.touches[0].clientX - rect.left - basket.w / 2;
        basket.x = Math.max(0, Math.min(width - basket.w, basket.x));
      }
    }, { passive: true });

    function gameLoop() {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      // Draw Basket
      ctx.fillStyle = '#e07a99';
      ctx.beginPath();
      ctx.roundRect(basket.x, basket.y, basket.w, basket.h, 12);
      ctx.fill();
      ctx.strokeStyle = '#f3c68f';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = '14px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText('Laxmi 💕', basket.x + basket.w / 2, basket.y + 17);

      // Spawn items
      spawnTimer++;
      if (spawnTimer % 45 === 0) spawnItem();

      // Update & Draw items
      for (let i = items.length - 1; i >= 0; i--) {
        const it = items[i];
        it.y += it.speed;

        ctx.font = '26px serif';
        ctx.textAlign = 'center';
        ctx.fillText(it.emoji, it.x, it.y);

        // Catch collision
        if (it.y >= basket.y - 10 && it.y <= basket.y + basket.h &&
            it.x >= basket.x - 10 && it.x <= basket.x + basket.w + 10) {
          score += it.val;
          scoreEl.textContent = score;

          if (window.playCuteChime) window.playCuteChime();

          // Spawn burst particles
          for (let p = 0; p < 8; p++) {
            particles.push({
              x: it.x,
              y: it.y,
              vx: (Math.random() - 0.5) * 6,
              vy: Math.random() * -5 - 1,
              alpha: 1,
              color: it.val === 25 ? '#f3c68f' : '#e07a99'
            });
          }

          items.splice(i, 1);

          // Unlock secret vault
          if (score >= 100 && !vaultUnlocked) {
            vaultUnlocked = true;
            if (window.triggerConfetti) window.triggerConfetti();
            if (vaultModal) vaultModal.classList.add('active');
          }
          continue;
        }

        // Off screen
        if (it.y > height + 40) {
          items.splice(i, 1);
        }
      }

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    }

    startBtn.addEventListener('click', () => {
      startOverlay.style.display = 'none';
      score = 0;
      scoreEl.textContent = '0';
      items = [];
      isRunning = true;
      vaultUnlocked = false;
      gameLoop();
    });
  }

  // GAME 2 LOGIC
  function setupFortuneCookie() {
    const cookieStage = document.getElementById('cookie-stage');
    const cookieIcon = document.getElementById('cookie-icon');
    const slip = document.getElementById('fortune-slip');
    const textEl = document.getElementById('fortune-text');
    const anotherBtn = document.getElementById('btn-crack-another');
    if (!cookieStage || !cookieIcon) return;

    cookieStage.addEventListener('click', () => {
      cookieIcon.classList.add('cracked');
      if (window.playCuteChime) window.playCuteChime();
      if (window.triggerConfetti) window.triggerConfetti();

      setTimeout(() => {
        cookieIcon.textContent = '✨🥠✨';
        const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        textEl.textContent = randomFortune;
        slip.style.display = 'block';
      }, 400);
    });

    if (anotherBtn) {
      anotherBtn.addEventListener('click', () => {
        cookieIcon.classList.remove('cracked');
        cookieIcon.textContent = '🥠';
        slip.style.display = 'none';
      });
    }
  }

  render();
}

window.initArcade = initArcade;
