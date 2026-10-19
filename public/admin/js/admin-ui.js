// DOS LAXMI - Admin Portal UI & Content Management Engine

let currentDraft = null;
let currentSummary = null;
let mediaList = [];
let activeTab = 'overview';

async function initDashboardUI() {
  console.log('[Admin UI] Initializing dashboard interface...');
  setupNavigation();
  setupTopbarActions();
  await refreshAllData();
}

// 1. Fetch Draft Data, Media, & Summary
async function refreshAllData() {
  try {
    const [draftRes, summaryRes, mediaRes] = await Promise.all([
      AdminAPI.getDraftContent(),
      AdminAPI.getSummary(),
      AdminAPI.getMediaList()
    ]);

    currentDraft = draftRes.content;
    currentSummary = summaryRes.summary;
    mediaList = mediaRes.media || [];

    updateTopbarStatus();
    renderCurrentTab();
  } catch (err) {
    window.showToast('Failed to load dashboard data: ' + err.message, 'error');
  }
}

// 2. Navigation Sidebar
function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

function switchTab(tabName) {
  activeTab = tabName;
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
  });

  const pageTitle = document.getElementById('admin-page-title');
  const titleMap = {
    overview: 'Dashboard Overview',
    photos: 'Photo Management',
    scrapbook: 'Scrapbook Album Manager',
    videos: 'Video Library',
    music: 'Music & Jukebox Playlist',
    arcade: 'Love Arcade & Games',
    reasons: 'Reasons Why I Love You',
    typography: 'Cinematic Typography',
    questions: 'Questions & Quiz Editor',
    letter: 'Birthday Letter & Signature',
    theme: 'Theme & Section Order',
    publish: 'Save & Publish Workflow'
  };
  if (pageTitle) pageTitle.textContent = titleMap[tabName] || 'Dashboard';

  renderCurrentTab();
}

function renderCurrentTab() {
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  const currentPanel = document.getElementById(`tab-${activeTab}`);
  if (!currentPanel) return;

  currentPanel.classList.add('active');

  switch (activeTab) {
    case 'overview': renderOverview(); break;
    case 'photos': renderPhotosTab(); break;
    case 'scrapbook': renderScrapbookTab(); break;
    case 'videos': renderVideosTab(); break;
    case 'music': renderMusicTab(); break;
    case 'arcade': renderArcadeTab(); break;
    case 'reasons': renderReasonsTab(); break;
    case 'typography': renderTypographyTab(); break;
    case 'questions': renderQuestionsTab(); break;
    case 'letter': renderLetterTab(); break;
    case 'theme': renderThemeTab(); break;
    case 'publish': renderPublishTab(); break;
  }
}

// 3. Topbar Status & Actions
function updateTopbarStatus() {
  const badge = document.getElementById('topbar-status-badge');
  if (!badge || !currentSummary) return;

  if (currentSummary.hasUnpublishedChanges) {
    badge.className = 'status-badge draft';
    badge.innerHTML = '● Unpublished Draft Changes';
  } else {
    badge.className = 'status-badge published';
    badge.innerHTML = `✓ Published (v${currentSummary.publishedVersion || 1})`;
  }
}

function setupTopbarActions() {
  const saveBtn = document.getElementById('btn-save-draft');
  const previewBtn = document.getElementById('btn-preview-draft');
  const publishBtn = document.getElementById('btn-publish-live');
  const discardBtn = document.getElementById('btn-discard-draft');

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveDraftChanges(true);
    });
  }

  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      openLivePreview();
    });
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      await publishDraftLive();
    });
  }

  if (discardBtn) {
    discardBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to discard all unpublished draft changes and revert to the published version?')) {
        try {
          const res = await AdminAPI.discardDraft();
          currentDraft = res.content;
          window.showToast('Unpublished changes discarded.', 'info');
          await refreshAllData();
        } catch (err) {
          window.showToast('Error discarding draft: ' + err.message, 'error');
        }
      }
    });
  }
}

async function saveDraftChanges(showNotification = true) {
  try {
    collectFormInputs();
    const res = await AdminAPI.saveDraftContent(currentDraft);
    currentDraft = res.content;
    if (showNotification) window.showToast('Draft saved successfully! ✨', 'success');
    const summaryRes = await AdminAPI.getSummary();
    currentSummary = summaryRes.summary;
    updateTopbarStatus();
  } catch (err) {
    window.showToast('Failed to save draft: ' + err.message, 'error');
  }
}

async function publishDraftLive() {
  try {
    await saveDraftChanges(false);
    const res = await AdminAPI.publishContent();
    window.showToast(`🎉 Website Published Live! (v${res.version})`, 'success');
    const summaryRes = await AdminAPI.getSummary();
    currentSummary = summaryRes.summary;
    updateTopbarStatus();
    renderCurrentTab();
  } catch (err) {
    window.showToast('Publish failed: ' + err.message, 'error');
  }
}

// 4. Live Preview Modal
function openLivePreview() {
  const modal = document.getElementById('preview-modal');
  const iframe = document.getElementById('preview-iframe');
  if (!modal || !iframe) return;

  iframe.src = '/?preview=true&t=' + Date.now();
  modal.classList.add('active');
}

function closeLivePreview() {
  const modal = document.getElementById('preview-modal');
  const iframe = document.getElementById('preview-iframe');
  if (modal) modal.classList.remove('active');
  if (iframe) iframe.src = 'about:blank';
}

// ==========================================================================
// TAB RENDERERS
// ==========================================================================

