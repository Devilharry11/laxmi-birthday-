# Supabase Setup Guide for DOS LAXMI

This guide walks you through connecting your DOS LAXMI Birthday Website & Admin Portal to Supabase for PostgreSQL database, Supabase Auth, and Supabase Storage.

> **Note**: The application works completely out-of-the-box with built-in persistent storage even without Supabase! When you are ready to deploy or use Supabase cloud infrastructure, follow the steps below.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in or sign up.
2. Click **New Project** and name it `dos-laxmi-birthday`.
3. Choose a secure database password and select the region closest to you.

---

## 2. Run Database Migrations

1. In your Supabase Dashboard, navigate to **SQL Editor** (icon on the left menu).
2. Click **New Query**.
3. Copy and paste the contents of `supabase/migrations/20261019_init.sql`.
4. Click **Run**.
   - This creates the `birthday_content` and `media_files` tables.
   - Configures Row Level Security (RLS) so that:
     - Public visitors can ONLY view published content (`status = 'published'`).
     - Draft content and administrative actions are strictly restricted to authenticated admin users.
   - Sets up the `media` storage bucket and security policies.

---

## 3. Create Aryan's Admin User

1. In Supabase Dashboard, go to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
3. Enter Aryan's email: `aryan@birthday.laxmi` (or your preferred personal email).
4. Set a strong password.
5. Make sure **Auto Confirm User** is checked.

---

## 4. Retrieve API Credentials

1. In Supabase Dashboard, click on **Project Settings** (gear icon) -> **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **anon / public key**
   - **service_role key** (keep this secret!)

---

## 5. Configure Your `.env` File

Open `.env` in the root of the project:

```env
PORT=3000

# Admin Credentials
ADMIN_EMAIL=aryan@birthday.laxmi
ADMIN_PASSWORD=AryanLaxmi2026!
ADMIN_JWT_SECRET=your_custom_jwt_secret_change_me_in_production

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

Save the file and restart the server with `npm start`. The server will automatically connect to Supabase PostgreSQL and synchronize your birthday content!
