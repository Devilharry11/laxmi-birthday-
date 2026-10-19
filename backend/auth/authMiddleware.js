const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'Aryan_Laxmi_Birthday_Secret_Key_987654321!';

// Lazy-loaded Supabase client if enabled
let supabase = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    supabase = createClient(process.env.SUPABASE_URL, key);
  } catch (e) {}
}

async function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Try local JWT verification
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (localErr) {
      // If local verification failed, check if it is a Supabase Auth token
      if (supabase) {
        try {
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            req.user = { email: user.email, id: user.id, isSupabase: true };
            return next();
          }
        } catch (supaErr) {
          // fall through
        }
      }
      return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Internal authorization error' });
  }
}

module.exports = {
  requireAdminAuth,
  JWT_SECRET
};
