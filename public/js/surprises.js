// DOS LAXMI - Secret Surprise Cards Controller

function initSurprises(cards = []) {
  const container = document.getElementById('surprises-container');
  if (!container) return;

  if (!cards || cards.length === 0) {
    cards = [
      {
        id: "s-1",
        coverText: "Surprise #1 💌",
        revealedTitle: "Midnight Ice Cream & Drive Voucher",
        revealedDesc: "Redeemable anytime for your favorite ice cream, your playlist, and long late-night talks under the stars.",
        icon: "🍦"
      },
      {
        id: "s-2",
        coverText: "Surprise #2 👑",
        revealedTitle: "Aryan's 'You Win Any Argument' Pass",
        revealedDesc: "Good for 1 unconditional win whenever Aryan is being stubborn. (Use wisely, queen!)",
        icon: "🏆"
      },
      {
        id: "s-3",
        coverText: "Surprise #3 🌟",
        revealedTitle: "A Secret Birthday Wish Grant",
        revealedDesc: "Make one special wish today—whatever your heart desires—and Aryan promises to make it happen.",
        icon: "✨"
      }
    ];
  }

  container.innerHTML = `
    <div class="surprises-grid">
      ${cards.map((c, idx) => `
        <div class="surprise-card" data-idx="${idx}">
          <div class="surprise-inner">
            <div class="surprise-front">
              <div class="surprise-foil-pattern"></div>
              <div class="surprise-front-badge">🎁</div>
              <h4 class="surprise-front-title">${c.coverText || 'Secret Gift'}</h4>
              <span class="surprise-front-prompt">Tap to Scratch & Reveal ✨</span>
            </div>
            <div class="surprise-back">
              <div class="surprise-gift-icon">${c.icon || '🎉'}</div>
              <h4 class="surprise-gift-title">${c.revealedTitle || 'Special Surprise'}</h4>
              <p class="surprise-gift-desc">${c.revealedDesc || ''}</p>
              <span class="surprise-gift-tag">Valid Forever • Aryan's Guarantee</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('.surprise-card').forEach(card => {
    card.addEventListener('click', () => {
      const isAlreadyRevealed = card.classList.contains('revealed');
      card.classList.toggle('revealed');

      if (!isAlreadyRevealed) {
        if (window.playCuteChime) window.playCuteChime();
        if (window.triggerConfetti) window.triggerConfetti();
      }
    });
  });
}

window.initSurprises = initSurprises;
