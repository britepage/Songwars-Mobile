# SongWars Database Schema Documentation

## Overview
This document provides a comprehensive overview of the SongWars database schema, including all tables, columns, relationships, indexes, and constraints.

## Database Tables

### Core Tables

#### `profiles`
User profile information and authentication data.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**: 
  - `id` → `auth.users.id` (Supabase Auth integration)
- **Unique Constraints**: `username`
- **Indexes**: 
  - Primary key index
  - Username index (unique)
  - Role index
- **Columns**:
  - `id` (uuid, NOT NULL) - Primary key, linked to auth.users
  - `username` (text, NULLABLE, UNIQUE) - User's chosen username
  - `display_name` (text, NULLABLE) - User's display name
  - `bio` (text, NULLABLE) - User biography
  - `avatar_url` (text, NULLABLE) - Profile picture URL
  - `role` (text, NOT NULL, DEFAULT: 'fan') - User role (fan, artist, admin)
  - `is_public` (boolean, NULLABLE, DEFAULT: true) - Profile visibility
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `musical_preferences` (text, NULLABLE) - User's music preferences
  - `age_range` (text, NULLABLE) - User's age range
  - `region` (text, NULLABLE) - User's geographic region
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now())
  - `updated_at` (timestamp with time zone, NOT NULL, DEFAULT: now())

#### `songs`
Core song data and metadata.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `user_id` → `profiles.id`
  - `deleted_by` → `profiles.id` (soft delete)
  - `status_changed_by` → `profiles.id` (status changes)
- **Indexes**:
  - Primary key index
  - Active songs index
  - Active and not deleted index
  - Genre index
  - Privacy index
  - Churn-related indexes
  - Deletion indexes
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `user_id` (uuid, NOT NULL) - Song owner
  - `title` (text, NOT NULL) - Song title
  - `artist` (text, NOT NULL) - Artist name
  - `url` (text, NULLABLE) - Audio file URL
  - `filename` (text, NULLABLE) - Original filename
  - `genre` (text, NULLABLE, DEFAULT: 'general') - Song genre
  - `clip_start_time` (numeric, NULLABLE) - Start time for audio clips
  - `likes` (integer, NOT NULL, DEFAULT: 0) - Like count
  - `dislikes` (integer, NOT NULL, DEFAULT: 0) - Dislike count
  - `is_active` (boolean, NULLABLE, DEFAULT: true) - Song active status
  - `is_public` (boolean, NULLABLE, DEFAULT: true) - Public visibility
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `privacy_level` (text, NULLABLE, DEFAULT: 'public') - Privacy setting
  - `rights_confirmed` (boolean, NOT NULL, DEFAULT: false) - Rights confirmation
  - `status` (song_status, NOT NULL, DEFAULT: 'live') - Song status enum
  - `status_changed_at` (timestamp with time zone, NULLABLE) - Status change time
  - `status_changed_by` (uuid, NULLABLE) - Who changed status
  - `status_change_reason` (text, NULLABLE) - Reason for status change
  - `deleted_at` (timestamp with time zone, NULLABLE) - Soft delete timestamp
  - `deleted_by` (uuid, NULLABLE) - Who deleted the song
  - `trash_expires_at` (timestamp with time zone, NULLABLE) - Trash expiration (10 days)
  - `churnState` (jsonb, NULLABLE, DEFAULT: '{"week": 4, "finalScore": null, "weeksInChurn": 0, "countdownStartDate": null}') - Churn system state
  - `churn_start_date` (timestamp with time zone, NULLABLE) - Churn start date
  - `last_score_update` (timestamp with time zone, NULLABLE, DEFAULT: now()) - Last score update
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Creation timestamp

#### `battles`
Song battle/competition data.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `song_a_id` → `songs.id`
  - `song_b_id` → `songs.id`
- **Indexes**:
  - Primary key index
  - Creation date index
  - Song A and B indexes
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `song_a_id` (uuid, NOT NULL) - First song in battle
  - `song_b_id` (uuid, NOT NULL) - Second song in battle
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Battle creation time

#### `votes`
User votes on battles.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `battle_id` → `battles.id`
  - `song_id_voted_for` → `songs.id`
  - `user_id` → `profiles.id`
