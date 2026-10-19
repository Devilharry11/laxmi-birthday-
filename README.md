# 🎂 DOS LAXMI — Birthday Website & Private Admin Portal

A cinematic, interactive, and emotional birthday experience built for **Laxmi**, created with love by **Aryan**, coupled with a private, secure **Admin Portal** allowing Aryan to customize all website content, photos, videos, music, questions, and letters without editing a single line of code.

---

## 🌟 Features Overview

### 1. The Public Birthday Website (`/`)
- **Atmospheric Hero Section**: Romantic dark velvet & rose gold aesthetic, glowing badges, floating starfield particles, and Laxmi's portrait.
- **Cinematic Typography & Video**: Dynamic typography animation celebrating Laxmi's spirit, beauty, and grace, with optional video background.
- **Interactive Memory Scrapbook**: Vintage polaroid album with washi tape, stamps, handwritten stickers, date markers, and an interactive high-resolution lightbox viewer.
- **Laxmi & Aryan Quiz**: Heartwarming and playful trivia game with personalized celebratory replies from Aryan for every answer and a live Love & Compatibility Meter.
- **Secret Birthday Surprises**: Interactive 3D flip scratch cards revealing hidden birthday coupons (Midnight Ice Cream Voucher, 'You Win Any Argument' Pass, Secret Wish Grant).
- **Personal Birthday Letter**: Vintage sealed envelope with a 3D wax seal ("L & A"). Breaking the wax seal unfolds the handwritten parchment letter with Aryan's personal signature.
- **Grand Finale Celebration**: Confetti cannons, fireworks explosions, floating wish balloons launched into the starry sky, and celebratory wishes.
- **Ambient Floating Audio Player**: Background music player with custom volume, equalizer animation, and mobile-safe user-interaction handling.

### 2. Private Admin Portal (`/admin`)
- **Secure Authentication**:
  - Email & password sign-in with bcrypt password hashing and JWT sessions.
  - Password reset token generation & password change.
  - Server-side authorization: API endpoints strictly reject unauthenticated requests.
  - No public registration or visible admin links on the public birthday site.
- **Photo Management**:
  - Drag-and-drop multiple photo upload with real-time progress.
  - Live photo gallery with thumbnails, title, caption, and alt text editing.
  - One-click "Set as Hero Image" button.
  - One-click "Add to Scrapbook" button.
  - Safe replacement and deletion with confirmation modals.
- **Video Management**:
  - Upload MP4 and WebM videos.
  - Choose video for the Cinematic Typography background.
  - Delete and preview videos.
- **Music Management**:
  - Upload custom audio files (MP3, WAV).
  - Audio preview player.
  - Default volume slider (0 to 100%).
  - Audio segment start/end time trimming.
  - Toggle visibility of the floating player on the public site.
- **Website Content Editor**:
  - Edit headlines, subtitles, typography phrases, scrapbook captions, quiz questions, answer options, custom replies, surprise cards, and personal letter.
  - Theme editor: Custom color pickers for Primary Rose Gold, Secondary Champagne, and Background Velvet Dark.
  - Section reordering (move sections up or down).
- **Draft & Publish Workflow**:
  - **Save Draft**: Saves edits to the draft state without affecting the live public website.
  - **Interactive Preview Draft**: Live preview mode (`/?preview=true`) to inspect draft changes before publishing.
  - **Publish Live**: Promotes draft changes to live state with atomic version increments.
  - **Discard Changes**: Safely reverts draft changes back to the currently published version.

---

## 🚀 Quick Start Guide

### 1. Start the Server
```bash
# Navigate to the project directory
cd c:\Users\ThinkPad\Desktop\laxmi

# Start the application
npm start
```

### 2. Access the Application
- **Public Birthday Website**: [http://localhost:3000](http://localhost:3000)
- **Private Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Default Admin Credentials
- **Email**: `aryan@birthday.laxmi`
- **Password**: `AryanLaxmi2026!`

*(You can change the email and password anytime in the `.env` file or from the Admin Portal)*.

---

## 🔒 Security & Data Persistence

1. **Persistent Local Database & Storage**:
   - Out of the box, the app uses a persistent JSON database (`data/database.json`) and disk storage (`uploads/`).
   - Every photo, video, song, and draft change is immediately persisted to disk and survives server restarts.
2. **Supabase Integration (Production Ready)**:
   - When deploying to production or cloud hosting, you can easily connect Supabase PostgreSQL and Supabase Storage.
   - Run the included SQL migration: `supabase/migrations/20261019_init.sql`.
   - Update your `.env` with `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
   - The backend automatically detects Supabase and synchronizes content with Row Level Security (RLS) policies.

---

## 📁 Project Structure

```
laxmi/
├── .env.example
├── .env
├── package.json
├── server.js                 # Express server with static routes and API handlers
├── backend/
│   ├── auth/
│   │   └── authMiddleware.js # JWT & Supabase token verification
│   ├── config/
│   │   └── defaultContent.js # Initial seed birthday content for Laxmi & Aryan
│   ├── db/
│   │   └── db.js             # Persistence engine (Local JSON + Supabase adapter)
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth (login, logout, reset-password, me)
│   │   ├── contentRoutes.js  # /api/content (published, draft, publish, discard, summary)
│   │   └── mediaRoutes.js    # /api/media (upload, delete, update, list)
│   └── storage/
│       └── storageService.js # Multer file upload & safe deletion handler
├── data/
│   └── database.json         # Persistent database file
├── uploads/
│   ├── photos/               # Uploaded images
│   ├── videos/               # Uploaded videos
│   └── audio/                # Uploaded audio tracks
├── public/
│   ├── index.html            # Public DOS LAXMI birthday website
│   ├── css/                  # Styling modules (main, hero, typography, scrapbook, etc.)
│   ├── js/                   # Interactive components (app, hero, scrapbook, quiz, letter, finale, audio)
│   ├── assets/
│   │   ├── images/           # Default curated photos of Laxmi
│   │   └── audio/            # Ambient music box audio
│   └── admin/
│       ├── index.html        # Admin portal page
│       ├── css/admin.css     # Luxury dark dashboard styles
│       └── js/
│           ├── admin-api.js  # Client API layer
│           ├── admin-auth.js # Session & login management
│           └── admin-ui.js   # Dashboard tabs & CMS editor
└── supabase/
    ├── README.md             # Supabase cloud setup instructions
    └── migrations/
        └── 20261019_init.sql # SQL schema with Row Level Security & storage policies
```

---

## 💖 Made with Love for Laxmi's Birthday
Designed and engineered for an unforgettable celebration.
