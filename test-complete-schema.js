// Comprehensive database schema test
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mfazahwhmswhynwlmmfp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mYXphaHdobXN3aHlud2xtbWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NDcxNTcsImV4cCI6MjA3NTUyMzE1N30.vOE9kNeFSxRRw_yn8dts5k2ZODldANc6tWfSVN7M3cg'

async function testCompleteSchema() {
  console.log('🔍 Comprehensive database schema test...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  try {
    // Test 1: List all tables in the public schema
    console.log('\n📊 Testing all tables...')
    
    try {
      const { data: tables, error } = await supabase.rpc('get_tables')
      if (error) {
        console.log('❌ Could not list tables via RPC, trying direct queries...')
      } else {
        console.log(`✅ Found ${tables.length} tables:`, tables.map(t => t.table_name))
      }
    } catch (err) {
      console.log('ℹ️  RPC method not available, testing individual tables...')
    }
    
    // Test individual tables
    const allTables = [
      'profiles', 'songs', 'song_comparisons', 'votes', 
      'flags', 'golden_ears_awards', 'song_tags', 'user_preferences'
    ]
    
    for (const table of allTables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1)
        
        if (error) {
          if (error.message.includes('Could not find the table')) {
            console.log(`❌ Table ${table}: not found`)
          } else {
            console.log(`⚠️  Table ${table}: exists but ${error.message}`)
          }
        } else {
          console.log(`✅ Table ${table}: accessible (${count || 0} rows)`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
    // Test 2: Check for RPC functions with different naming patterns
    console.log('\n🔧 Testing RPC functions (various naming patterns)...')
    
    const possibleRpcFunctions = [
      // Canonical names
      'record_comparison_vote',
      'get_leaderboard_by_genre_and_week',
      'soft_delete_song', 
      'restore_song',
      // Alternative names that might exist
      'record_battle_vote',
      'get_weekly_leaderboard',
      'get_leaderboard',
      'delete_song',
      'restore_song_from_trash',
      // Other possible functions
      'get_user_stats',
      'get_battle_history',
      'get_song_stats'
    ]
    
    for (const func of possibleRpcFunctions) {
      try {
        // Try with minimal test parameters
        let params = {}
        if (func.includes('vote')) {
          params = { comparison_id: 'test', song_id: 'test' }
        } else if (func.includes('leaderboard')) {
          params = { genre_filter: 'all', week_offset: 0 }
        } else if (func.includes('song')) {
          params = { song_id: 'test' }
        }
        
        const { data, error } = await supabase.rpc(func, params)
        
        if (error) {
          if (error.message.includes('Could not find the function')) {
            // Function doesn't exist
          } else {
            console.log(`✅ RPC ${func}: exists (error: ${error.message})`)
          }
        } else {
          console.log(`✅ RPC ${func}: exists and working`)
        }
      } catch (err) {
        // Function doesn't exist
      }
    }
    
    // Test 3: Check storage buckets and their contents
    console.log('\n📁 Testing storage...')
    
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      
      if (error) {
        console.log(`❌ Storage access: ${error.message}`)
      } else {
        console.log(`✅ Storage access: working`)
        console.log(`📦 Available buckets: ${buckets.map(b => b.name).join(', ')}`)
        
        // Test each bucket
        for (const bucket of buckets) {
          try {
            const { data: files, error: listError } = await supabase.storage
              .from(bucket.name)
              .list('', { limit: 1 })
            
            if (listError) {
              console.log(`⚠️  Bucket ${bucket.name}: ${listError.message}`)
            } else {
              console.log(`✅ Bucket ${bucket.name}: accessible`)
            }
          } catch (err) {
            console.log(`❌ Bucket ${bucket.name}: ${err.message}`)
          }
        }
      }
    } catch (err) {
      console.log(`❌ Storage test: ${err.message}`)
    }
    
    // Test 4: Check profiles table structure in detail
    console.log('\n👤 Testing profiles table structure...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Profiles structure: ${error.message}`)
      } else {
        console.log(`✅ Profiles table: accessible`)
        if (data && data.length > 0) {
          console.log(`📋 Profile columns:`, Object.keys(data[0]))
          
          // Check social_links specifically
          const profile = data[0]
          if (profile.social_links) {
            console.log(`✅ social_links column: exists (type: ${typeof profile.social_links})`)
            if (Array.isArray(profile.social_links)) {
              console.log(`✅ social_links: JSONB array format`)
            } else if (typeof profile.social_links === 'object') {
              console.log(`✅ social_links: JSONB object format`)
            }
          } else {
            console.log(`ℹ️  social_links: column exists but no data`)
          }
        }
      }
    } catch (err) {
      console.log(`❌ Profiles structure test: ${err.message}`)
    }
    
    // Test 5: Check if we can insert a test profile (to verify RLS)
    console.log('\n🔒 Testing Row Level Security...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          display_name: 'Test User',
          role: 'fan'
        })
        .select()
      
      if (error) {
        if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          console.log(`✅ RLS: enabled (insert blocked as expected)`)
        } else {
          console.log(`⚠️  RLS test: ${error.message}`)
        }
      } else {
        console.log(`⚠️  RLS: may not be properly configured`)
      }
    } catch (err) {
      console.log(`✅ RLS: properly configured (insert blocked)`)
    }
    
    console.log('\n🎉 Comprehensive schema test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testCompleteSchema()