- **Indexes**:
  - Primary key index
  - Battle ID index
  - Song voted for index
  - User ID index
  - User and week index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `battle_id` (uuid, NOT NULL) - Battle being voted on
  - `user_id` (uuid, NOT NULL) - User casting vote
  - `song_id_voted_for` (uuid, NOT NULL) - Song voted for
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Vote timestamp

### Scoring and Competition Tables

#### `weekly_scores`
Weekly song performance scores.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `song_id` → `songs.id`
- **Unique Constraints**: `(song_id, week_number)`
- **Indexes**:
  - Primary key index
  - Song and week index
  - Week number index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `song_id` (uuid, NOT NULL) - Song being scored
  - `week_number` (integer, NOT NULL) - Week number
  - `likes` (integer, NULLABLE, DEFAULT: 0) - Weekly likes
  - `dislikes` (integer, NULLABLE, DEFAULT: 0) - Weekly dislikes
  - `score` (numeric, NULLABLE, DEFAULT: 0) - Weekly score
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Score creation time

#### `weekly_stats`
Weekly user judging statistics for Golden Ears.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `judge_id` → `profiles.id`
- **Unique Constraints**: `(judge_id, week_start)`
- **Indexes**:
  - Primary key index
  - Judge ID index
  - Week start index
  - Qualified users index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `judge_id` (uuid, NOT NULL) - User being judged
  - `week_start` (date, NOT NULL) - Week start date
  - `week_end` (date, NOT NULL) - Week end date
  - `battles_judged` (integer, NOT NULL, DEFAULT: 0) - Battles judged count
  - `correct_votes` (integer, NOT NULL, DEFAULT: 0) - Correct votes count
  - `tied_votes` (integer, NOT NULL, DEFAULT: 0) - Tied votes count
  - `accuracy` (numeric, NOT NULL, DEFAULT: 0) - Accuracy percentage
  - `qualified` (boolean, NOT NULL, DEFAULT: false) - Qualification status
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Stats creation time

#### `golden_ears`
Golden Ears awards and rankings.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `judge_id` → `profiles.id`
- **Unique Constraints**: `(judge_id, week_start)`
- **Indexes**:
  - Primary key index
  - Judge ID index
  - Week start index
  - Awarded users index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `judge_id` (uuid, NOT NULL) - Award recipient
  - `week_start` (date, NOT NULL) - Week start date
  - `week_end` (date, NOT NULL) - Week end date
  - `battles_judged` (integer, NOT NULL) - Battles judged count
  - `accuracy_score` (numeric, NOT NULL) - Accuracy score
  - `rank_position` (integer, NOT NULL) - Ranking position
  - `awarded` (boolean, NOT NULL, DEFAULT: false) - Award status
  - `is_test_data` (boolean, NULLABLE, DEFAULT: false) - Test data flag
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Award creation time