// TAB: Overview
function renderOverview() {
  const panel = document.getElementById('tab-overview');
  if (!panel || !currentSummary) return;

  const lastPub = currentSummary.lastPublishedAt 
    ? new Date(currentSummary.lastPublishedAt).toLocaleString() 
    : 'Never';

  panel.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon">📸</div>
        <div>
          <div class="stat-value">${currentSummary.totalPhotos}</div>
          <div class="stat-label">Uploaded Photos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div>
          <div class="stat-value">${currentSummary.scrapbookPages}</div>
          <div class="stat-label">Scrapbook Pages</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎮</div>
        <div>
          <div class="stat-value">2</div>
          <div class="stat-label">Arcade Games Active</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎵</div>
        <div>
          <div class="stat-value" style="font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
            ${currentDraft?.music?.trackTitle || 'Sharmeeli'}
          </div>
          <div class="stat-label">Active Music Track</div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <h3 class="card-title">Live Website Status</h3>
      <p class="card-desc">Current publishing state of the DOS LAXMI birthday website.</p>
      
      <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.25); padding: 1.5rem; border-radius: 14px; border: 1px solid var(--admin-card-border);">
        <div>
          <div style="font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 0.25rem;">Content Version</div>
          <div style="font-size: 1.4rem; font-weight: 700; color: #fff;">Version ${currentSummary.publishedVersion || 1}</div>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 0.25rem;">Last Published Date</div>
          <div style="font-size: 1.1rem; font-weight: 600; color: var(--admin-secondary);">${lastPub}</div>
        </div>
        <div>
          <div style="font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 0.25rem;">Sync State</div>
          <div>${currentSummary.hasUnpublishedChanges ? '<span class="status-badge draft">Unpublished Draft Changes</span>' : '<span class="status-badge published">✓ Live & In Sync</span>'}</div>
        </div>
        <div style="display: flex; gap: 10px;">
          <a href="/" target="_blank" class="btn-topbar btn-save-draft">Visit Public Site ↗</a>
          <button class="btn-topbar btn-preview" onclick="openLivePreview()">Interactive Preview 👁️</button>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <h3 class="card-title">Quick Actions for Aryan</h3>
      <p class="card-desc">Direct shortcuts to manage birthday content.</p>
      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <button class="btn-topbar btn-save-draft" onclick="switchTab('photos')">Upload Photos 📸</button>
        <button class="btn-topbar btn-save-draft" onclick="switchTab('scrapbook')">Edit Scrapbook 📖</button>
        <button class="btn-topbar btn-save-draft" onclick="switchTab('music')">Manage Playlist 🎧</button>
        <button class="btn-topbar btn-save-draft" onclick="switchTab('reasons')">Edit Reasons I Love You ✨</button>
        <button class="btn-topbar btn-save-draft" onclick="switchTab('arcade')">Love Arcade Settings 🕹️</button>
        <button class="btn-topbar btn-save-draft" onclick="switchTab('letter')">Edit Birthday Letter 💌</button>
      </div>
    </div>
  `;
}

// TAB: Photos
function renderPhotosTab() {
  const panel = document.getElementById('tab-photos');
  if (!panel) return;

  const photos = mediaList.filter(m => m.type === 'photo');

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Upload Photos</h3>
      <p class="card-desc">Drag and drop multiple photos simultaneously or click to browse. Supports JPG, PNG, WEBP, GIF up to 25MB.</p>

      <div class="upload-dropzone" id="photo-dropzone">
        <div class="dropzone-icon">🖼️</div>
        <div class="dropzone-text">Drop photos here or click to browse</div>
        <div class="dropzone-hint">Upload high-resolution pictures of Laxmi, memories, and celebrations</div>
        <input type="file" id="photo-file-input" multiple accept="image/*" style="display: none;">
      </div>

      <div id="photo-upload-progress" style="display: none; margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.4rem;">
          <span id="upload-progress-status">Uploading files...</span>
          <span id="upload-progress-pct">0%</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
          <div id="upload-progress-bar" style="width: 0%; height: 100%; background: var(--admin-primary); transition: width 0.2s;"></div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 class="card-title">Photo Library (${photos.length})</h3>
        <span style="font-size: 0.85rem; color: var(--admin-text-muted);">Assign photos to scrapbook pages or set as Hero image</span>
      </div>

      <div class="admin-media-grid" id="photo-library-grid">
        ${photos.map((p, idx) => `
          <div class="media-card" data-id="${p.id}" data-idx="${idx}">
            <div class="media-thumbnail-wrap">
              <img src="${p.url}" alt="${p.altText || p.title}" loading="lazy">
              ${p.isHero || currentDraft?.meta?.heroPhotoUrl === p.url ? '<div class="media-hero-badge">Hero Image</div>' : ''}
              <div class="media-actions-overlay">
                <button class="btn-icon-sm" onclick="setPhotoAsHero('${p.url}')" title="Set as Hero Image">👑</button>
                <button class="btn-icon-sm delete" onclick="confirmDeleteMedia('${p.id}')" title="Delete Photo">🗑️</button>
              </div>
            </div>
            <div class="media-card-info">
              <div>
                <div class="media-card-title">${p.title || 'Untitled Photo'}</div>
                <div class="media-card-caption">${p.caption || 'No caption'}</div>
              </div>
              <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--admin-text-dim);">
                <span>${p.scrapbookPageId ? 'Assigned' : 'Library'}</span>
                <button class="btn-topbar" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="addPhotoToScrapbook('${p.url}', '${(p.title || '').replace(/'/g, "\\'")}', '${(p.caption || '').replace(/'/g, "\\'")}')">+ Scrapbook</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  setupPhotoUploadHandlers();
}

function setupPhotoUploadHandlers() {
  const dropzone = document.getElementById('photo-dropzone');
  const fileInput = document.getElementById('photo-file-input');
  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files, 'photo');
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFilesUpload(fileInput.files, 'photo');
    }
  });
}

