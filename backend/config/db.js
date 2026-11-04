// Re-export Supabase client (replaced MongoDB)
const { supabase, isConfigured } = require('./supabase');

module.exports = {
  supabase,
  isConfigured
};