#### `golden_ears_processing`
Golden Ears processing status and progress.
- **Primary Key**: `id` (uuid)
- **Unique Constraints**: `week_start`
- **Indexes**:
  - Primary key index
  - Week start index
  - Status index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `week_start` (date, NOT NULL) - Week being processed
  - `status` (text, NOT NULL, DEFAULT: 'processing') - Processing status
  - `total_users` (integer, NOT NULL) - Total users to process
  - `processed_users` (integer, NOT NULL, DEFAULT: 0) - Users processed
  - `started_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Processing start time
  - `completed_at` (timestamp with time zone, NULLABLE) - Processing completion time
  - `error_message` (text, NULLABLE) - Error message if failed

#### `audio_fingerprints`
Audio fingerprint system for duplicate detection.
- **Primary Key**: `id` (uuid)
- **Indexes**:
  - Primary key index
  - Fingerprint hash index (unique)
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `fingerprint_hash` (text, NOT NULL, UNIQUE) - Audio fingerprint hash
  - `song_id` (uuid, NULLABLE) - Associated song ID
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Creation timestamp

### System Management Tables

#### `admin_users`
Administrative user access control.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `id` → `profiles.id`
- **Indexes**:
  - Primary key index
- **Columns**:
  - `id` (uuid, NOT NULL) - Admin user ID (linked to profiles)
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Admin access granted time

#### `audit_log`
System audit trail for tracking actions.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `user_id` → `profiles.id` (nullable for system actions)
- **Indexes**:
  - Primary key index
  - Action type index
  - User ID index
  - Created at index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `action` (text, NOT NULL) - Action performed
  - `user_id` (uuid, NULLABLE) - User who performed action
  - `details` (jsonb, NULLABLE) - Additional action details
  - `created_at` (timestamp with time zone, NULLABLE, DEFAULT: now()) - Action timestamp

#### `song_flags`
Song flagging system for content moderation.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `song_id` → `songs.id`
  - `user_id` → `profiles.id`
- **Unique Constraints**: `(song_id, user_id, category)`
- **Indexes**:
  - Primary key index
  - Song and category index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `song_id` (uuid, NOT NULL) - Flagged song
  - `user_id` (uuid, NOT NULL) - User who flagged
  - `category` (flag_category, NOT NULL) - Flag category enum
  - `reason` (text, NULLABLE) - Flag reason
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Flag creation time

#### `churn_events`
Churn system event logging.
- **Primary Key**: `id` (uuid)
- **Indexes**:
  - Primary key index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `event_type` (text, NOT NULL) - Event type
  - `event_date` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Event timestamp
  - `songs_processed` (integer, NULLABLE, DEFAULT: 0) - Songs processed count
  - `songs_completed` (integer, NULLABLE, DEFAULT: 0) - Songs completed count
  - `details` (jsonb, NULLABLE) - Event details

#### `notifications`
User notification system.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `user_id` → `profiles.id`
- **Indexes**:
  - Primary key index
  - User ID index
  - Type index
  - Unread notifications index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `user_id` (uuid, NOT NULL) - Notification recipient
  - `type` (text, NOT NULL) - Notification type
  - `title` (text, NOT NULL) - Notification title
  - `message` (text, NOT NULL) - Notification message
  - `read` (boolean, NOT NULL, DEFAULT: false) - Read status
  - `created_at` (timestamp with time zone, NOT NULL, DEFAULT: now()) - Notification time

#### `user_tags`
User song tagging system.
- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `user_id` → `profiles.id`
  - `song_id` → `songs.id`
- **Unique Constraints**: `(user_id, song_id)`
- **Indexes**:
  - Primary key index
  - User ID index
  - Song ID index
- **Columns**:
  - `id` (uuid, NOT NULL, DEFAULT: gen_random_uuid()) - Primary key
  - `user_id` (uuid, NOT NULL) - User who tagged
  - `song_id` (uuid, NOT NULL) - Tagged song
  - `created_at` (timestamp with time zone, NULLABLE, DEFAULT: now()) - Tag creation time

## Enums

### `song_status`
Song status enumeration:
- `live` - Song is active and visible
- `under_review` - Song is being reviewed
- `removed` - Song has been removed

### `flag_category`
Song flagging categories:
- `copyright` - Copyright violation
- `hate_speech` - Hate speech content

## Key Relationships

### User Flow
1. **Authentication**: Users authenticate via Supabase Auth (`auth.users`)
2. **Profile Creation**: Profile created in `profiles` table linked to `auth.users.id`
3. **Song Upload**: Songs created in `songs` table with `user_id` reference
4. **Battles**: Songs compete in `battles` with votes tracked in `votes`
5. **Scoring**: Weekly scores calculated and stored in `weekly_scores`
6. **Golden Ears**: User judging stats tracked in `weekly_stats` and awards in `golden_ears`

### Data Integrity
- **Cascade Deletes**: When users are deleted, related data is cleaned up
- **Soft Deletes**: Songs use soft delete with `deleted_at` and `trash_expires_at`
- **Audit Trail**: All significant actions logged in `audit_log`
- **Unique Constraints**: Prevent duplicate votes, tags, and weekly records

### Performance Optimizations
- **Strategic Indexes**: Optimized for common query patterns
- **Partial Indexes**: Used for filtered queries (e.g., active songs, unread notifications)
- **Composite Indexes**: Multi-column indexes for complex queries
- **JSONB Indexes**: GIN indexes for JSONB columns where needed

## Security Considerations
- **Row Level Security (RLS)**: Implemented on all tables
- **Foreign Key Constraints**: Ensure referential integrity
- **Audit Logging**: Track all user actions for security monitoring
- **Soft Delete System**: Prevent accidental data loss
- **Admin Controls**: Separate admin user management

This schema supports the full SongWars application including user management, song battles, scoring systems, Golden Ears awards, content moderation, and comprehensive audit trails.