async function handleFilesUpload(files, type) {
  const progressBox = document.getElementById('photo-upload-progress');
  const progressBar = document.getElementById('upload-progress-bar');
  const progressPct = document.getElementById('upload-progress-pct');

  if (progressBox) progressBox.style.display = 'block';

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }
  formData.append('type', type);

  try {
    const res = await AdminAPI.uploadFiles(formData, (pct) => {
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressPct) progressPct.textContent = `${pct}%`;
    });

    window.showToast(res.message || 'Files uploaded successfully!', 'success');
    await refreshAllData();
  } catch (err) {
    window.showToast('Upload error: ' + err.message, 'error');
  } finally {
    if (progressBox) progressBox.style.display = 'none';
  }
}

async function setPhotoAsHero(url) {
  if (!currentDraft) return;
  currentDraft.meta.heroPhotoUrl = url;
  await saveDraftChanges(true);
  renderCurrentTab();
  window.showToast('Hero portrait photo updated! ✨', 'success');
}

function addPhotoToScrapbook(url, title, caption) {
  if (!currentDraft) return;
  if (!currentDraft.scrapbook) currentDraft.scrapbook = { pages: [] };
  if (!currentDraft.scrapbook.pages) currentDraft.scrapbook.pages = [];

  const newPage = {
    id: `page-${Date.now()}`,
    title: title || "A Beautiful Memory",
    date: "Special Date",
    photoUrl: url,
    alt: title || "Laxmi memory",
    caption: caption || "Captured forever in our hearts.",
    sticker: "✨ Cutest",
    rotation: Math.floor(Math.random() * 6 - 3)
  };

  currentDraft.scrapbook.pages.push(newPage);
  saveDraftChanges(true);
  window.showToast('Added photo as a new Scrapbook memory page!', 'success');
}

// TAB: Scrapbook
function renderScrapbookTab() {
  const panel = document.getElementById('tab-scrapbook');
  if (!panel || !currentDraft) return;

  const pages = currentDraft.scrapbook?.pages || [];

  panel.innerHTML = `
    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 class="card-title">Scrapbook Pages (${pages.length})</h3>
          <p class="card-desc">Add, edit, reorder, or delete scrapbook memory polaroids.</p>
        </div>
        <button class="btn-topbar btn-publish" onclick="addNewScrapbookPage()">+ Add New Memory Page</button>
      </div>

      <div class="form-group">
        <label class="form-label">Scrapbook Section Title</label>
        <input type="text" class="form-input" id="scrapbook-title" value="${currentDraft.scrapbook?.title || 'Our Scrapbook of Memories 📖'}">
      </div>
      <div class="form-group">
        <label class="form-label">Scrapbook Subtitle</label>
        <input type="text" class="form-input" id="scrapbook-subtitle" value="${currentDraft.scrapbook?.subtitle || ''}">
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem;">
        ${pages.map((p, idx) => `
          <div class="admin-card" style="margin-bottom: 0; background: rgba(14, 9, 22, 0.7); border: 1px solid var(--admin-card-border); padding: 1.5rem;">
            <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
              <div style="width: 140px; height: 140px; border-radius: 10px; overflow: hidden; background: #000; flex-shrink: 0;">
                <img src="${p.photoUrl || '/assets/images/laxmi_sharmeeli.jpg'}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                  <span style="font-weight: 700; color: var(--admin-secondary);">Page ${idx + 1}</span>
                  <div style="display: flex; gap: 8px;">
                    ${idx > 0 ? `<button class="btn-topbar btn-save-draft" style="padding: 0.2rem 0.6rem;" onclick="moveScrapbookPage(${idx}, -1)">▲</button>` : ''}
                    ${idx < pages.length - 1 ? `<button class="btn-topbar btn-save-draft" style="padding: 0.2rem 0.6rem;" onclick="moveScrapbookPage(${idx}, 1)">▼</button>` : ''}
                    <button class="btn-topbar btn-discard" style="padding: 0.2rem 0.6rem;" onclick="deleteScrapbookPage(${idx})">Delete</button>
                  </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 0.75rem;">
                  <div>
                    <label class="form-label">Memory Title</label>
                    <input type="text" class="form-input page-input-title" data-idx="${idx}" value="${p.title || ''}">
                  </div>
                  <div>
                    <label class="form-label">Date / Tag</label>
                    <input type="text" class="form-input page-input-date" data-idx="${idx}" value="${p.date || ''}">
                  </div>
                </div>
                <div style="margin-bottom: 0.75rem;">
                  <label class="form-label">Handwritten Caption Note</label>
                  <textarea class="form-textarea page-input-caption" data-idx="${idx}" rows="2">${p.caption || ''}</textarea>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div>
                    <label class="form-label">Cute Sticker</label>
                    <input type="text" class="form-input page-input-sticker" data-idx="${idx}" value="${p.sticker || '✨ Cutest'}">
                  </div>
                  <div>
                    <label class="form-label">Photo URL</label>
                    <input type="text" class="form-input page-input-url" data-idx="${idx}" value="${p.photoUrl || ''}">
                  </div>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addNewScrapbookPage() {
  if (!currentDraft.scrapbook) currentDraft.scrapbook = { pages: [] };
  const photos = mediaList.filter(m => m.type === 'photo');
  const sampleUrl = photos.length > 0 ? photos[0].url : '/assets/images/laxmi_sharmeeli.jpg';

  currentDraft.scrapbook.pages.push({
    id: `page-${Date.now()}`,
    title: "New Sweet Memory",
    date: "Recent Date",
    photoUrl: sampleUrl,
    caption: "A magical moment we will never forget.",
    sticker: "💖 Magic",
    rotation: -2
  });

  renderScrapbookTab();
  window.showToast('New scrapbook page added! Edit the details above.', 'info');
}

function deleteScrapbookPage(idx) {
  if (confirm('Delete this memory page from the scrapbook?')) {
    currentDraft.scrapbook.pages.splice(idx, 1);
    renderScrapbookTab();
    window.showToast('Page removed from scrapbook.', 'info');
  }
}

function moveScrapbookPage(idx, dir) {
  const pages = currentDraft.scrapbook.pages;
  const target = idx + dir;
  if (target < 0 || target >= pages.length) return;
  const temp = pages[idx];
  pages[idx] = pages[target];
  pages[target] = temp;
  renderScrapbookTab();
}

// TAB: Videos
function renderVideosTab() {
  const panel = document.getElementById('tab-videos');
  if (!panel) return;

  const videos = mediaList.filter(m => m.type === 'video');

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Video Management</h3>
      <p class="card-desc">Upload MP4 or WebM videos to feature in the cinematic typography background or video section.</p>

      <div class="upload-dropzone" id="video-dropzone">
        <div class="dropzone-icon">🎬</div>
        <div class="dropzone-text">Drop video file here or click to browse</div>
        <div class="dropzone-hint">Supports MP4, WebM up to 100MB</div>
        <input type="file" id="video-file-input" accept="video/mp4,video/webm" style="display: none;">
      </div>
    </div>

    <div class="admin-card">
      <h3 class="card-title">Video Library (${videos.length})</h3>
      <p class="card-desc">Active video for Cinematic Typography: <strong>${currentDraft?.typography?.videoUrl || 'Animated Glowing Aura Mesh (Default)'}</strong></p>

      <div class="admin-media-grid">
        ${videos.map((v) => `
          <div class="media-card" data-id="${v.id}">
            <div class="media-thumbnail-wrap" style="height: 200px;">
              <video src="${v.url}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>
            </div>
            <div class="media-card-info">
              <div>
                <div class="media-card-title">${v.title || v.originalName}</div>
                <div class="media-card-caption">${v.caption || 'No caption'}</div>
              </div>
              <div style="margin-top: 1rem; display: flex; gap: 8px;">
                <button class="btn-topbar btn-save-draft" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="setVideoForTypography('${v.url}')">Use for Typography 🎬</button>
                <button class="btn-topbar btn-discard" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;" onclick="confirmDeleteMedia('${v.id}')">Delete</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      ${videos.length === 0 ? '<p style="color:var(--admin-text-muted); text-align:center; padding: 2rem;">No videos uploaded yet. The cinematic section will use the glowing celestial aura animation.</p>' : ''}
    </div>
  `;

  const dropzone = document.getElementById('video-dropzone');
  const fileInput = document.getElementById('video-file-input');
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFilesUpload(fileInput.files, 'video');
      }
    });
  }
}

