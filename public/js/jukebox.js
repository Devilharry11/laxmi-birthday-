// DOS LAXMI - Vinyl Jukebox Controller

function initJukebox(musicData = {}) {
  const container = document.getElementById('jukebox-container');
  if (!container) return;

  const playlist = musicData.playlist || [
    {
      id: "track-1",
      title: "Sharmeeli",
      artist: "Frappe Ash & Toorjo Dey",
      tag: "Sept 21 Favorite",
      url: "/assets/audio/sharmeeli_melody.wav",
      lyrics: "Tera yeh sharmaana, dil ko chhu jaana... 🎶"
    },
    {
      id: "track-2",
      title: "Maula Mere Maula",
      artist: "Roop Kumar Rathod",
      tag: "Sept 24 Kurta & Jhumka Vibe",
      url: "/assets/audio/maula_mere_melody.wav",
      lyrics: "Aankhein teri kitni haseen, ke inka aashik main ban gaya hoon... ✨"
    },
    {
      id: "track-3",
      title: "Birthday Ambient Music Box",
      artist: "Aryan's Dedication",
      tag: "Soft & Romantic",
      url: "/assets/audio/birthday_ambient.wav",
      lyrics: "May all your sweetest dreams come true tonight... 🎂"
    }
  ];

  let currentTrackIdx = 0;

  function render() {
    const cur = playlist[currentTrackIdx];

    container.innerHTML = `
      <!-- Turntable Deck -->
      <div class="turntable-deck">
        <div class="tonearm" id="tonearm">
          <div class="tonearm-base"></div>
          <div class="tonearm-stick"></div>
          <div class="tonearm-head"></div>
        </div>

        <div class="vinyl-disc" id="vinyl-disc">
          <div class="vinyl-center-label">
            <img src="/assets/images/laxmi_sharmeeli.jpg" alt="Laxmi on Vinyl" />
            <div class="vinyl-center-hole"></div>
          </div>
        </div>
      </div>

      <!-- Playlist & Details -->
      <div class="jukebox-info">
        <span class="jukebox-badge">Vintage Vinyl Record Player</span>
        <h3 class="jukebox-track-title" id="jukebox-title">${cur.title}</h3>
        <p class="jukebox-artist-name" id="jukebox-artist">${cur.artist}</p>

        <!-- Lyrics Snippet -->
        <div class="lyrics-banner" id="jukebox-lyrics">${cur.lyrics}</div>

        <!-- Playlist Selector -->
        <div class="playlist-selector">
          ${playlist.map((t, idx) => `
            <div class="playlist-track-item ${idx === currentTrackIdx ? 'active' : ''}" data-idx="${idx}">
              <div class="track-main-info">
                <span class="track-icon">${idx === currentTrackIdx ? '▶' : '♫'}</span>
                <span class="track-name-bold">${t.title}</span>
              </div>
              <span class="track-tag-badge">${t.tag || 'Track ' + (idx + 1)}</span>
            </div>
          `).join('')}
        </div>

        <div class="jukebox-controls">
          <button class="btn-vinyl-play" id="btn-vinyl-toggle" title="Play / Pause">▶</button>
          <span style="font-size: 0.95rem; color: var(--color-text-muted);">
            Click song to switch • Spin the vinyl 🎶
          </span>
        </div>
      </div>
    `;

    // Listeners
    const playBtn = container.querySelector('#btn-vinyl-toggle');
    const vinyl = container.querySelector('#vinyl-disc');
    const tonearm = container.querySelector('#tonearm');

    function updatePlayingState(isPlaying) {
      if (isPlaying) {
        vinyl.classList.add('spinning');
        tonearm.classList.add('playing');
        playBtn.textContent = '⏸';
      } else {
        vinyl.classList.remove('spinning');
        tonearm.classList.remove('playing');
        playBtn.textContent = '▶';
      }
    }

    playBtn.addEventListener('click', () => {
      if (window.ambientAudio) {
        window.ambientAudio.togglePlay();
        updatePlayingState(window.ambientAudio.isPlaying);
      }
    });

    container.querySelectorAll('.playlist-track-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-idx'), 10);
        switchTrack(idx);
      });
    });

    // Sync with ambientAudio
    if (window.ambientAudio && window.ambientAudio.isPlaying) {
      updatePlayingState(true);
    }
  }

  function switchTrack(idx) {
    currentTrackIdx = idx;
    const track = playlist[currentTrackIdx];

    if (window.ambientAudio) {
      window.ambientAudio.audio.src = track.url;
      window.ambientAudio.config.trackTitle = track.title;
      if (window.ambientAudio.trackNameEl) {
        window.ambientAudio.trackNameEl.textContent = track.title;
      }
      window.ambientAudio.play();
    }

    render();

    // Trigger subtle sparkles
    if (window.triggerConfetti) window.triggerConfetti();
  }

  render();
}

window.initJukebox = initJukebox;
