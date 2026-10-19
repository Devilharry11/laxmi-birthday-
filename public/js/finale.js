// DOS LAXMI - Grand Finale, Confetti, Fireworks & Wish Balloons

// Global Confetti Burst Function
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const count = 120;
  const colors = ['#e07a99', '#f3c68f', '#fb7185', '#38bdf8', '#a855f7', '#ffffff'];
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      gravity: 0.35,
      alpha: 1
    });
  }

  let frameId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.alpha -= 0.008;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    }

    if (active) {
      frameId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(frameId);
    }
  }

  animate();
}

window.triggerConfetti = triggerConfetti;

// Fireworks Canvas Burst
function triggerFireworks() {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const rockets = [];
  const count = 5;

  for (let i = 0; i < count; i++) {
    const x = Math.random() * canvas.width * 0.7 + canvas.width * 0.15;
    const y = Math.random() * canvas.height * 0.4 + canvas.height * 0.15;
    const colors = ['#f43f5e', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f3c68f'];
    const pCount = 50;

    for (let j = 0; j < pCount; j++) {
      const angle = (Math.PI * 2 * j) / pCount;
      const speed = Math.random() * 5 + 2;
      rockets.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        radius: Math.random() * 3 + 1.5
      });
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    for (const r of rockets) {
      r.x += r.vx;
      r.y += r.vy;
      r.vy += 0.05; // gravity
      r.alpha -= 0.015;

      if (r.alpha > 0) {
        alive = true;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.fill();
      }
    }

    if (alive) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

// Spawn floating wish balloons into the sky
function spawnWishBalloons() {
  const count = 7;
  const colors = [
    'radial-gradient(circle at 40% 30%, #ff80ab, #f50057)',
    'radial-gradient(circle at 40% 30%, #ffd54f, #ff8f00)',
    'radial-gradient(circle at 40% 30%, #ea80fc, #aa00ff)',
    'radial-gradient(circle at 40% 30%, #80d8ff, #0091ea)'
  ];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const balloon = document.createElement('div');
      balloon.className = 'wish-balloon';
      balloon.style.left = `${Math.random() * 85 + 5}vw`;
      balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
      balloon.style.animationDuration = `${Math.random() * 4 + 5}s`;
      document.body.appendChild(balloon);

      balloon.addEventListener('animationend', () => {
        balloon.remove();
      });
    }, i * 350);
  }
}

function initFinale(finaleData = {}) {
  const container = document.getElementById('finale-container');
  if (!container) return;

  const title = finaleData.title || "Make A Birthday Wish ✨";
  const subtitle = finaleData.subtitle || "Close your eyes, make a wish, and release it into the starlit sky.";
  const buttonText = finaleData.buttonText || "Release My Birthday Wish 🎈";
  const finalNote = finaleData.finalNote || "Happy Birthday Laxmi! Love, Aryan ❤️";

  container.innerHTML = `
    <div class="finale-card">
      <div class="finale-cake-icon">🎂</div>
      <h2 class="finale-title"><span>${title}</span></h2>
      <p class="finale-subtitle">${subtitle}</p>
      <button class="finale-wish-btn" id="finale-wish-btn">
        <span>${buttonText}</span>
      </button>
      <div class="finale-love-note">${finalNote}</div>
    </div>
  `;

  const wishBtn = container.querySelector('#finale-wish-btn');
  wishBtn.addEventListener('click', () => {
    triggerConfetti();
    triggerFireworks();
    spawnWishBalloons();

    if (window.playCuteChime) window.playCuteChime();

    wishBtn.innerHTML = `<span>Wish Released to the Stars! 🌟✨</span>`;
    wishBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

    setTimeout(() => {
      wishBtn.innerHTML = `<span>${buttonText}</span>`;
      wishBtn.style.background = '';
    }, 4000);
  });
}

window.initFinale = initFinale;
