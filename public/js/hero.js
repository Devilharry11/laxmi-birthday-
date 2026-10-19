// DOS LAXMI - Hero & Starfield Background Canvas

function initStarfield() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, stars = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = [];
    const count = Math.min(100, Math.floor(width / 12));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        color: Math.random() > 0.4 ? '#e07a99' : (Math.random() > 0.5 ? '#f3c68f' : '#ffffff')
      });
    }
  }

  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (const s of stars) {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.1) {
        s.speed = -s.speed;
      }
      ctx.fillStyle = s.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  draw();
}

window.initStarfield = initStarfield;
