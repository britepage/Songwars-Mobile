# SongWars Troubleshooting Guide

This guide covers common issues, their root causes, and solutions for the SongWars application.

## 🚨 Critical Issues

### Audio Loading Failures & "NotSupportedError"

**Symptoms:**
- Battle screen shows only one song or no songs
- Console errors: "NotSupportedError: The element has no supported sources"
- Intermittent failures, especially on mobile devices
- Songs sometimes work, sometimes don't

**Root Cause: Supabase Usage Limits**
- **Egress Overage:** When your project exceeds the 5GB monthly data transfer limit
- **Storage Restrictions:** Supabase temporarily restricts file access when limits are exceeded
- **Mobile Impact:** Mobile devices consume more bandwidth, triggering restrictions faster

**Evidence:**
- Database shows 76 active songs with valid URLs
- Storage dashboard shows only 1 file
- Project shows "Exceeding usage limits" warning
- Files return 404 errors intermittently

**Solutions:**
1. **Immediate Relief:** Take a break from using the app (1-7 days)
2. **Monitor Usage:** Check Supabase Dashboard → Usage page
3. **Upgrade Plan:** Consider moving to a usage-based plan
4. **Error Handling:** Use the built-in error fallback system (already implemented)

**Prevention:**
- Monitor egress usage in Supabase Dashboard
- Set up usage alerts
- Optimize file sizes and caching strategies

---

## ✅ Recently Fixed Issues

### Audio Timeout Management Bugs (FIXED)

**Previous Symptoms:**
- Songs with start time 0 didn't reset properly after playback
- 30-second timeouts didn't reset when pausing and restarting audio
- Spam-clicking play buttons caused songs to stop prematurely
- Switching between songs caused interference from previous timeouts
- Multiple timeouts accumulated causing memory leaks

**Root Cause:**
- Missing timeout ID storage and management
- No timeout clearing when pausing/stopping audio
- Timeouts continued running even after audio was stopped

**Solution Implemented:**
- Added proper timeout management to all audio components
- Implemented timeout ID storage and clearing functions
- Enhanced cleanup on pause, stop, and error scenarios
- Fixed memory leaks and timeout interference

**Components Fixed:**
- `useTaggedSongs.ts` - Tagged songs audio playback
- `leaderboard.vue` - Leaderboard audio playback  
- `BattleAnimation.vue` - Battle system audio playback
- `WaveformSelectorDual.vue` - Audio preview functionality

**Status:** ✅ **RESOLVED** - All audio timeout issues have been fixed

---

## 🔧 Common Issues

### Battle System Not Working

**Symptoms:**
- Battle button doesn't respond
- Songs don't load in battle
- Battle screen appears broken

**Solutions:**
1. **Check Network:** Ensure stable internet connection
2. **Clear Cache:** Refresh browser or clear cache
3. **Check Console:** Look for JavaScript errors
4. **Verify Songs:** Ensure you have active songs in the system

### Profile Creation Issues

**Symptoms:**
- New users can't create profiles
- Profile updates fail
- Database errors related to profiles

**Solutions:**
1. **Check Database:** Verify profiles table exists and has correct schema
2. **Check RLS:** Ensure Row Level Security policies are correct
3. **Check Auth:** Verify Supabase Auth is properly configured

### Song Upload Failures

**Symptoms:**
- File uploads fail
- Songs don't appear in dashboard
- Storage errors

**Solutions:**
1. **Check File Size:** Ensure files are under storage limits
2. **Check Format:** Verify audio format is supported
3. **Check Storage:** Verify storage bucket permissions
4. **Check Quota:** Ensure storage quota hasn't been exceeded

---

## 📱 Mobile-Specific Issues

### Audio Loading on Mobile

**Symptoms:**
- Audio fails to load more frequently on mobile
- Battle system works inconsistently
- Network timeouts

**Root Causes:**
- **Network Instability:** Mobile networks are less reliable
- **Bandwidth Consumption:** Mobile browsers use more bandwidth
- **Supabase Restrictions:** Mobile usage can trigger limits faster

**Solutions:**
1. **Use Error Fallback:** The built-in error handling system
2. **Stable Connection:** Use WiFi when possible
3. **Monitor Usage:** Check if Supabase limits are being exceeded

---

## 🗑️ Soft Delete System Issues

### Songs Not Appearing in Trash

**Symptoms:**
- Deleted songs don't appear in trash view
- Trash tab shows no songs
- Songs appear to be permanently deleted