function setVideoForTypography(url) {
  if (!currentDraft.typography) currentDraft.typography = {};
  currentDraft.typography.videoUrl = url;
  saveDraftChanges(true);
  window.showToast('Selected video set as Cinematic Typography background!', 'success');
  renderVideosTab();
}

// TAB: Music
function renderMusicTab() {
  const panel = document.getElementById('tab-music');
  if (!panel || !currentDraft) return;

  const music = currentDraft.music || {};
  const playlist = music.playlist || [];

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Music & Vinyl Jukebox Playlist</h3>
      <p class="card-desc">Manage the romantic songs for Laxmi's birthday website (including her favorites like <em>Sharmeeli</em> and <em>Maula Mere Maula</em>).</p>

      <div style="margin-bottom: 2rem;">
        <label class="form-label">Active Jukebox Playlist:</label>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${playlist.map((tr, idx) => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 1rem 1.25rem; border-radius: 12px; border: 1px solid var(--admin-card-border);">
              <div>
                <strong style="color: #fff; font-size: 1.05rem;">${tr.title}</strong>
                <span style="color: var(--admin-secondary); font-size: 0.85rem; margin-left: 8px;">— ${tr.artist}</span>
                <div style="color: var(--admin-text-muted); font-size: 0.8rem; margin-top: 4px;">Lyrics snippet: <em>"${tr.lyrics || ''}"</em></div>
              </div>
              <div style="display: flex; gap: 8px;">
                <button class="btn-topbar ${music.audioUrl === tr.url ? 'btn-publish' : 'btn-save-draft'}" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="setActiveTrack('${tr.url}', '${tr.title}', '${tr.artist}')">
                  ${music.audioUrl === tr.url ? 'Active Now ✓' : 'Set Active'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="upload-dropzone" id="audio-dropzone" style="padding: 2rem; margin: 1.5rem 0;">
        <div class="dropzone-icon">🎵</div>
        <div class="dropzone-text">Upload New Song (MP3 or WAV)</div>
        <div class="dropzone-hint">Upload custom song or dedication for Laxmi</div>
        <input type="file" id="audio-file-input" accept="audio/*" style="display: none;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <div>
          <label class="form-label">Default Volume: <span id="volume-val">${Math.round((music.defaultVolume ?? 0.75) * 100)}%</span></label>
          <input type="range" min="0" max="1" step="0.05" class="form-input" id="music-volume" value="${music.defaultVolume ?? 0.75}" style="padding: 0;">
        </div>
        <div>
          <label class="form-label">Show Floating Audio Player Widget</label>
          <select class="form-select" id="music-show-controls">
            <option value="true" ${music.showControls !== false ? 'selected' : ''}>Enabled (Visible)</option>
            <option value="false" ${music.showControls === false ? 'selected' : ''}>Hidden</option>
          </select>
        </div>
      </div>
    </div>
  `;

  const dropzone = document.getElementById('audio-dropzone');
  const fileInput = document.getElementById('audio-file-input');
  const volInput = document.getElementById('music-volume');
  const volVal = document.getElementById('volume-val');

  if (volInput && volVal) {
    volInput.addEventListener('input', () => {
      volVal.textContent = `${Math.round(volInput.value * 100)}%`;
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFilesUpload(fileInput.files, 'audio');
      }
    });
  }
}

function setActiveTrack(url, title, artist) {
  if (!currentDraft.music) currentDraft.music = {};
  currentDraft.music.audioUrl = url;
  currentDraft.music.trackTitle = title;
  currentDraft.music.trackArtist = artist;
  saveDraftChanges(true);
  renderMusicTab();
  window.showToast(`Set "${title}" as default active song! 🎶`, 'success');
}

// TAB: Arcade
function renderArcadeTab() {
  const panel = document.getElementById('tab-arcade');
  if (!panel || !currentDraft) return;

  const fortunes = currentDraft.fortunes || [];

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Love Arcade & Mini-Games</h3>
      <p class="card-desc">Configure the falling treasure game and custom love fortune predictions.</p>

      <div style="margin-bottom: 2rem;">
        <label class="form-label">Fortune Cookie Love Predictions (${fortunes.length})</label>
        <p style="font-size: 0.85rem; color: var(--admin-text-muted); margin-bottom: 1rem;">
          These are the romantic slips of paper that appear when Laxmi cracks open the 3D golden fortune cookie!
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${fortunes.map((f, idx) => `
            <div style="display: flex; gap: 10px;">
              <input type="text" class="form-input fortune-item-input" data-idx="${idx}" value="${f}">
              <button class="btn-topbar btn-discard" style="padding: 0.2rem 0.7rem;" onclick="deleteFortune(${idx})">✕</button>
            </div>
          `).join('')}
        </div>
        <button class="btn-topbar btn-publish" style="margin-top: 1rem;" onclick="addFortune()">+ Add Fortune Prediction</button>
      </div>
    </div>
  `;
}

function addFortune() {
  if (!currentDraft.fortunes) currentDraft.fortunes = [];
  currentDraft.fortunes.push("Special Promise: 1 unconditional romantic dinner date with Aryan! 🍷");
  renderArcadeTab();
}

function deleteFortune(idx) {
  currentDraft.fortunes.splice(idx, 1);
  renderArcadeTab();
}

// TAB: Reasons
function renderReasonsTab() {
  const panel = document.getElementById('tab-reasons');
  if (!panel || !currentDraft) return;

  const reasons = currentDraft.reasons?.items || [];

  panel.innerHTML = `
    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 class="card-title">Reasons Why I Love You (${reasons.length})</h3>
          <p class="card-desc">The glowing starlight cards celebrating everything that makes Laxmi special to Aryan.</p>
        </div>
        <button class="btn-topbar btn-publish" onclick="addReason()">+ Add Reason</button>
      </div>

      <div class="form-group">
        <label class="form-label">Love Journey Start Date (Anniversary / First Day)</label>
        <input type="datetime-local" class="form-input" id="meta-start-date" value="${(currentDraft.meta?.startDate || '2023-09-21T00:00:00').substring(0, 16)}">
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem;">
        ${reasons.map((r, idx) => `
          <div class="admin-card" style="margin-bottom: 0; background: rgba(14, 9, 22, 0.7); border: 1px solid var(--admin-card-border); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-weight: 700; color: var(--admin-secondary);">Card #${idx + 1}</span>
              <button class="btn-topbar btn-discard" style="padding: 0.2rem 0.6rem;" onclick="deleteReason(${idx})">Delete</button>
            </div>
            <div style="display: grid; grid-template-columns: 80px 1fr; gap: 1rem; margin-bottom: 0.75rem;">
              <div>
                <label class="form-label">Icon</label>
                <input type="text" class="form-input reason-icon-input" data-idx="${idx}" value="${r.icon || '✨'}">
              </div>
              <div>
                <label class="form-label">Title</label>
                <input type="text" class="form-input reason-title-input" data-idx="${idx}" value="${r.title || ''}">
              </div>
            </div>
            <div>
              <label class="form-label">Loving Note</label>
              <textarea class="form-textarea reason-text-input" data-idx="${idx}" rows="2">${r.text || ''}</textarea>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addReason() {
  if (!currentDraft.reasons) currentDraft.reasons = { items: [] };
  currentDraft.reasons.items.push({
    id: `r-${Date.now()}`,
    title: "New Reason",
    icon: "💖",
    text: "Another reason why you mean the entire world to me."
  });
  renderReasonsTab();
}

function deleteReason(idx) {
  currentDraft.reasons.items.splice(idx, 1);
  renderReasonsTab();
}

// TAB: Typography
function renderTypographyTab() {
  const panel = document.getElementById('tab-typography');
  if (!panel || !currentDraft) return;

  const phrases = currentDraft.typography?.phrases || [];

  panel.innerHTML = `
    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 class="card-title">Cinematic Typography Lines (${phrases.length})</h3>
          <p class="card-desc">Animated word slides celebrating Laxmi's beauty, spirit, and love.</p>
        </div>
        <button class="btn-topbar btn-publish" onclick="addTypographySlide()">+ Add Slide</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${phrases.map((p, idx) => `
          <div class="admin-card" style="margin-bottom: 0; background: rgba(14, 9, 22, 0.7); border: 1px solid var(--admin-card-border); padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <span style="font-weight: 700; color: var(--admin-secondary);">Slide ${idx + 1}</span>
              <button class="btn-topbar btn-discard" style="padding: 0.2rem 0.6rem;" onclick="deleteTypographySlide(${idx})">Delete</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 1rem; margin-bottom: 0.75rem;">
              <div>
                <label class="form-label">Leading Text</label>
                <input type="text" class="form-input typo-lead-input" data-idx="${idx}" value="${p.lead || ''}">
              </div>
              <div>
                <label class="form-label">Highlighted Word</label>
                <input type="text" class="form-input typo-high-input" data-idx="${idx}" value="${p.highlight || ''}">
              </div>
            </div>
            <div>
              <label class="form-label">Subline Note</label>
              <input type="text" class="form-input typo-sub-input" data-idx="${idx}" value="${p.sub || ''}">
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addTypographySlide() {
  if (!currentDraft.typography) currentDraft.typography = { phrases: [] };
  currentDraft.typography.phrases.push({
    lead: "YOU ARE",
    highlight: "MY EVERYTHING",
    sub: "Every moment with you is my favorite memory"
  });
  renderTypographyTab();
}

function deleteTypographySlide(idx) {
  currentDraft.typography.phrases.splice(idx, 1);
  renderTypographyTab();
}

// TAB: Questions
function renderQuestionsTab() {
  const panel = document.getElementById('tab-questions');
  if (!panel || !currentDraft) return;

  const items = currentDraft.questions?.items || [];

  panel.innerHTML = `
    <div class="admin-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h3 class="card-title">Love & Playful Quiz Questions (${items.length})</h3>
          <p class="card-desc">Interactive quiz for Laxmi with custom personalized responses for each answer.</p>
        </div>
        <button class="btn-topbar btn-publish" onclick="addQuizQuestion()">+ Add Question</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 2rem;">
        ${items.map((q, qIdx) => `
          <div class="admin-card" style="margin-bottom: 0; background: rgba(14, 9, 22, 0.7); border: 1px solid var(--admin-card-border); padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span style="font-weight: 700; color: var(--admin-secondary);">Question ${qIdx + 1}</span>
              <button class="btn-topbar btn-discard" style="padding: 0.2rem 0.6rem;" onclick="deleteQuizQuestion(${qIdx})">Delete Question</button>
            </div>
            <div style="margin-bottom: 1.25rem;">
              <label class="form-label">Question Text</label>
              <input type="text" class="form-input quiz-q-text" data-qidx="${qIdx}" value="${q.question || ''}">
            </div>

            <label class="form-label">Choices & Custom Responses:</label>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${(q.options || []).map((opt, oIdx) => `
                <div style="display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 0.75rem; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: 10px;">
                  <input type="text" class="form-input quiz-opt-text" data-qidx="${qIdx}" data-oidx="${oIdx}" placeholder="Choice ${String.fromCharCode(65 + oIdx)}" value="${opt.text || ''}">
                  <input type="text" class="form-input quiz-opt-resp" data-qidx="${qIdx}" data-oidx="${oIdx}" placeholder="Aryan's Custom Response Toast" value="${opt.response || ''}">
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addQuizQuestion() {
  if (!currentDraft.questions) currentDraft.questions = { items: [] };
  currentDraft.questions.items.push({
    id: `q-${Date.now()}`,
    question: "What is our next dream adventure together?",
    options: [
      { text: "Beach sunset & sea breeze", response: "Packed and ready! Let's go! 🌊✨" },
      { text: "Mountain cabin under the stars", response: "Hot cocoa and cozy blankets confirmed! 🏔️☕" },
      { text: "Late night city food tour", response: "My favorite kind of date with my favorite person! 🍕🚗" },
      { text: "Anywhere, as long as we're together", response: "The most beautiful answer in the world! ❤️" }
    ]
  });
  renderQuestionsTab();
}

function deleteQuizQuestion(idx) {
  currentDraft.questions.items.splice(idx, 1);
  renderQuestionsTab();
}

// TAB: Letter
function renderLetterTab() {
  const panel = document.getElementById('tab-letter');
  if (!panel || !currentDraft) return;

  const letter = currentDraft.letter || {};

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Aryan's Personal Birthday Letter</h3>
      <p class="card-desc">The heartfelt letter that unfolds from the vintage wax-sealed envelope.</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
        <div>
          <label class="form-label">Wax Seal Monogram / Initials</label>
          <input type="text" class="form-input" id="letter-seal-text" value="${letter.waxSealText || 'L & A'}">
        </div>
        <div>
          <label class="form-label">Salutation</label>
          <input type="text" class="form-input" id="letter-salutation" value="${letter.salutation || 'My Dearest Laxmi,'}">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Letter Body (Formatted text)</label>
        <textarea class="form-textarea" id="letter-body" rows="12" style="font-family: var(--admin-font); line-height: 1.6;">${letter.body || ''}</textarea>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
        <div>
          <label class="form-label">Closing Phrase</label>
          <input type="text" class="form-input" id="letter-closing" value="${letter.closing || 'Forever & Always Yours,'}">
        </div>
        <div>
          <label class="form-label">Signature Text (Defaults to Aryan)</label>
          <input type="text" class="form-input" id="letter-signature" value="${letter.signature || 'Aryan'}">
        </div>
        <div>
          <label class="form-label">Date Stamp</label>
          <input type="text" class="form-input" id="letter-date" value="${letter.date || 'October 2026'}">
        </div>
      </div>
    </div>
  `;
}

// TAB: Theme & Section Order
function renderThemeTab() {
  const panel = document.getElementById('tab-theme');
  if (!panel || !currentDraft) return;

  const theme = currentDraft.meta?.theme || {};
  const order = currentDraft.sectionOrder || ['hero', 'typography', 'jukebox', 'scrapbook', 'arcade', 'reasons', 'questions', 'surprises', 'letter', 'finale'];

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Theme & Color Palette</h3>
      <p class="card-desc">Adjust the romantic lighting and visual identity of the website.</p>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
        <div>
          <label class="form-label">Primary Color (Rose Gold)</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="color" id="theme-primary" value="${theme.primaryColor || '#e07a99'}" style="width: 50px; height: 42px; padding: 0; border: none; background: transparent; cursor: pointer;">
            <input type="text" class="form-input" id="theme-primary-text" value="${theme.primaryColor || '#e07a99'}">
          </div>
        </div>
        <div>
          <label class="form-label">Secondary Color (Champagne Gold)</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="color" id="theme-secondary" value="${theme.secondaryColor || '#f3c68f'}" style="width: 50px; height: 42px; padding: 0; border: none; background: transparent; cursor: pointer;">
            <input type="text" class="form-input" id="theme-secondary-text" value="${theme.secondaryColor || '#f3c68f'}">
          </div>
        </div>
        <div>
          <label class="form-label">Background Base Color</label>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input type="color" id="theme-bg" value="${theme.bgColor || '#0c0814'}" style="width: 50px; height: 42px; padding: 0; border: none; background: transparent; cursor: pointer;">
            <input type="text" class="form-input" id="theme-bg-text" value="${theme.bgColor || '#0c0814'}">
          </div>
        </div>
      </div>
    </div>

    <div class="admin-card">
      <h3 class="card-title">Section Order</h3>
      <p class="card-desc">Change the display order of sections on the live website.</p>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;" id="section-order-list">
        ${order.map((sec, idx) => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 0.75rem 1.25rem; border-radius: 10px; border: 1px solid var(--admin-card-border);">
            <span style="font-weight: 600; text-transform: capitalize;">${idx + 1}. ${sec} Section</span>
            <div style="display: flex; gap: 6px;">
              ${idx > 0 ? `<button class="btn-topbar btn-save-draft" style="padding: 0.2rem 0.5rem;" onclick="moveSectionOrder(${idx}, -1)">▲</button>` : ''}
              ${idx < order.length - 1 ? `<button class="btn-topbar btn-save-draft" style="padding: 0.2rem 0.5rem;" onclick="moveSectionOrder(${idx}, 1)">▼</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Color picker sync
  ['primary', 'secondary', 'bg'].forEach(key => {
    const picker = document.getElementById(`theme-${key}`);
    const text = document.getElementById(`theme-${key}-text`);
    if (picker && text) {
      picker.addEventListener('input', () => text.value = picker.value);
      text.addEventListener('input', () => picker.value = text.value);
    }
  });
}

function moveSectionOrder(idx, dir) {
  const order = currentDraft.sectionOrder;
  const target = idx + dir;
  if (target < 0 || target >= order.length) return;
  const temp = order[idx];
  order[idx] = order[target];
  order[target] = temp;
  renderThemeTab();
}

// TAB: Publish Settings
function renderPublishTab() {
  const panel = document.getElementById('tab-publish');
  if (!panel || !currentSummary) return;

  const lastPub = currentSummary.lastPublishedAt 
    ? new Date(currentSummary.lastPublishedAt).toLocaleString() 
    : 'Never';

  panel.innerHTML = `
    <div class="admin-card">
      <h3 class="card-title">Save & Publish Management</h3>
      <p class="card-desc">Manage drafts, review unpublished modifications, and publish live updates to the DOS LAXMI birthday website.</p>

      <div style="background: rgba(0,0,0,0.3); padding: 2rem; border-radius: 16px; border: 1px solid var(--admin-card-border); margin-bottom: 2rem;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <div>
            <div style="font-size: 0.9rem; color: var(--admin-text-muted);">Current Published Version</div>
            <div style="font-size: 2rem; font-weight: 700; color: #fff;">Version ${currentSummary.publishedVersion || 1}</div>
          </div>
          <div>
            <div style="font-size: 0.9rem; color: var(--admin-text-muted);">Last Published Timestamp</div>
            <div style="font-size: 1.25rem; font-weight: 600; color: var(--admin-secondary);">${lastPub}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <button class="btn-topbar btn-publish" style="padding: 0.85rem 1.8rem;" onclick="publishDraftLive()">Publish Live Now 🚀</button>
        <button class="btn-topbar btn-preview" style="padding: 0.85rem 1.8rem;" onclick="openLivePreview()">Preview Draft In Modal 👁️</button>
        <button class="btn-topbar btn-discard" style="padding: 0.85rem 1.8rem;" onclick="discardDraftChanges()">Discard Draft Changes ↺</button>
      </div>
    </div>
  `;
}

// Helper: Collect form inputs into currentDraft
function collectFormInputs() {
  if (!currentDraft) return;

  // Scrapbook inputs
  const sbTitle = document.getElementById('scrapbook-title');
  const sbSub = document.getElementById('scrapbook-subtitle');
  if (sbTitle && currentDraft.scrapbook) currentDraft.scrapbook.title = sbTitle.value;
  if (sbSub && currentDraft.scrapbook) currentDraft.scrapbook.subtitle = sbSub.value;

  document.querySelectorAll('.page-input-title').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.scrapbook?.pages[idx]) currentDraft.scrapbook.pages[idx].title = el.value;
  });
  document.querySelectorAll('.page-input-date').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.scrapbook?.pages[idx]) currentDraft.scrapbook.pages[idx].date = el.value;
  });
  document.querySelectorAll('.page-input-caption').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.scrapbook?.pages[idx]) currentDraft.scrapbook.pages[idx].caption = el.value;
  });
  document.querySelectorAll('.page-input-sticker').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.scrapbook?.pages[idx]) currentDraft.scrapbook.pages[idx].sticker = el.value;
  });
  document.querySelectorAll('.page-input-url').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.scrapbook?.pages[idx]) currentDraft.scrapbook.pages[idx].photoUrl = el.value;
  });

  // Music volume
  const mVol = document.getElementById('music-volume');
  const mShow = document.getElementById('music-show-controls');
  if (mVol && currentDraft.music) currentDraft.music.defaultVolume = parseFloat(mVol.value);
  if (mShow && currentDraft.music) currentDraft.music.showControls = mShow.value === 'true';

  // Fortunes
  const fortuneInputs = document.querySelectorAll('.fortune-item-input');
  if (fortuneInputs.length > 0) {
    currentDraft.fortunes = Array.from(fortuneInputs).map(i => i.value);
  }

  // Reasons
  document.querySelectorAll('.reason-icon-input').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.reasons?.items[idx]) currentDraft.reasons.items[idx].icon = el.value;
  });
  document.querySelectorAll('.reason-title-input').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.reasons?.items[idx]) currentDraft.reasons.items[idx].title = el.value;
  });
  document.querySelectorAll('.reason-text-input').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.reasons?.items[idx]) currentDraft.reasons.items[idx].text = el.value;
  });

  const startDateInput = document.getElementById('meta-start-date');
  if (startDateInput && currentDraft.meta) {
    currentDraft.meta.startDate = startDateInput.value;
  }

  // Typography inputs
  document.querySelectorAll('.typo-lead-input').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.typography?.phrases[idx]) currentDraft.typography.phrases[idx].lead = el.value;
  });
  document.querySelectorAll('.typo-high-input').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.typography?.phrases[idx]) currentDraft.typography.phrases[idx].highlight = el.value;
  });
  document.querySelectorAll('.typo-sub-input').forEach(el => {
    const idx = parseInt(el.getAttribute('data-idx'), 10);
    if (currentDraft.typography?.phrases[idx]) currentDraft.typography.phrases[idx].sub = el.value;
  });

  // Letter inputs
  const lSeal = document.getElementById('letter-seal-text');
  const lSalut = document.getElementById('letter-salutation');
  const lBody = document.getElementById('letter-body');
  const lClose = document.getElementById('letter-closing');
  const lSig = document.getElementById('letter-signature');
  const lDate = document.getElementById('letter-date');

  if (lSeal && currentDraft.letter) currentDraft.letter.waxSealText = lSeal.value;
  if (lSalut && currentDraft.letter) currentDraft.letter.salutation = lSalut.value;
  if (lBody && currentDraft.letter) currentDraft.letter.body = lBody.value;
  if (lClose && currentDraft.letter) currentDraft.letter.closing = lClose.value;
  if (lSig && currentDraft.letter) currentDraft.letter.signature = lSig.value;
  if (lDate && currentDraft.letter) currentDraft.letter.date = lDate.value;

  // Theme inputs
  const tPri = document.getElementById('theme-primary-text');
  const tSec = document.getElementById('theme-secondary-text');
  const tBg = document.getElementById('theme-bg-text');
  if (tPri && currentDraft.meta?.theme) currentDraft.meta.theme.primaryColor = tPri.value;
  if (tSec && currentDraft.meta?.theme) currentDraft.meta.theme.secondaryColor = tSec.value;
  if (tBg && currentDraft.meta?.theme) currentDraft.meta.theme.bgColor = tBg.value;

  // Quiz inputs
  document.querySelectorAll('.quiz-q-text').forEach(el => {
    const qIdx = parseInt(el.getAttribute('data-qidx'), 10);
    if (currentDraft.questions?.items[qIdx]) currentDraft.questions.items[qIdx].question = el.value;
  });
  document.querySelectorAll('.quiz-opt-text').forEach(el => {
    const qIdx = parseInt(el.getAttribute('data-qidx'), 10);
    const oIdx = parseInt(el.getAttribute('data-oidx'), 10);
    if (currentDraft.questions?.items[qIdx]?.options[oIdx]) {
      currentDraft.questions.items[qIdx].options[oIdx].text = el.value;
    }
  });
  document.querySelectorAll('.quiz-opt-resp').forEach(el => {
    const qIdx = parseInt(el.getAttribute('data-qidx'), 10);
    const oIdx = parseInt(el.getAttribute('data-oidx'), 10);
    if (currentDraft.questions?.items[qIdx]?.options[oIdx]) {
      currentDraft.questions.items[qIdx].options[oIdx].response = el.value;
    }
  });
}

// Media deletion confirmation
async function confirmDeleteMedia(id) {
  if (confirm('Are you sure you want to permanently delete this media file?')) {
    try {
      await AdminAPI.deleteMedia(id);
      window.showToast('Media deleted successfully.', 'info');
      await refreshAllData();
    } catch (err) {
      window.showToast('Failed to delete media: ' + err.message, 'error');
    }
  }
}

window.initDashboardUI = initDashboardUI;
window.switchTab = switchTab;
window.openLivePreview = openLivePreview;
window.closeLivePreview = closeLivePreview;
window.confirmDeleteMedia = confirmDeleteMedia;
window.setPhotoAsHero = setPhotoAsHero;
window.addPhotoToScrapbook = addPhotoToScrapbook;
window.addNewScrapbookPage = addNewScrapbookPage;
window.deleteScrapbookPage = deleteScrapbookPage;
window.moveScrapbookPage = moveScrapbookPage;
window.setVideoForTypography = setVideoForTypography;
window.addTypographySlide = addTypographySlide;
window.deleteTypographySlide = deleteTypographySlide;
window.addQuizQuestion = addQuizQuestion;
window.deleteQuizQuestion = deleteQuizQuestion;
window.moveSectionOrder = moveSectionOrder;
window.publishDraftLive = publishDraftLive;
window.setActiveTrack = setActiveTrack;
window.addFortune = addFortune;
window.deleteFortune = deleteFortune;
window.addReason = addReason;
window.deleteReason = deleteReason;
