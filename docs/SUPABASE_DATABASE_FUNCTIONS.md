# SongWars Database Functions Documentation

## Overview
This document provides comprehensive documentation for all database functions, stored procedures, and triggers in the SongWars system. These functions handle core business logic, data processing, and system automation.

**Total Functions: 67** (Updated January 2025)

## Function Categories

### 1. Golden Ears System Functions

#### `award_golden_ears(target_week_start date)`
**Purpose**: Awards Golden Ears to top 25% of qualified judges for a specific week.
**Parameters**:
- `target_week_start` (date): Week start date for awarding
**Returns**: `void`
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Counts qualified judges for the target week
- Calculates award count (top 25% of qualified users)
- Awards Golden Ears to top performers based on accuracy and battles judged
- Logs all awards and distribution completion
- Handles edge case where no users are qualified

**Key Features**:
- Conflict resolution with `ON CONFLICT` for duplicate awards
- Comprehensive audit logging
- Ranking system based on accuracy and battle count
- Graceful handling of zero qualified users

#### `calculate_judge_accuracy(target_judge_id uuid, target_week_start date)`
**Purpose**: Calculates and stores judge accuracy for Golden Ears qualification.
**Parameters**:
- `target_judge_id` (uuid): Judge to calculate accuracy for
- `target_week_start` (date): Week to calculate for
**Returns**: `numeric` (accuracy percentage)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Counts total battles for the judge in the target week
- Compares votes against final song scores to determine correctness
- Uses most recent song scores from churn system for accurate evaluation
- Handles tied votes (0.5 credit)
- Stores results in `weekly_stats` table
- Returns calculated accuracy percentage

**Key Features**:
- **Dynamic Score Resolution**: Uses most recent song scores regardless of churn week
- **Accurate Comparison**: Ensures fair evaluation based on current song performance
- **Tie Handling**: Partial credit (0.5) for tied battles
- **Conflict Resolution**: Handles duplicate stats with `ON CONFLICT`
- **Zero Battle Handling**: Returns 0 for weeks with no participation

#### `process_golden_ears()`
**Purpose**: Main function for processing Golden Ears awards for the previous week.
**Parameters**: None
**Returns**: `json` (processing status and results)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Calculates target week (2 weeks ago due to 1-week processing lag)
- Checks for existing processing to prevent duplicates
- Processes users in batches to prevent database overload
- Awards Golden Ears to top 25%
- Updates processing status and logs completion

**Key Features**:
- Batch processing for performance
- Duplicate prevention
- Comprehensive logging
- Error handling and recovery

#### `process_golden_ears_batch(target_week_start date, batch_size integer, offset_count integer)`
**Purpose**: Processes a batch of users for Golden Ears calculation.
**Parameters**:
- `target_week_start` (date): Week being processed
- `batch_size` (integer): Number of users per batch
- `offset_count` (integer): Offset for pagination
**Returns**: `json` (batch processing results)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Key Features**:
- Pagination support
- Progress tracking
- Performance optimization
- Zero user handling

#### `http_golden_ears_processor()`
**Purpose**: HTTP endpoint wrapper for automated Golden Ears processing.
**Parameters**: None
**Returns**: `json` (processing results)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Calculates previous week start date
- Calls main processing function
- Logs automation events
- Handles errors gracefully

### 2. Song Management Functions

#### `soft_delete_song(p_song_id uuid)`
**Purpose**: Soft deletes a song (moves to trash with expiration).
**Parameters**:
- `p_song_id` (uuid): Song ID to delete
**Returns**: `boolean` (success status)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates user ownership
- Sets deletion timestamp and 10-day expiration
- Marks song as inactive
- Logs deletion action
- Returns success status

#### `restore_song(p_song_id uuid)`
**Purpose**: Restores a soft-deleted song from trash.
**Parameters**:
- `p_song_id` (uuid): Song ID to restore
**Returns**: `boolean` (success status)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates ownership and trash status
- Checks if song was eliminated (week 4) vs. still in churn
- Restores appropriate active state
- Clears deletion timestamps
- Logs restoration action
- Returns success status

