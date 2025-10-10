// Test Supabase connection
// Run this with: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js'

// Mobile-dev Supabase credentials
const SUPABASE_URL = 'https://mfazahwhmswhynwlmmfp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYXphaHdobXN3aHlud2xtbWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDcxNTcsImV4cCI6MjA3NTUyMzE1N30.vOE9kNeFSxRRw_yn8dts5k2ZODldANc6tWfSVN7M3cg'

async function testConnection() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    // Test basic connection
    console.log('📡 Testing basic connection...')
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Basic connection successful')
    
    // Test RPC functions
    console.log('🔧 Testing RPC functions...')
    
    // Test get_leaderboard_by_genre_and_week (should work without params)
    try {
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .rpc('get_leaderboard_by_genre_and_week', {
          genre_filter: 'all',
          week_offset: 0
        })
      
      if (leaderboardError) {
        console.log('⚠️  get_leaderboard_by_genre_and_week RPC error:', leaderboardError.message)
      } else {
        console.log('✅ get_leaderboard_by_genre_and_week RPC working')
      }
    } catch (rpcError) {
      console.log('⚠️  get_leaderboard_by_genre_and_week RPC not available:', rpcError.message)
    }
    
    console.log('🎉 Supabase connection test completed!')
    return true
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
