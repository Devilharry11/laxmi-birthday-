const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure storage directories
const UPLOADS_ROOT = path.join(__dirname, '../../uploads');
const PHOTOS_DIR = path.join(UPLOADS_ROOT, 'photos');
const VIDEOS_DIR = path.join(UPLOADS_ROOT, 'videos');
const AUDIO_DIR = path.join(UPLOADS_ROOT, 'audio');

[PHOTOS_DIR, VIDEOS_DIR, AUDIO_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Disk storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = PHOTOS_DIR;
    if (file.mimetype.startsWith('video/')) {
      dest = VIDEOS_DIR;
    } else if (file.mimetype.startsWith('audio/')) {
      dest = AUDIO_DIR;
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Generate clean safe filename with timestamp
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E6);
    cb(null, `${safeBase}_${uniqueSuffix}${ext}`);
  }
});

// File filter validator
const fileFilter = (req, file, cb) => {
  const allowedPhotoMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  const allowedAudioMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/m4a'];

  if (allowedPhotoMimes.includes(file.mimetype) ||
      allowedVideoMimes.includes(file.mimetype) ||
      allowedAudioMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload a supported image, video, or audio file.`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max per file
  }
});

// Helper to remove file from disk safely
function deleteLocalFile(fileRelativeUrl) {
  try {
    if (!fileRelativeUrl) return;
    // URL starts with /uploads/photos/xyz or /assets/images/xyz
    if (fileRelativeUrl.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../../', fileRelativeUrl);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[Storage] Deleted file: ${fullPath}`);
      }
    }
  } catch (err) {
    console.warn(`[Storage] Could not delete file: ${fileRelativeUrl}`, err.message);
  }
}

module.exports = {
  upload,
  deleteLocalFile,
  PHOTOS_DIR,
  VIDEOS_DIR,
  AUDIO_DIR
};