#### `hard_delete_song(p_song_id uuid)`
**Purpose**: Permanently deletes a song and its audio file.
**Parameters**:
- `p_song_id` (uuid): Song ID to permanently delete
**Returns**: `boolean` (success status)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates ownership and trash status
- Logs hard deletion
- Deletes song from database
- Removes audio file from storage
- Returns success status

#### `get_my_trashed_songs()`
**Purpose**: Gets all songs in trash for the current user.
**Parameters**: None
**Returns**: `TABLE(id uuid, title text, artist text, deleted_at timestamptz, trash_expires_at timestamptz)`
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Returns only user's own trashed songs
- Includes deletion and expiration timestamps
- Used by frontend trash management interface

#### `purge_expired_trash()`
**Purpose**: Permanently deletes songs that have expired from trash (10+ days old).
**Parameters**: None
**Returns**: `integer` (number of songs deleted)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Finds songs with `trash_expires_at` < now()
- Permanently deletes database records
- Removes associated audio files from storage
- Logs all deletions
- Returns count of deleted songs
- **Called by cron job daily at 2 AM**

#### `manual_purge_expired_trash()`
**Purpose**: Admin function to manually purge expired trash.
**Parameters**: None
**Returns**: `integer` (number of songs deleted)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates admin privileges
- Calls `purge_expired_trash()` function
- Returns count of deleted songs
- Used for manual cleanup operations

#### `update_song_privacy(song_uuid uuid, new_is_public boolean, new_privacy_level text)`
**Purpose**: Updates song privacy settings.
**Parameters**:
- `song_uuid` (uuid): Song ID
- `new_is_public` (boolean): New public status
- `new_privacy_level` (text): New privacy level
**Returns**: `boolean` (success status)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates ownership
- Updates privacy settings
- Auto-sets privacy level based on public status

### 3. Churn System Functions

#### `process_weekly_churn()`
**Purpose**: Processes weekly churn advancement for all active songs.
**Parameters**: None
**Returns**: `json` (processing results)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Advances all active songs to next churn week
- Calculates and stores weekly scores
- Eliminates songs at week 4 (marks inactive)
- Logs automation events
- Tracks processing statistics

**Key Features**:
- Only processes weeks 0-3 (week 4 is terminal)
- Score calculation and storage
- Elimination handling
- Comprehensive logging

#### `calculate_song_score(likes_count integer, dislikes_count integer)`
**Purpose**: Calculates song score using Wilson Score Interval for statistical confidence.
**Parameters**:
- `likes_count` (integer): Number of likes
- `dislikes_count` (integer): Number of dislikes
**Returns**: `numeric` (calculated Wilson score)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Calculates Wilson Score Interval (95% confidence)
- Balances approval rate with sample size confidence
- Prevents gaming with low vote counts
- Caps score at 100, minimum 0
- Returns neutral score (50) for zero votes

**Wilson Score Formula**:
```sql
w = ((p + z²/(2n) - z * sqrt((p*(1-p) + z²/(4n))/n)) / (1 + z²/n)) * 100
```
Where:
- p = approval rate (likes / total_votes)
- n = sample size (likes + dislikes)  
- z = 1.96 (95% confidence interval)

#### `pause_private_songs_in_churn()`
**Purpose**: Pauses private songs that are still in churn.
**Parameters**: None
**Returns**: `integer` (number of songs paused)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Finds private songs in churn weeks 1-4
- Sets paused flag in churnState JSONB
- Returns count of paused songs

#### `resume_public_songs_in_churn()`
**Purpose**: Resumes public songs that were previously paused.
**Parameters**: None
**Returns**: `integer` (number of songs resumed)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Finds paused songs that are now public
- Removes paused flag from churnState
- Returns count of resumed songs

### 4. Battle and Voting Functions

