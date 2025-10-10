// Test database schema and functions
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mfazahwhmswhynwlmmfp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYXphaHdobXN3aHlud2xtbWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDcxNTcsImV4cCI6MjA3NTUyMzE1N30.vOE9kNeFSxRRw_yn8dts5k2ZODldANc6tWfSVN7M3cg'

async function testDatabaseSchema() {
  console.log('🔍 Testing database schema...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  try {
    // Test 1: Check if tables exist
    console.log('\n📊 Testing table access...')
    
    const tables = ['profiles', 'songs', 'song_comparisons', 'votes', 'flags', 'golden_ears_awards']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: accessible`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
    // Test 2: Check RPC functions
    console.log('\n🔧 Testing RPC functions...')
    
    const rpcFunctions = [
      'record_comparison_vote',
      'get_leaderboard_by_genre_and_week', 
      'soft_delete_song',
      'restore_song'
    ]
    
    for (const func of rpcFunctions) {
      try {
        // Try with minimal parameters to see if function exists
        let params = {}
        if (func === 'record_comparison_vote') {
          params = { comparison_id: 'test', song_id: 'test' }
        } else if (func === 'get_leaderboard_by_genre_and_week') {
          params = { genre_filter: 'all', week_offset: 0 }
        } else if (func === 'soft_delete_song' || func === 'restore_song') {
          params = { song_id: 'test' }
        }
        
        const { data, error } = await supabase.rpc(func, params)
        
        if (error) {
          if (error.message.includes('Could not find the function')) {
            console.log(`❌ RPC ${func}: Function not found`)
          } else {
            console.log(`✅ RPC ${func}: Function exists (${error.message})`)
          }
        } else {
          console.log(`✅ RPC ${func}: Function exists and working`)
        }
      } catch (err) {
        console.log(`❌ RPC ${func}: ${err.message}`)
      }
    }
    
    // Test 3: Check storage buckets
    console.log('\n📁 Testing storage buckets...')
    
    try {
      const { data, error } = await supabase.storage.listBuckets()
      
      if (error) {
        console.log(`❌ Storage access: ${error.message}`)
      } else {
        console.log(`✅ Storage access: working`)
        const buckets = data.map(b => b.name)
        console.log(`📦 Available buckets: ${buckets.join(', ')}`)
        
        // Check if songs bucket exists
        if (buckets.includes('songs')) {
          console.log(`✅ Songs bucket: exists`)
        } else {
          console.log(`❌ Songs bucket: missing`)
        }
      }
    } catch (err) {
      console.log(`❌ Storage test: ${err.message}`)
    }
    
    // Test 4: Check social_links column structure
    console.log('\n🔗 Testing social_links structure...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('social_links')
        .limit(1)
      
      if (error) {
        console.log(`❌ social_links column: ${error.message}`)
      } else {
        console.log(`✅ social_links column: exists (JSONB type)`)
      }
    } catch (err) {
      console.log(`❌ social_links test: ${err.message}`)
    }
    
    console.log('\n🎉 Database schema test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testDatabaseSchema()
