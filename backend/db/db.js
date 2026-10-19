const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const defaultContent = require('../config/defaultContent');

const DB_FILE = path.join(__dirname, '../../data/database.json');

// Supabase client initialization if configured
let supabase = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    supabase = createClient(process.env.SUPABASE_URL, key);
    console.log('[Database] Supabase client initialized.');
  } catch (err) {
    console.warn('[Database] Failed to initialize Supabase client, falling back to local database:', err.message);
  }
}

class Database {
  constructor() {
    this.memoryData = null;
  }

  async init() {
    // Ensure data directory exists
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.memoryData = JSON.parse(raw);
      } catch (err) {
        console.error('[Database] Corrupt database file, reinitializing...', err);
        this.memoryData = null;
      }
    }

    if (!this.memoryData) {
      const defaultAdminPass = process.env.ADMIN_PASSWORD || 'AryanLaxmi2026!';
      const defaultAdminEmail = (process.env.ADMIN_EMAIL || 'aryan@birthday.laxmi').toLowerCase();
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(defaultAdminPass, salt);

      const initialMedia = [
        {
          id: 'photo-1',
          type: 'photo',
          filename: 'laxmi_sharmeeli.jpg',
          url: '/assets/images/laxmi_sharmeeli.jpg',
          title: 'Sharmeeli Wink',
          caption: 'September 21 • Cutest smile with glasses',
          altText: 'Laxmi cute selfie with glasses filter',
          uploadedAt: new Date().toISOString(),
          isHero: true,
          scrapbookPageId: 'page-1'
        },
        {
          id: 'photo-2',
          type: 'photo',
          filename: 'laxmi_grid_cutuu.jpg',
          url: '/assets/images/laxmi_grid_cutuu.jpg',
          title: 'Awlle Cutuuu Grid',
          caption: 'September 24 • Traditional kurta & silver jhumkas',
          altText: 'Laxmi 4-grid photo in kurta',
          uploadedAt: new Date().toISOString(),
          isHero: false,
          scrapbookPageId: 'page-2'
        },
        {
          id: 'photo-3',
          type: 'photo',
          filename: 'scrapbook_cafe.jpg',
          url: '/assets/images/scrapbook_cafe.jpg',
          title: 'Cozy Cafe Date',
          caption: 'Warm coffee, sparklers, and deep conversations',
          altText: 'Cafe table with coffee and cupcake sparkler',
          uploadedAt: new Date().toISOString(),
          isHero: false,
          scrapbookPageId: 'page-3'
        },
        {
          id: 'photo-4',
          type: 'photo',
          filename: 'scrapbook_adventure.jpg',
          url: '/assets/images/scrapbook_adventure.jpg',
          title: 'Mountain Road Trip',
          caption: 'Laughing together on scenic mountain road',
          altText: 'Scenic road trip memory',
          uploadedAt: new Date().toISOString(),
          isHero: false,
          scrapbookPageId: 'page-4'
        },
        {
          id: 'audio-1',
          type: 'audio',
          filename: 'birthday_ambient.wav',
          url: '/assets/audio/birthday_ambient.wav',
          title: 'Birthday Ambient Music Box',
          artist: 'Ambient Soundscape',
          uploadedAt: new Date().toISOString(),
          isCurrent: true
        }
      ];

      this.memoryData = {
        admin: {
          email: defaultAdminEmail,
          passwordHash: passwordHash,
          resetToken: null,
          resetTokenExpiry: null,
          lastLogin: null
        },
        draft: JSON.parse(JSON.stringify(defaultContent)),
        published: JSON.parse(JSON.stringify(defaultContent)),
        version: 1,
        lastPublishedAt: new Date().toISOString(),
        hasUnpublishedChanges: false,
        media: initialMedia
      };

      this.saveLocal();
      console.log(`[Database] Initialized fresh database with admin: ${defaultAdminEmail}`);
    }

    // If Supabase is available, try syncing/verifying tables
    if (supabase) {
      await this.syncSupabase();
    }
  }

  saveLocal() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.memoryData, null, 2), 'utf8');
    } catch (err) {
      console.error('[Database] Failed to save local database:', err);
    }
  }

  async syncSupabase() {
    try {
      const { data, error } = await supabase
        .from('birthday_content')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('[Database] Supabase query notice:', error.message);
      } else if (data && data.length > 0) {
        console.log('[Database] Connected to Supabase tables successfully.');
      }
    } catch (e) {
      console.warn('[Database] Supabase sync test failed:', e.message);
    }
  }

  // --- CONTENT METHODS ---

  getPublishedContent() {
    return this.memoryData.published || defaultContent;
  }

  getDraftContent() {
    return this.memoryData.draft || defaultContent;
  }

  async saveDraftContent(newContent) {
    this.memoryData.draft = {
      ...this.memoryData.draft,
      ...newContent,
      meta: { ...this.memoryData.draft.meta, ...(newContent.meta || {}) },
      music: { ...this.memoryData.draft.music, ...(newContent.music || {}) },
      typography: { ...this.memoryData.draft.typography, ...(newContent.typography || {}) },
      scrapbook: { ...this.memoryData.draft.scrapbook, ...(newContent.scrapbook || {}) },
      questions: { ...this.memoryData.draft.questions, ...(newContent.questions || {}) },
      surprises: { ...this.memoryData.draft.surprises, ...(newContent.surprises || {}) },
      letter: { ...this.memoryData.draft.letter, ...(newContent.letter || {}) },
      finale: { ...this.memoryData.draft.finale, ...(newContent.finale || {}) }
    };

    this.memoryData.hasUnpublishedChanges = true;
    this.saveLocal();

    if (supabase) {
      try {
        await supabase.from('birthday_content').upsert({
          status: 'draft',
          data: this.memoryData.draft,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[Database] Supabase draft upsert error:', err.message);
      }
    }

    return this.memoryData.draft;
  }

  async publishContent() {
    this.memoryData.published = JSON.parse(JSON.stringify(this.memoryData.draft));
    this.memoryData.version = (this.memoryData.version || 1) + 1;
    this.memoryData.lastPublishedAt = new Date().toISOString();
    this.memoryData.hasUnpublishedChanges = false;
    this.saveLocal();

    if (supabase) {
      try {
        await supabase.from('birthday_content').upsert({
          status: 'published',
          version: this.memoryData.version,
          data: this.memoryData.published,
          updated_at: this.memoryData.lastPublishedAt
        });
      } catch (err) {
        console.warn('[Database] Supabase publish upsert error:', err.message);
      }
    }

    return {
      version: this.memoryData.version,
      publishedAt: this.memoryData.lastPublishedAt,
      content: this.memoryData.published
    };
  }

  async discardDraft() {
    this.memoryData.draft = JSON.parse(JSON.stringify(this.memoryData.published));
    this.memoryData.hasUnpublishedChanges = false;
    this.saveLocal();

    return this.memoryData.draft;
  }

  // --- AUTH METHODS ---

  getAdminUser(email) {
    if (!email) return null;
    const formatted = email.toLowerCase().trim();
    if (this.memoryData.admin && this.memoryData.admin.email === formatted) {
      return this.memoryData.admin;
    }
    return null;
  }

  updateLastLogin(email) {
    if (this.memoryData.admin && this.memoryData.admin.email === email.toLowerCase().trim()) {
      this.memoryData.admin.lastLogin = new Date().toISOString();
      this.saveLocal();
    }
  }

  async updateAdminPassword(email, newHashedPassword) {
    const admin = this.getAdminUser(email);
    if (!admin) return false;
    admin.passwordHash = newHashedPassword;
    admin.resetToken = null;
    admin.resetTokenExpiry = null;
    this.saveLocal();
    return true;
  }

  createPasswordResetToken(email) {
    const admin = this.getAdminUser(email);
    if (!admin) return null;

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 1000 * 60 * 60; // 1 hour

    admin.resetToken = token;
    admin.resetTokenExpiry = expiry;
    this.saveLocal();

    return { token, expiry };
  }

  async resetPasswordWithToken(token, newHashedPassword) {
    if (!this.memoryData.admin || !this.memoryData.admin.resetToken) {
      return false;
    }

    if (this.memoryData.admin.resetToken !== token) {
      return false;
    }

    if (Date.now() > this.memoryData.admin.resetTokenExpiry) {
      return false;
    }

    this.memoryData.admin.passwordHash = newHashedPassword;
    this.memoryData.admin.resetToken = null;
    this.memoryData.admin.resetTokenExpiry = null;
    this.saveLocal();
    return true;
  }

  // --- MEDIA METHODS ---

  getMediaList(type) {
    let list = this.memoryData.media || [];
    if (type) {
      list = list.filter(m => m.type === type);
    }
    return list;
  }

  addMedia(mediaItem) {
    if (!this.memoryData.media) {
      this.memoryData.media = [];
    }
    this.memoryData.media.push(mediaItem);
    this.saveLocal();
    return mediaItem;
  }

  updateMedia(id, updates) {
    const item = (this.memoryData.media || []).find(m => m.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.saveLocal();
    return item;
  }

  deleteMedia(id) {
    const initialLen = (this.memoryData.media || []).length;
    this.memoryData.media = (this.memoryData.media || []).filter(m => m.id !== id);
    const deleted = this.memoryData.media.length < initialLen;
    if (deleted) {
      this.saveLocal();
    }
    return deleted;
  }

  // --- STATS / OVERVIEW ---

  getStatusSummary() {
    const photos = (this.memoryData.media || []).filter(m => m.type === 'photo');
    const videos = (this.memoryData.media || []).filter(m => m.type === 'video');
    const audio = (this.memoryData.media || []).filter(m => m.type === 'audio');
    const scrapbookPages = (this.memoryData.draft?.scrapbook?.pages || []).length;
    const currentTrack = this.memoryData.draft?.music?.trackTitle || 'None configured';

    return {
      totalPhotos: photos.length,
      totalVideos: videos.length,
      totalAudio: audio.length,
      scrapbookPages: scrapbookPages,
      currentTrack: currentTrack,
      hasUnpublishedChanges: this.memoryData.hasUnpublishedChanges || false,
      publishedVersion: this.memoryData.version || 1,
      lastPublishedAt: this.memoryData.lastPublishedAt || null
    };
  }
}

const db = new Database();

module.exports = db;