#### `record_comparison_vote(user_id uuid, chosen_song_id uuid, unchosen_song_id uuid)`
**Purpose**: Records a user's vote in a song battle.
**Parameters**:
- `user_id` (uuid): Voting user
- `chosen_song_id` (uuid): Song voted for
- `unchosen_song_id` (uuid): Song not chosen
**Returns**: `void`
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Creates battle record
- Records vote
- Updates song scores
- Logs vote for audit

#### `increment_song_scores(chosen_song_id uuid, unchosen_song_id uuid)`
**Purpose**: Updates song like/dislike counts after a vote.
**Parameters**:
- `chosen_song_id` (uuid): Song that received a vote
- `unchosen_song_id` (uuid): Song that didn't receive a vote
**Returns**: `void`
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Increments likes for chosen song
- Increments dislikes for unchosen song

#### `get_random_songs_for_comparison(genre_filter text, limit_count integer)`
**Purpose**: Retrieves random songs for battle comparison.
**Parameters**:
- `genre_filter` (text): Optional genre filter
- `limit_count` (integer): Number of songs to return
**Returns**: `record` (song data)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Filters by genre if specified
- Includes songs in churn or pre-churn
- Returns random selection
- Includes all necessary song data

### 5. User Management Functions

#### `delete_user_account()`
**Purpose**: Completely deletes a user account and all associated data.
**Parameters**: None
**Returns**: `void`
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates authentication
- Collects song filenames for storage cleanup BEFORE deletion
- Logs account deletion attempt
- Removes admin privileges if user is admin
- Deletes auth user (triggers cascade deletes)
- Cleans up song audio files from storage
- Logs all deletion actions
- Handles errors gracefully with comprehensive logging

**Key Features**:
- **Comprehensive data cleanup** - Removes all user data via cascade deletes
- **Storage file removal** - Deletes all user's song files from storage
- **Cascade delete handling** - Leverages database constraints for cleanup
- **Error handling and logging** - Complete audit trail of deletion process
- **Safety checks** - Prevents accidental deletion of other users' files

#### `get_user_weekly_progress(user_id uuid, week_start date)`
**Purpose**: Gets user's Golden Ears progress for a specific week.
**Parameters**:
- `user_id` (uuid): User ID
- `week_start` (date): Week start date (optional)
**Returns**: `json` (progress data)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Calculates progress percentage
- Determines qualification status
- Returns battles needed for qualification
- Handles missing data gracefully

### 6. Content Moderation Functions

#### `flag_song(p_song_id uuid, p_category flag_category, p_reason text)`
**Purpose**: Flags a song for content moderation.
**Parameters**:
- `p_song_id` (uuid): Song to flag
- `p_category` (flag_category): Flag category (copyright, hate_speech)
- `p_reason` (text): Flag reason
**Returns**: `integer` (total flags for song/category)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates authentication
- Prevents duplicate flags from same user
- Moves song to under_review after 5 flags
- Returns current flag count

#### `review_flag(p_song_id uuid, p_decision text, p_notes text)`
**Purpose**: Admin function to review flagged songs.
**Parameters**:
- `p_song_id` (uuid): Song to review
- `p_decision` (text): Decision (remove, approve, reenable)
- `p_notes` (text): Admin notes
**Returns**: `boolean` (success status)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Validates admin privileges
- Updates song status based on decision
- Logs admin actions
- Supports multiple decision types

### 7. Data Retrieval Functions

#### `get_leaderboard_by_genre_and_week(genre_filter text, week integer)`
**Purpose**: Gets leaderboard data for specific genre and week.
**Parameters**:
- `genre_filter` (text): Genre filter (optional)
- `week` (integer): Week number (1-3)
**Returns**: `record` (leaderboard data)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Filters by genre and week
- Calculates rankings
- Includes vote counts
- Returns ordered results

