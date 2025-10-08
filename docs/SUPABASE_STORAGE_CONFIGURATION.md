# SongWars Storage Configuration

## Overview
This document provides comprehensive documentation of the Supabase Storage configuration for SongWars, including bucket policies, file management, and storage operations.

**Total Storage Buckets: 2** (Updated January 2025)
**Total Storage Policies: 6** (Updated January 2025)

## Storage Buckets

### 1. Song Audio Bucket (`song-audio`)

#### Configuration
- **Bucket ID**: `song-audio`
- **Public Access**: `true`
- **File Size Limit**: `null` (no limit)
- **Allowed MIME Types**: `null` (no restrictions)
- **Created**: `2025-06-22 17:50:13.106428+00`
- **Updated**: `2025-06-22 17:50:13.106428+00`

#### Purpose
- Stores 30-second battle clips for song battles
- Public access for anonymous battle participation
- No file size restrictions for audio quality

#### File Structure
```
song-audio/
├── songs/
│   ├── {song_id}.mp3
│   ├── {song_id}.wav
│   └── {song_id}.m4a
```

#### File Naming Convention
- **Pattern**: `songs/{song_id}.{extension}`
- **Example**: `songs/123e4567-e89b-12d3-a456-426614174000.mp3`
- **Extensions**: `.mp3`, `.wav`, `.m4a` (based on upload format)

#### Access Control
- **Public Read**: All users can access audio files
- **Upload**: Only authenticated users can upload
- **Delete**: Only song owners and system can delete

### 2. Avatars Bucket (`avatars`)

#### Configuration
- **Bucket ID**: `avatars`
- **Public Access**: `true`
- **File Size Limit**: `null` (no limit)
- **Allowed MIME Types**: `null` (no restrictions)
- **Created**: `2025-06-28 01:09:23.573182+00`
- **Updated**: `2025-06-28 01:09:23.573182+00`

#### Purpose
- Stores user profile pictures
- Public access for profile display
- No file size restrictions for image quality

#### File Structure
```
avatars/
├── {user_id}.jpg
├── {user_id}.png
├── {user_id}.webp
└── {user_id}.gif
```

#### File Naming Convention
- **Pattern**: `{user_id}.{extension}`
- **Example**: `avatars/123e4567-e89b-12d3-a456-426614174000.jpg`
- **Extensions**: `.jpg`, `.png`, `.webp`, `.gif`

#### Access Control
- **Public Read**: All users can view avatars
- **Upload**: Only authenticated users can upload their own avatar
- **Delete**: Only avatar owners can delete

## Storage Operations

### File Upload Process

#### Song Audio Upload
1. **Validation**: Check file type and size
2. **Processing**: Convert to 30-second battle clip
3. **Storage**: Upload to `song-audio/songs/` with song ID
4. **Database**: Update song record with file URL
5. **Cleanup**: Remove temporary files

#### Avatar Upload
1. **Validation**: Check image type and size
2. **Processing**: Resize and optimize image
3. **Storage**: Upload to `avatars/` with user ID
4. **Database**: Update profile record with avatar URL
5. **Cleanup**: Remove old avatar if exists

### File Deletion Process

#### Song Audio Deletion
1. **Soft Delete**: Song moved to trash (file preserved)
2. **Hard Delete**: Song permanently deleted
3. **Storage Cleanup**: Audio file removed from storage
4. **Database**: Song record deleted

#### Avatar Deletion
1. **Profile Update**: Avatar URL set to null
2. **Storage Cleanup**: Avatar file removed
3. **Database**: Profile record updated

### File Access Patterns

#### Public Access
- **Song Audio**: Direct URL access for battles
- **Avatars**: Direct URL access for profile display
- **CDN**: Files served through Supabase CDN

#### Authenticated Access
- **Upload**: Users can upload their own files
- **Update**: Users can replace their own files
- **Delete**: Users can delete their own files

## Storage Policies

### Bucket-Level Policies

#### Song Audio Bucket
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'song-audio');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'song-audio' 
  AND auth.role() = 'authenticated'
);

-- Allow song owners to delete
CREATE POLICY "Song owner delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'song-audio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Avatars Bucket
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to upload their own avatar
CREATE POLICY "User avatar upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.filename(name))
);

-- Allow users to delete their own avatar
CREATE POLICY "User avatar delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.filename(name))
);
```

### File-Level Security

#### Access Control
- **Public Files**: Accessible without authentication
- **Private Files**: Require authentication and ownership
- **Admin Files**: Require admin privileges

#### File Validation
- **Type Checking**: Validate file extensions and MIME types
- **Size Limits**: Enforce reasonable file size limits
- **Content Validation**: Check file content for security

## Storage Management

### File Lifecycle

#### Song Audio Lifecycle
1. **Upload**: User uploads song, creates 30-second clip
2. **Active**: File used in battles and competitions
3. **Soft Delete**: File preserved in trash for 10 days
4. **Hard Delete**: File permanently removed
5. **Cleanup**: Orphaned files removed by system

#### Avatar Lifecycle
1. **Upload**: User uploads profile picture
2. **Active**: File used for profile display
3. **Update**: User replaces with new avatar
4. **Delete**: User removes avatar, file deleted
5. **Cleanup**: Orphaned files removed by system

### Storage Optimization

#### File Compression
- **Audio**: Compressed to reasonable quality for web
- **Images**: Optimized for web display
- **Formats**: Use efficient formats (MP3, WebP)

#### CDN Integration
- **Global Distribution**: Files served from edge locations
- **Caching**: Aggressive caching for performance
- **Compression**: Gzip compression for text files

### Storage Monitoring

#### Usage Tracking
- **File Count**: Monitor total files per bucket
- **Storage Size**: Track storage usage
- **Access Patterns**: Monitor file access frequency

#### Cleanup Operations
- **Orphaned Files**: Remove files without database references
- **Expired Files**: Remove files past expiration
- **Size Limits**: Enforce storage quotas

## Error Handling

### Upload Errors
- **File Too Large**: Return appropriate error message
- **Invalid Type**: Reject unsupported file types
- **Storage Full**: Handle storage quota exceeded
- **Network Issues**: Retry upload on failure

### Access Errors
- **File Not Found**: Handle missing files gracefully
- **Permission Denied**: Return appropriate error
- **Network Issues**: Retry access on failure

### Cleanup Errors
- **File Locked**: Retry deletion later
- **Permission Issues**: Log and handle appropriately
- **Network Issues**: Retry cleanup operations

## Performance Considerations

### File Size Optimization
- **Audio Files**: 30-second clips, compressed format
- **Images**: Optimized for web display
- **Metadata**: Minimal metadata storage

### Access Patterns
- **Frequent Access**: Cache frequently accessed files
- **Batch Operations**: Group file operations when possible
- **Async Processing**: Handle file operations asynchronously

### Storage Limits
- **Per User**: Reasonable limits per user
- **Total Storage**: Monitor total storage usage
- **Cleanup**: Regular cleanup of unused files

## Security Considerations

### File Validation
- **Type Checking**: Validate file types and extensions
- **Content Scanning**: Scan for malicious content
- **Size Limits**: Enforce reasonable file size limits

### Access Control
- **Authentication**: Require authentication for uploads
- **Authorization**: Check ownership for modifications
- **Public Access**: Limit public access to necessary files

### Data Protection
- **Encryption**: Files encrypted at rest
- **Transit**: Secure transmission of files
- **Backup**: Regular backups of important files

This storage configuration provides a robust, secure, and scalable file management system for SongWars, supporting both public access for battles and private access for user content.
