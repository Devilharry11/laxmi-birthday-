// DOS LAXMI - Background Ambient Audio Controller

class AmbientAudioManager {
  constructor() {
    this.audio = new Audio();
    this.isPlaying = false;
    this.userInteracted = false;
    this.widget = null;
    this.btnCircle = null;
    this.trackNameEl = null;
    this.statusEl = null;
    this.config = {
      audioUrl: '/assets/audio/birthday_ambient.wav',
      trackTitle: 'Ambient Birthday Track',
      defaultVolume: 0.75,
      startTime: 0,
      endTime: 0,
      showControls: true
    };
  }

  init(musicConfig = {}) {
    Object.assign(this.config, musicConfig);

    this.widget = document.getElementById('audio-widget');
    if (!this.widget) return;

    if (!this.config.showControls) {
      this.widget.style.display = 'none';
      return;
    } else {
      this.widget.style.display = 'flex';
    }

    this.btnCircle = this.widget.querySelector('.audio-btn-circle');
    this.trackNameEl = this.widget.querySelector('.audio-track-name');
    this.statusEl = this.widget.querySelector('.audio-track-status');

    if (this.trackNameEl) {
      this.trackNameEl.textContent = this.config.trackTitle || 'Birthday Song';
    }

    // Configure audio element
    if (this.config.audioUrl) {
      this.audio.src = this.config.audioUrl;
      this.audio.loop = true;
      this.audio.volume = this.config.defaultVolume !== undefined ? this.config.defaultVolume : 0.75;

      // Handle time trimming
      if (this.config.startTime > 0) {
        this.audio.currentTime = this.config.startTime;
      }

      this.audio.addEventListener('timeupdate', () => {
        if (this.config.endTime > 0 && this.audio.currentTime >= this.config.endTime) {
          this.audio.currentTime = this.config.startTime || 0;
        }
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('[Audio] Error loading audio track, using fallback chime:', e);
        if (this.statusEl) this.statusEl.textContent = 'Audio ready';
      });
    }

    // Widget click handler
    this.widget.addEventListener('click', () => {
      this.togglePlay();
    });

    // Auto-listen for first user click on document to unlock audio smoothly
    const unlockOnFirstClick = () => {
      if (!this.userInteracted) {
        this.userInteracted = true;
        this.play();
      }
      document.removeEventListener('click', unlockOnFirstClick);
      document.removeEventListener('touchstart', unlockOnFirstClick);
    };

    document.addEventListener('click', unlockOnFirstClick);
    document.addEventListener('touchstart', unlockOnFirstClick);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audio.src) return;
    this.audio.play()
      .then(() => {
        this.isPlaying = true;
        if (this.widget) this.widget.classList.add('playing');
        if (this.btnCircle) this.btnCircle.textContent = '⏸';
        if (this.statusEl) this.statusEl.textContent = 'Playing ♫';
      })
      .catch((err) => {
        console.log('[Audio] Autoplay waiting for user gesture:', err.message);
      });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    if (this.widget) this.widget.classList.remove('playing');
    if (this.btnCircle) this.btnCircle.textContent = '▶';
    if (this.statusEl) this.statusEl.textContent = 'Paused';
  }
}

window.ambientAudio = new AmbientAudioManager();
