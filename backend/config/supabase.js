const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

const isConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-supabase'));

if (!isConfigured) {
  console.warn('⚠️ SUPABASE_URL and SUPABASE_ANON_KEY are not configured yet.');
  console.warn('ℹ️ Running with built-in in-memory data store until Supabase credentials are provided.');
}

const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })
  : null;

module.exports = {
  supabase,
  isConfigured,
};
