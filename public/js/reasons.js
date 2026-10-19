// DOS LAXMI - Reasons & Live Days Counter Controller

function initReasons(reasonsData = {}, startDateStr = '2023-09-21T00:00:00') {
  const container = document.getElementById('reasons-container');
  if (!container) return;

  const items = reasonsData.items || [];

  container.innerHTML = `
    <!-- Live Days Counter Banner -->
    <div class="love-counter-box">
      <div class="counter-tag">The Story Continues</div>
      <h3 class="counter-headline">Every Second of Loving You Has Been Magic ✨</h3>
      <div class="counter-digits-grid">
        <div class="digit-card">
          <div class="digit-val" id="days-val">0</div>
          <div class="digit-label">Days</div>
        </div>
        <div class="digit-card">
          <div class="digit-val" id="hours-val">0</div>
          <div class="digit-label">Hours</div>
        </div>
        <div class="digit-card">
          <div class="digit-val" id="mins-val">0</div>
          <div class="digit-label">Minutes</div>
        </div>
        <div class="digit-card">
          <div class="digit-val" id="secs-val">0</div>
          <div class="digit-label">Seconds</div>
        </div>
      </div>
    </div>

    <!-- Reasons Grid -->
    <div class="reasons-grid">
      ${items.map((r, idx) => `
        <div class="reason-card" data-idx="${idx}">
          <div class="reason-icon-wrapper">${r.icon || '✨'}</div>
          <h4 class="reason-title">${r.title || 'Reason'}</h4>
          <p class="reason-text">${r.text || ''}</p>
        </div>
      `).join('')}
    </div>
  `;

  // Start Live Counter
  const start = new Date(startDateStr).getTime() || new Date('2023-09-21').getTime();
  const dEl = container.querySelector('#days-val');
  const hEl = container.querySelector('#hours-val');
  const mEl = container.querySelector('#mins-val');
  const sEl = container.querySelector('#secs-val');

  function updateCounter() {
    const now = Date.now();
    const diff = Math.max(0, now - start);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    if (dEl) dEl.textContent = days;
    if (hEl) hEl.textContent = hours;
    if (mEl) mEl.textContent = mins;
    if (sEl) sEl.textContent = secs;
  }

  setInterval(updateCounter, 1000);
  updateCounter();

  // Click reason card for sparkle chime
  container.querySelectorAll('.reason-card').forEach(card => {
    card.addEventListener('click', () => {
      if (window.playCuteChime) window.playCuteChime();
      if (window.triggerConfetti) window.triggerConfetti();
    });
  });
}

window.initReasons = initReasons;
