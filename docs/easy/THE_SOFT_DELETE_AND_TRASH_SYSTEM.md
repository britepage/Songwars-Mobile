# The Soft Delete and Trash System

## What is the Soft Delete System?

The Soft Delete and Trash System is SongWars' way of giving users a "second chance" when they want to remove their songs. Instead of permanently deleting songs immediately, the system moves them to a "trash can" where they can be recovered or permanently deleted later.

## How It Works

### The Three States of Songs

**1. Live Songs**
- Songs that are actively competing in battles
- Visible to all users in the platform
- Can be voted on and discovered
- Normal status for uploaded songs

**2. Trashed Songs (Soft Deleted)**
- Songs that users have "deleted" but are still recoverable
- Hidden from public view and battles
- Stored in the user's personal trash can
- Can be restored or permanently deleted
- Automatically purged after 10 days

**3. Permanently Deleted Songs (Hard Deleted)**
- Songs that have been permanently removed
- Cannot be recovered
- Audio files are deleted from storage
- Database records are removed

### The Trash Can Process

**Step 1: Soft Delete (Move to Trash)**
- User clicks "Delete" on their song
- Song is marked as deleted but not removed
- Song disappears from public view and battles
- Song moves to user's personal trash can
- 10-day countdown begins for automatic purging

**Step 2: Trash Management**
- Users can view their trashed songs
- Users can restore songs back to live status
- Users can permanently delete songs from trash
- System automatically purges expired songs

**Step 3: Automatic Cleanup**
- Songs in trash for 10+ days are automatically purged
- Audio files are permanently deleted from storage
- Database records are removed
- No recovery possible after automatic purge

## Why This System Exists

### User Benefits
- **Mistake Protection** - Users can recover accidentally deleted songs
- **Temporary Removal** - Remove songs without permanent commitment
- **Storage Management** - Clear out unwanted songs over time
- **Peace of Mind** - Know that deletions aren't immediate

### Platform Benefits
- **Data Recovery** - Prevents accidental data loss
- **Storage Efficiency** - Automatic cleanup of old trashed songs
- **User Satisfaction** - Reduces frustration from accidental deletions
- **System Stability** - Gradual cleanup prevents storage bloat

## How Users Interact with the System

### Deleting Songs
1. **Go to "My Songs"** page
2. **Find the song** you want to delete
3. **Click the delete button** (trash can icon)
4. **Confirm deletion** in the warning modal
5. **Song moves to trash** and disappears from public view

### Managing Trash
1. **Go to "My Songs"** page
2. **Click "Trash" tab** to view deleted songs
3. **See all trashed songs** with deletion dates
4. **Restore songs** by clicking the restore button
5. **Permanently delete** by clicking the permanent delete button

### Restoring Songs
1. **Open the trash can** from "My Songs" page
2. **Find the song** you want to restore
3. **Click "Restore"** button
4. **Song returns to live status** and rejoins battles
5. **Song becomes visible** to all users again

## Technical Details

### Database Structure
- **`deleted_at`** - Timestamp when song was soft deleted
- **`trash_expires_at`** - Timestamp when song will be auto-purged
- **`deleted_by`** - User who deleted the song
- **`is_active`** - Boolean flag for song status

### Automatic Processes
- **Daily cleanup** - System checks for expired trash
- **10-day retention** - Songs stay in trash for 10 days
- **Storage cleanup** - Audio files are deleted with songs
- **Database cleanup** - Records are removed after purge

### User Permissions
- **Own songs only** - Users can only manage their own trash
- **Restore permission** - Users can restore their own songs
- **Delete permission** - Users can permanently delete their own songs
- **View permission** - Users can only see their own trash

## Admin Features

### Trash Management
- **View all trashed songs** across the platform
- **Monitor trash usage** and storage impact
- **Manual cleanup** if needed
- **Restore any song** if necessary

### System Monitoring
- **Track trash statistics** - how many songs are trashed
- **Monitor storage usage** - impact on file storage
- **Cleanup reports** - what was automatically purged
- **User behavior** - deletion and restoration patterns

## Best Practices

### For Users
- **Review trash regularly** - don't let it accumulate
- **Restore songs quickly** - before the 10-day limit
- **Think before deleting** - consider if you might want the song back
- **Clean up trash** - permanently delete songs you don't want

### For Admins
- **Monitor trash usage** - ensure system is working properly
- **Check cleanup logs** - verify automatic processes
- **Help users** - assist with recovery if needed
- **Maintain storage** - ensure adequate space for trash

## Common Scenarios

### Accidental Deletion
1. **User accidentally deletes** their best song
2. **Song moves to trash** but is recoverable
3. **User realizes mistake** and goes to trash
4. **User restores song** and it rejoins battles
5. **No harm done** - song is back to normal

### Temporary Removal
1. **User wants to remove** a song temporarily
2. **User deletes song** to move it to trash
3. **Song disappears** from public view
4. **User changes mind** and restores song
5. **Song returns** to normal competition

### Permanent Cleanup
1. **User has old songs** they don't want anymore
2. **User deletes songs** to move them to trash
3. **User waits 10 days** for automatic cleanup
4. **System purges songs** and frees up storage
5. **Storage is cleaned** and optimized

## Troubleshooting

### Song Not in Trash
- **Check if song was hard deleted** - not recoverable
- **Verify user permissions** - can only see own trash
- **Check deletion date** - may have been auto-purged
- **Contact admin** - may need assistance

### Cannot Restore Song
- **Check if song expired** - past 10-day limit
- **Verify user permissions** - can only restore own songs
- **Check song status** - may have other issues
- **Contact admin** - may need assistance

### Storage Issues
- **Check trash usage** - may be taking up too much space
- **Run manual cleanup** - force purge expired songs
- **Monitor storage** - ensure adequate space
- **Contact admin** - may need storage management

## System Benefits

### User Experience
- **Mistake protection** - recover from accidental deletions
- **Flexible management** - temporary and permanent options
- **Peace of mind** - know deletions aren't immediate
- **Easy recovery** - simple restore process

### Platform Health
- **Data protection** - prevent accidental data loss
- **Storage efficiency** - automatic cleanup of old data
- **System stability** - gradual cleanup prevents issues
- **User satisfaction** - reduce frustration and support requests

### Business Value
- **User retention** - reduce churn from accidental deletions
- **Support reduction** - fewer recovery requests
- **Storage optimization** - efficient use of resources
- **Platform reliability** - stable and predictable system

## Conclusion

The Soft Delete and Trash System is a crucial feature that protects users from accidental data loss while maintaining platform efficiency. By providing a "second chance" for deleted songs, the system balances user needs with technical requirements, creating a more robust and user-friendly platform.

**Key Takeaways:**
- **Songs aren't immediately deleted** - they go to trash first
- **Users have 10 days** to recover deleted songs
- **Automatic cleanup** prevents storage bloat
- **Easy recovery** process for users
- **Admin oversight** for system management

This system ensures that SongWars users can manage their content confidently, knowing that mistakes can be corrected and that the platform maintains optimal performance through intelligent cleanup processes.