#### `get_top_songs_by_genre(genre_filter text)`
**Purpose**: Gets top songs by genre from completed churn.
**Parameters**:
- `genre_filter` (text): Genre filter (optional)
**Returns**: `record` (top songs data)
**Security**: `INVOKER`
**Language**: `PLPGSQL`

**Functionality**:
- Filters completed songs (inactive)
- Ranks by final score
- Groups by genre
- Returns top performers

#### `get_hall_of_fame_per_genre(p_churn_week_start timestamp with time zone, p_churn_week_end timestamp with time zone)`
**Purpose**: Gets Hall of Fame songs with per-genre limiting (top 10 per genre).
**Parameters**:
- `p_churn_week_start` (timestamp): Start date for churn week filtering (optional)
- `p_churn_week_end` (timestamp): End date for churn week filtering (optional)
**Returns**: `record` (Hall of Fame data with genre rankings)
**Security**: `DEFINER`
**Language**: `SQL`

**Functionality**:
- Ranks songs within each genre by Wilson Score
- Limits to top 10 songs per genre
- Supports optional churn week date filtering
- Includes username and audio metadata
- Ensures fair representation across all genres

**Key Features**:
- Per-genre ranking using `ROW_NUMBER() OVER (PARTITION BY genre)`
- Wilson Score ordering with vote count tie-breaker
- Efficient server-side processing
- Scalable as Hall of Fame grows

#### `get_churn_events_with_song_counts()`
**Purpose**: Gets churn events that have songs in the Hall of Fame.
**Parameters**: None
**Returns**: `record` (churn events with song counts)
**Security**: `DEFINER`
**Language**: `SQL`

**Functionality**:
- Filters churn events to only those with Hall of Fame songs
- Counts songs per churn event using date ranges
- Returns events with song counts > 0
- Orders chronologically for UI display

**Key Features**:
- Efficient server-side filtering
- Only returns relevant churn events
- Prevents empty churn weeks from appearing in UI
- Optimized for Hall of Fame dropdown population

#### `get_battle_available_genres()`
**Purpose**: Gets genres available for battles.
**Parameters**: None
**Returns**: `text` (genre list)
**Security**: `DEFINER`
**Language**: `SQL`

**Functionality**:
- Finds genres with 2+ active songs
- Filters by churn status
- Returns distinct genres

**Key Features**:
- **Dynamic Genre Detection**: Only returns genres with sufficient songs for battles
- **Real-time Updates**: Automatically reflects current song distribution
- **Battle Readiness Indicator**: Used by frontend to show battle status
- **Consistent Data Source**: Single source of truth for genre availability

### 8. Genre System Functions

#### Genre Management and Battle Status
The SongWars system uses a comprehensive genre management system that provides both static genre lists and dynamic battle availability indicators.

**Master Genre List**:
- Centralized list of major music genres in `utils/genres.ts`
- Consistent across all frontend components
- Includes: Alternative, Blues, Classical, Country, Dance, Electronic, Folk, Funk, Gospel, Hip-Hop, Jazz, Latin, Metal, Pop, Punk, R&B, Reggae, Rock, Ska, Soul, World, Other

**Battle Status Indicators**:
- **Dynamic Detection**: Uses `get_battle_available_genres()` RPC function
- **Real-time Updates**: Automatically reflects current song distribution
- **Visual Indicators**: 
  - `●` (filled dot) = Battle Ready (2+ active songs)
  - `○` (empty dot) = Needs More Songs (< 2 active songs)
- **Component Integration**: Used in song upload and edit forms

**Data Flow**:
1. Songs uploaded with genre selection
2. `get_battle_available_genres()` calculates battle-ready genres
3. Frontend components fetch and display status indicators
4. Users see real-time battle availability

### 9. Metrics and Analytics Functions

#### Core Metrics Functions
- `get_total_songs_count()`: Total songs in database
- `get_inactive_songs_count()`: Inactive songs count
- `get_songs_in_trash_count()`: Songs in trash count
- `get_total_users_count_from_auth()`: Total authenticated users
- `get_active_users_count(days_back integer)`: Active users count

