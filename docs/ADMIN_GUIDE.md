# Admin Guide

This document describes how to manage admin access and use the moderation tools in SongWars.

## Admin Access

Admins are managed via the `public.admin_users` table. Grant/revoke via Supabase SQL editor.

### Grant admin to a user
```sql
INSERT INTO public.admin_users (id) VALUES ('<user_uuid>');
```

### Verify admin
```sql
SELECT * FROM public.admin_users WHERE id = '<user_user_uuid>';
```

### Revoke admin
```sql
DELETE FROM public.admin_users WHERE id = '<your_user_uuid>';
```

Notes:
- Only authenticated users can check their own membership (RLS); writes are manual via SQL editor or service role.
- Admin-only routes/pages use middleware `middleware/admin.ts` which checks membership in `admin_users`.

## Moderation (Flagging System)

- Songs have `status` column: `live | under_review | removed`.
- Users can flag songs with categories: `hate_speech`, `copyright`.
- 5 flags in a category automatically set the song to `under_review`.
- Admins review at `/admin/flags`:
  - Approve → song status becomes `live` (resumes rotation)
  - Remove → song status becomes `removed` (hidden from rotation and public views)

### RPCs
- `flag_song(song_id uuid, category flag_category, reason text)` → inserts a flag and returns current count.
- `review_flag(song_id uuid, decision text)` → admin-only; `approve`, `remove`, or `reenable`.
- `get_flagged_songs_summary()` → admin-only; returns summary of all flagged songs with counts and metadata.

### Admin Review Actions
- **Approve** → song status becomes `live` (resumes rotation)
- **Remove** → song status becomes `removed` (hidden from rotation and public views)
- **Re-enable** → song status becomes `live` (restores accidentally removed songs)

### User Flagging Interface
- Users can flag songs from the battle interface via "More Actions" → "Flag Song"
- Flag modal includes:
  - Song title and artist display
  - Category selection (Hate Speech / Copyright)
  - Optional reason text
  - Submit confirmation
- Duplicate flags from same user on same song are prevented
- Success feedback shows total flag count

## Upload Compliance

Uploaders must confirm rights. The UI enforces a required checkbox and the back end stores `rights_confirmed = true` on the song.

## Admin Review Interface

The `/admin/flags` page provides:
- List of all flagged songs with flag counts by category
- Song metadata (title, artist, genre, status)
- Visual indicators for high flag counts (≥5 flags highlighted in red)
- Action buttons (Approve/Remove) with status-aware disabling
- Timestamp of last flag activity
- Automatic refresh after actions
