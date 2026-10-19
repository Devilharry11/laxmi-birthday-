const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/db');
const { requireAdminAuth } = require('../auth/authMiddleware');
const { upload, deleteLocalFile } = require('../storage/storageService');

// GET /api/media?type=photo|video|audio
router.get('/', requireAdminAuth, (req, res) => {
  try {
    const { type } = req.query;
    const mediaList = db.getMediaList(type);
    return res.json({ success: true, media: mediaList });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve media library' });
  }
});

// POST /api/media/upload (Single or multiple files)
router.post('/upload', requireAdminAuth, (req, res) => {
  upload.array('files', 15)(req, res, async (err) => {
    if (err) {
      console.error('[Media] Upload error:', err);
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    try {
      const results = [];
      for (const file of req.files) {
        let type = 'photo';
        let folder = 'photos';
        if (file.mimetype.startsWith('video/')) {
          type = 'video';
          folder = 'videos';
        } else if (file.mimetype.startsWith('audio/')) {
          type = 'audio';
          folder = 'audio';
        }

        const relativeUrl = `/uploads/${folder}/${file.filename}`;
        const mediaItem = {
          id: `media-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          type: type,
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          url: relativeUrl,
          title: req.body.title || file.originalname,
          caption: req.body.caption || '',
          altText: req.body.altText || '',
          uploadedAt: new Date().toISOString(),
          isHero: req.body.isHero === 'true' || req.body.isHero === true,
          scrapbookPageId: req.body.scrapbookPageId || null
        };

        db.addMedia(mediaItem);
        results.push(mediaItem);
      }

      return res.json({
        success: true,
        message: `Successfully uploaded ${results.length} file(s).`,
        uploaded: results
      });
    } catch (saveErr) {
      console.error('[Media] Error saving media records:', saveErr);
      return res.status(500).json({ error: 'Failed to process uploaded files' });
    }
  });
});

// PUT /api/media/:id (Update metadata like title, caption, alt text, hero flag)
router.put('/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = db.updateMedia(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    return res.json({ success: true, item: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update media item' });
  }
});

// DELETE /api/media/:id
router.delete('/:id', requireAdminAuth, (req, res) => {
  try {
    const { id } = req.params;
    const mediaList = db.getMediaList();
    const item = mediaList.find(m => m.id === id);

    if (!item) {
      return res.status(404).json({ error: 'Media item not found' });
    }

    // Delete record from DB
    db.deleteMedia(id);

    // Delete physical file safely
    if (item.url) {
      deleteLocalFile(item.url);
    }

    return res.json({
      success: true,
      message: 'Media file successfully deleted'
    });
  } catch (err) {
    console.error('[Media] Delete error:', err);
    return res.status(500).json({ error: 'Failed to delete media item' });
  }
});

module.exports = router;