**Root Causes:**
- **Trash Expiration:** Songs may have expired from trash (10-day limit)
- **Database Issues:** Soft delete RPC may not be working properly
- **RLS Policies:** Row Level Security may be blocking access

**Solutions:**
1. **Check Expiration:** Trash expires after 10 days automatically
2. **Verify RPC:** Test `get_my_trashed_songs()` function
3. **Check RLS:** Verify RLS policies allow access to trashed songs
4. **Manual Cleanup:** Use `manual_purge_expired_trash()` for testing

### Restore Functionality Not Working

**Symptoms:**
- Restore button doesn't work
- Songs remain in trash after restore attempt
- Restored songs don't appear in active rotation

**Root Causes:**
- **State Preservation:** Restore preserves original churn state
- **Churn Integration:** Eliminated songs (week 4) remain inactive after restore
- **Database Issues:** Restore RPC may not be working properly

**Solutions:**
1. **Check Churn State:** Verify song's current churn week
2. **Test RPC:** Test `restore_song()` function directly
3. **Verify State:** Check if song was eliminated at week 4
4. **Manual Update:** Use direct database update if needed

---

## ⏳ Churn System Issues

### Songs Not Moving Through Churn

**Symptoms:**
- Songs stuck in same week
- Leaderboard shows incorrect weeks
- Hall of Fame not populated

**Root Causes:**
- **Weekly Processing:** Weekly churn function may not be running
- **Cron Job:** Edge function cron job may not be scheduled
- **Database Issues:** Churn functions may have errors

**Solutions:**
1. **Check Cron:** Verify weekly-churn function cron schedule
2. **Test Function:** Use `process_weekly_churn()` manually
3. **Verify Data:** Check churn_events table for processing logs
4. **Check Functions:** Verify all churn RPCs are working

### Leaderboard Issues

**Symptoms:**
- Songs appearing in multiple weeks
- Songs appearing in both week and Hall of Fame
- Incorrect week assignments

**Root Causes:**
- **Filtering Logic:** Leaderboard filtering may not be working
- **Churn State:** Songs may have incorrect churn state
- **Database Issues:** Leaderboard functions may have errors

**Solutions:**
1. **Check Filtering:** Verify leaderboard filtering logic
2. **Test Functions:** Test leaderboard RPCs directly
3. **Verify State:** Check song churn state in database
4. **Check Integration:** Ensure churn system integration is working

---

---

## 🗄️ Database Issues

### RLS Policy Problems

**Symptoms:**
- Users can't access their own data
- Admin functions don't work
- Permission denied errors

**Solutions:**
1. **Check Policies:** Verify RLS policies are correctly configured
2. **Check User Role:** Ensure user has correct permissions
3. **Check Auth:** Verify authentication is working

### Function Errors

**Symptoms:**
- RPC calls fail
- Database functions return errors
- Edge functions don't deploy

**Solutions:**
1. **Check Function Code:** Verify SQL syntax
2. **Check Permissions:** Ensure functions have correct access
3. **Check Deployment:** Verify functions are properly deployed

---

## 🔍 Debugging Steps

### 1. Check Console Logs
- Open browser Developer Tools
- Look for JavaScript errors
- Check network requests

### 2. Check Supabase Dashboard
- Verify project status
- Check usage limits
- Review logs and errors

### 3. Check Database
- Run diagnostic queries
- Verify table schemas
- Check RLS policies

### 4. Check Storage
- Verify bucket contents
- Check file permissions
- Verify storage policies

---

## 📞 Getting Help

### When to Escalate:
- **Critical Issues:** App completely unusable
- **Data Loss:** Songs or user data missing
- **Security Issues:** Unauthorized access or data exposure
- **Performance Issues:** App becomes slow or unresponsive

### Information to Provide:
- **Error Messages:** Exact error text from console
- **Steps to Reproduce:** How to trigger the issue
- **Environment:** Browser, device, network
- **Timing:** When the issue occurs
- **Frequency:** How often it happens

---

## 🚀 Prevention Best Practices

### Regular Maintenance:
- Monitor Supabase usage metrics
- Check for database anomalies
- Verify storage bucket contents
- Test critical user flows

### Development Practices:
- Implement comprehensive error handling
- Add logging for debugging
- Test on multiple devices and networks
- Monitor performance metrics

### User Experience:
- Provide clear error messages
- Offer recovery options
- Implement graceful degradation
- Test edge cases thoroughly

---

*Last Updated: January 2025*
*Version: 1.0*