#### Time-based Metrics Functions
- `get_song_upload_metrics()`: Song upload statistics
- `get_song_upload_metrics_tz(timezone_name text)`: Timezone-aware upload metrics
- `get_song_deletion_metrics()`: Song deletion statistics
- `get_voting_metrics()`: Voting statistics
- `get_golden_ears_metrics()`: Golden Ears statistics
- `get_battle_metrics_tz(timezone_name text)`: Battle creation statistics

#### Admin Metrics Functions
- `get_admin_action_metrics()`: Admin action statistics
- `get_account_deletion_metrics()`: Account deletion statistics
- `get_songs_by_genre_metrics()`: Genre breakdown statistics

### 10. Utility Functions

#### `is_admin()`
**Purpose**: Checks if current user is an admin.
**Parameters**: None
**Returns**: `boolean` (admin status)
**Security**: `INVOKER`
**Language**: `SQL`

#### `purge_expired_trash()`
**Purpose**: Permanently deletes expired trash songs.
**Parameters**: None
**Returns**: `integer` (number of songs deleted)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

#### `manual_purge_expired_trash()`
**Purpose**: Admin function to manually purge expired trash.
**Parameters**: None
**Returns**: `text` (purge message)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

### 12. Audio Fingerprint System

#### `check_audio_fingerprint(p_fingerprint_hash text)`
**Purpose**: Checks for duplicate audio files using fingerprint hashing.
**Parameters**:
- `p_fingerprint_hash` (text): Audio fingerprint hash to check
**Returns**: `json` (duplicate detection results)
**Security**: `DEFINER`
**Language**: `PLPGSQL`

**Functionality**:
- Searches `audio_fingerprints` table for matching hash
- Returns duplicate detection results
- Used to prevent duplicate song uploads
- Maintains audio integrity and prevents spam

**Key Features**:
- **Duplicate Prevention** - Prevents users from uploading the same song multiple times
- **Audio Integrity** - Ensures unique content in the system
- **Performance Optimization** - Fast hash-based lookup
- **Spam Prevention** - Reduces storage waste and improves user experience

### 13. Trigger Functions

#### `notify_golden_ears_award()`
**Purpose**: Trigger function to send notifications when Golden Ears are awarded.
**Returns**: `trigger`
**Language**: `PLPGSQL`

**Functionality**:
- Detects when `awarded` changes from false to true
- Creates notification for the user
- Sends congratulatory message

#### `set_clip_start_time_on_insert()`
**Purpose**: Trigger function to move clip_start_time to churnState JSONB.
**Returns**: `trigger`
**Language**: `PLPGSQL`

**Functionality**:
- Moves clip_start_time column value to churnState JSONB
- Preserves data in structured format
- Handles null values gracefully

## Security Considerations

### Row Level Security (RLS)
- All functions respect RLS policies
- User ownership validation where appropriate
- Admin privilege checks for sensitive operations

### Authentication
- Functions validate `auth.uid()` for user operations
- Admin functions check admin status
- Proper error handling for unauthenticated users

### Data Integrity
- Foreign key constraints maintained
- Cascade delete handling
- Conflict resolution with `ON CONFLICT`
- Transaction safety

## Performance Optimizations

### Batch Processing
- Golden Ears processing uses batching
- Prevents database overload
- Progress tracking and resumption

### Indexing
- Functions leverage existing indexes
- Efficient query patterns
- Minimal data scanning

### Caching
- Computed values stored in tables
- Reduces recalculation overhead
- Consistent data access patterns

## Error Handling

### Exception Management
- Comprehensive error logging
- Graceful failure handling
- User-friendly error messages
- Audit trail maintenance

### Validation
- Input parameter validation
- Business rule enforcement
- Data consistency checks
- Ownership verification

This comprehensive function library provides all the core business logic for the SongWars application, from user management and song battles to automated churn processing and Golden Ears awards. Each function is designed for security, performance, and maintainability.
