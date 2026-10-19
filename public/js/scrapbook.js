// DOS LAXMI - Scrapbook Controller & Lightbox

function initScrapbook(pages = []) {
  const container = document.getElementById('scrapbook-container');
  const tabsContainer = document.getElementById('scrapbook-tabs');
  const modal = document.getElementById('lightbox-modal');
  if (!container) return;

  if (!pages || pages.length === 0) {
    container.innerHTML = '<p class="text-center" style="color:var(--color-text-muted);">No scrapbook memories added yet.</p>';
    return;
  }

  // Render tabs
  let activeTab = 'all';
  if (tabsContainer) {
    tabsContainer.innerHTML = `
      <button class="scrapbook-tab-btn active" data-tab="all">All Memories ✨</button>
      ${pages.map((p, idx) => `<button class="scrapbook-tab-btn" data-tab="${p.id || 'p-' + idx}">${p.title ? p.title.split('•')[0].trim() : 'Page ' + (idx + 1)}</button>`).join('')}
    `;

    tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.scrapbook-tab-btn');
      if (btn) {
        tabsContainer.querySelectorAll('.scrapbook-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.getAttribute('data-tab');
        renderCards();
      }
    });
  }

  function renderCards() {
    const filtered = activeTab === 'all' ? pages : pages.filter((p, idx) => (p.id || 'p-' + idx) === activeTab);

    container.innerHTML = `
      <div class="scrapbook-grid">
        ${filtered.map((item, idx) => {
          const rot = item.rotation !== undefined ? item.rotation : ((idx % 3 - 1) * 2.5);
          return `
            <div class="polaroid-card" style="--rot: ${rot}deg;" data-idx="${idx}" data-id="${item.id}">
              <div class="washi-tape"></div>
              <div class="polaroid-img-wrapper">
                <img src="${item.photoUrl || '/assets/images/laxmi_sharmeeli.jpg'}" alt="${item.alt || item.title || 'Laxmi memory'}" class="polaroid-img" loading="lazy" />
              </div>
              <div class="polaroid-details">
                <div class="polaroid-header">
                  <span class="polaroid-date">${item.date || 'Timeless'}</span>
                  ${item.sticker ? `<span class="polaroid-sticker">${item.sticker}</span>` : ''}
                </div>
                <h3 class="polaroid-title">${item.title || 'Memory'}</h3>
                <p class="polaroid-caption">${item.caption || ''}</p>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Click on polaroid to open lightbox
    container.querySelectorAll('.polaroid-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const item = pages.find(p => p.id === id) || pages[parseInt(card.getAttribute('data-idx'), 10)];
        if (item) openLightbox(item);
      });
    });
  }

  function openLightbox(item) {
    if (!modal) return;
    const imgEl = modal.querySelector('#lightbox-img');
    const titleEl = modal.querySelector('#lightbox-title');
    const dateEl = modal.querySelector('#lightbox-date');
    const captionEl = modal.querySelector('#lightbox-caption');
    const stickerEl = modal.querySelector('#lightbox-sticker');

    if (imgEl) imgEl.src = item.photoUrl || '';
    if (titleEl) titleEl.textContent = item.title || '';
    if (dateEl) dateEl.textContent = item.date || '';
    if (captionEl) captionEl.textContent = item.caption || '';
    if (stickerEl) {
      if (item.sticker) {
        stickerEl.textContent = item.sticker;
        stickerEl.style.display = 'inline-block';
      } else {
        stickerEl.style.display = 'none';
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('.lightbox-close-btn')) {
        closeLightbox();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  // Initial render
  renderCards();
}

window.initScrapbook = initScrapbook;
