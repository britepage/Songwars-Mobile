# Song Deletion System Documentation

## Overview
The SongWars system implements a comprehensive song deletion system that includes soft deletion (trash), hard deletion, and automatic cleanup. This system ensures data integrity, user control, and storage efficiency.

## System Components

### 1. Soft Delete System (Trash)

#### Purpose
Allows users to "delete" songs while maintaining the ability to restore them within a 10-day window.

#### Implementation
- **`deleted_at`** timestamp - When the song was soft deleted
- **`deleted_by`** uuid - Who deleted the song (user ID)
- **`trash_expires_at`** timestamp - When the song will be permanently deleted (10 days)
- **`is_active`** boolean - Set to false when soft deleted

#### User Functions
- **`soft_delete_song(p_song_id uuid)`** - Moves song to trash
- **`restore_song(p_song_id uuid)`** - Restores song from trash
- **`get_my_trashed_songs()`** - Lists user's trashed songs

### 2. Hard Delete System

#### Purpose
Permanently removes songs and their associated audio files from the system.

#### Implementation
- **`hard_delete_song(p_song_id uuid)`** - Permanently deletes individual songs
- **`delete_user_account()`** - Deletes all user songs when account is deleted
- **`purge_expired_trash()`** - Automatically deletes expired trash songs

#### Safety Features
- **Ownership validation** - Users can only delete their own songs
- **Storage cleanup** - Removes audio files from storage buckets
- **Audit logging** - All deletions are logged in `audit_log`
- **Cascade handling** - Related data is properly cleaned up

### 3. Automatic Cleanup System

#### Cron Job: Daily Trash Purge
- **Schedule**: `0 2 * * *` (Every day at 2 AM UTC)
- **Function**: `purge_expired_trash()`
- **Purpose**: Automatically deletes songs that have been in trash for 10+ days

#### Manual Cleanup
- **`manual_purge_expired_trash()`** - Admin function for manual cleanup
- **Admin access required** - Only admins can trigger manual cleanup

## Database Functions

### User Functions

#### `soft_delete_song(p_song_id uuid)`
**Purpose**: Soft deletes a song (moves to trash with expiration)
**Returns**: `boolean` (success status)
**Security**: User can only delete their own songs

**Process**:
1. Validates user ownership
2. Sets `deleted_at` to current timestamp
3. Sets `trash_expires_at` to 10 days from now
4. Sets `is_active` to false
5. Logs deletion action
6. Returns success status

#### `restore_song(p_song_id uuid)`
**Purpose**: Restores a soft-deleted song from trash
**Returns**: `boolean` (success status)
**Security**: User can only restore their own songs

**Process**:
1. Validates ownership and trash status
2. Checks if song was eliminated (week 4) vs. still in churn
3. Restores appropriate active state
4. Clears deletion timestamps
5. Logs restoration action
6. Returns success status

#### `hard_delete_song(p_song_id uuid)`
**Purpose**: Permanently deletes a song and its audio file
**Returns**: `boolean` (success status)
**Security**: User can only delete their own songs

**Process**:
1. Validates ownership and trash status
2. Logs hard deletion action
3. Deletes song from database
4. Removes audio file from storage
5. Returns success status

#### `get_my_trashed_songs()`
**Purpose**: Gets all songs in trash for the current user
**Returns**: `TABLE(id uuid, title text, artist text, deleted_at timestamptz, trash_expires_at timestamptz)`
**Security**: User can only see their own trashed songs

### System Functions

#### `purge_expired_trash()`
**Purpose**: Permanently deletes songs that have expired from trash (10+ days old)
**Returns**: `integer` (number of songs deleted)
**Security**: `DEFINER` (system function)

**Process**:
1. Finds songs with `trash_expires_at` < now()
2. Permanently deletes database records
3. Removes associated audio files from storage
4. Logs all deletions
5. Returns count of deleted songs

#### `manual_purge_expired_trash()`
**Purpose**: Admin function to manually purge expired trash
**Returns**: `integer` (number of songs deleted)
**Security**: Admin access required

**Process**:
1. Validates admin privileges
2. Calls `purge_expired_trash()` function
3. Returns count of deleted songs

#### `delete_user_account()`
**Purpose**: Completely deletes a user account and all associated data
**Returns**: `void`
**Security**: User can only delete their own account

**Process**:
1. Validates authentication
2. Collects song filenames for storage cleanup BEFORE deletion
3. Logs account deletion attempt
4. Removes admin privileges if user is admin
5. Deletes auth user (triggers cascade deletes)
6. Cleans up song audio files from storage
7. Logs all deletion actions
8. Handles errors gracefully with comprehensive logging

## Storage Management

### File Cleanup
- **Song audio files** - Removed from `song-audio` bucket
- **Avatar files** - Removed from `avatars` bucket (on account deletion)
- **Automatic cleanup** - Storage files are deleted when database records are deleted

### Safety Measures
- **Double-check validation** - Ensures files belong to the user before deletion
- **Error handling** - Graceful handling of storage deletion failures
- **Audit logging** - All file deletions are logged

## User Interface Integration

### Trash Management
- **Trash tab** - Users can view their trashed songs
- **Restore button** - Restore songs from trash
- **Hard delete button** - Permanently delete songs from trash
- **Expiration display** - Shows when songs will be automatically deleted

### Account Deletion
- **Account deletion modal** - Warns users about data loss
- **Confirmation process** - Requires explicit confirmation
- **Data preview** - Shows what will be deleted

## Security Considerations

### Access Control
- **User ownership** - Users can only manage their own songs
- **Admin privileges** - Admins can manually purge trash
- **Authentication required** - All functions require authentication

### Data Protection
- **Soft delete first** - Songs go to trash before permanent deletion
- **10-day grace period** - Users have time to restore accidentally deleted songs
- **Audit trail** - All deletion actions are logged
- **Cascade safety** - Related data is properly handled

### Storage Security
- **File ownership validation** - Prevents deletion of other users' files
- **Bucket isolation** - Files are properly isolated by user
- **Cleanup verification** - Ensures files are actually removed

## Monitoring and Maintenance

### Audit Logging
- **Deletion actions** - All soft and hard deletions logged
- **Restoration actions** - All restorations logged
- **Account deletions** - Complete account deletion audit trail
- **Storage cleanup** - File deletion operations logged

### Performance Monitoring
- **Cron job monitoring** - Daily trash purge execution tracking
- **Storage usage** - Monitor storage bucket usage
- **Database performance** - Track deletion operation performance

### Error Handling
- **Graceful failures** - System continues operating if cleanup fails
- **Error logging** - All errors are logged for debugging
- **Recovery procedures** - Manual cleanup available for failed operations

## Troubleshooting

### Common Issues
1. **Songs not appearing in trash** - Check RLS policies and user ownership
2. **Restore not working** - Verify song wasn't eliminated (week 4)
3. **Storage files not deleted** - Check storage permissions and file paths
4. **Cron job not running** - Verify pg_cron extension and job configuration

### Manual Recovery
- **Admin functions** - Use `manual_purge_expired_trash()` for cleanup
- **Direct database access** - Service role can perform manual operations
- **Storage cleanup** - Manual file deletion via Supabase dashboard

This comprehensive song deletion system ensures data integrity, user control, and efficient storage management while maintaining security and auditability.
