// Simple token generation helper for testing
const generateSecureToken = () => {
  // Use the same format as the updated lib/supabase.ts
  const timestamp = Math.floor(Date.now() / 1000) // Unix timestamp
  const randomPart = Math.random().toString(36).substring(2, 17).toLowerCase()
  return `SECURE_${timestamp}_${randomPart}`
}

module.exports = { generateSecureToken };
