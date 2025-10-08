# User Moderation Guide

This document describes how users interact with the content moderation system in SongWars, including how to understand their song's moderation status and how to appeal decisions.

## Song Status Display

When viewing your songs in the "My Songs" section, songs may display different status indicators:

### Status Types

- **Active** (default) - Song is live and available for battles
- **Under Review** - Song has been flagged and is being reviewed
- **Removed** - Song was removed following review

### Status Information

For songs that are "Under Review" or "Removed", an information icon (ℹ️) appears next to the status badge. Clicking this icon opens a popunder with detailed information:

#### Under Review Songs
- Shows which categories triggered the review (e.g., "Copyright (5 flags)")
- Explains that the song is temporarily paused from battles
- Includes timestamp of last status change
- Provides appeal email contact: policy@songwars.com

#### Removed Songs
- Shows which categories had flags (e.g., "Hate Speech (2 flags), Copyright (3 flags)")
- Explains that the song was removed following review
- Includes timestamp of last status change
- Provides appeal email contact: policy@songwars.com

## Appeal Process

If you believe your song was incorrectly flagged or removed:

1. **Contact Support**: Email policy@songwars.com with:
   - Your username
   - Song title and artist
   - Reason for appeal
   - Any additional context

2. **Review Process**: Admins will review your appeal and may:
   - Re-enable the song if it was incorrectly flagged
   - Maintain the current status if the decision was correct
   - Provide additional explanation if needed

## Flagging System

Users can flag songs they encounter in battles for content violations:

### Flag Categories
- **Hate Speech** - Content that promotes hate or discrimination
- **Copyright** - Unauthorized use of copyrighted material

### Flagging Process
1. During a battle, click "More Actions" → "Flag Song"
2. Select the appropriate category
3. Optionally provide a reason
4. Submit the flag

### Flag Limits
- Users can only flag each song once per category
- 5 flags in a category automatically triggers admin review
- Additional flags at multiples of 5 (10, 15, 20...) trigger re-review

## Rights Confirmation

When uploading songs, users must confirm they have the rights to upload the content. This is enforced through a required checkbox in the upload form.

## Privacy and Moderation

- Private songs are not subject to public flagging
- Songs under review are automatically paused from battles
- Removed songs are hidden from all public views
- Status changes are logged with timestamps for transparency

## Technical Details

- Status information is fetched via the `get_my_song_moderation` RPC
- Flag counts are displayed per category
- Status change history includes admin notes and timestamps
- All moderation data is owner-safe (users can only see their own song details)
