const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireAdminAuth } = require('../auth/authMiddleware');

// GET /api/content/published (PUBLIC ENDPOINT)
// Public visitors can only access this intentionally published data
router.get('/published', (req, res) => {
  try {
    const published = db.getPublishedContent();
    return res.json({
      success: true,
      content: published
    });
  } catch (err) {
    console.error('[Content] Error fetching published content:', err);
    return res.status(500).json({ error: 'Failed to load birthday content' });
  }
});

// GET /api/content/draft (PROTECTED ADMIN ENDPOINT)
router.get('/draft', requireAdminAuth, (req, res) => {
  try {
    const draft = db.getDraftContent();
    return res.json({
      success: true,
      content: draft
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load draft content' });
  }
});

// PUT /api/content/draft (PROTECTED ADMIN ENDPOINT)
router.put('/draft', requireAdminAuth, async (req, res) => {
  try {
    const updatedDraft = await db.saveDraftContent(req.body);
    return res.json({
      success: true,
      message: 'Draft saved successfully. Click "Publish Changes" when ready to make it live.',
      content: updatedDraft
    });
  } catch (err) {
    console.error('[Content] Error saving draft:', err);
    return res.status(500).json({ error: 'Failed to save draft changes' });
  }
});

// POST /api/content/publish (PROTECTED ADMIN ENDPOINT)
router.post('/publish', requireAdminAuth, async (req, res) => {
  try {
    const publishResult = await db.publishContent();
    return res.json({
      success: true,
      message: `Website successfully published! (Version ${publishResult.version})`,
      publishedAt: publishResult.publishedAt,
      version: publishResult.version
    });
  } catch (err) {
    console.error('[Content] Publish error:', err);
    return res.status(500).json({ error: 'Failed to publish content' });
  }
});

// POST /api/content/discard (PROTECTED ADMIN ENDPOINT)
router.post('/discard', requireAdminAuth, async (req, res) => {
  try {
    const reverted = await db.discardDraft();
    return res.json({
      success: true,
      message: 'Unpublished draft changes have been discarded and reverted to the published version.',
      content: reverted
    });
  } catch (err) {
    console.error('[Content] Discard error:', err);
    return res.status(500).json({ error: 'Failed to discard draft changes' });
  }
});

// GET /api/content/summary (PROTECTED ADMIN ENDPOINT for Dashboard Overview)
router.get('/summary', requireAdminAuth, (req, res) => {
  try {
    const summary = db.getStatusSummary();
    return res.json({
      success: true,
      summary
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve dashboard summary' });
  }
});

module.exports = router;
