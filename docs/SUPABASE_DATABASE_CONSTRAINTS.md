# SongWars Database Constraints

## Overview
This document provides comprehensive documentation of all database constraints implemented in the SongWars system, including primary keys, foreign keys, unique constraints, and check constraints.

**Total Database Constraints: Comprehensive constraint system for data integrity** (Updated January 2025)

## Constraint Categories

### 1. Primary Key Constraints

#### `admin_users_pkey`
- **Table**: `admin_users`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for admin users

#### `audit_log_pkey`
- **Table**: `audit_log`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for audit log entries

#### `battles_pkey`
- **Table**: `battles`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for battles

#### `churn_events_pkey`
- **Table**: `churn_events`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for churn events

#### `golden_ears_pkey`
- **Table**: `golden_ears`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for Golden Ears awards

#### `golden_ears_processing_pkey`
- **Table**: `golden_ears_processing`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for Golden Ears processing records

#### `notifications_pkey`
- **Table**: `notifications`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for notifications

#### `profiles_pkey`
- **Table**: `profiles`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for user profiles

#### `song_flags_pkey`
- **Table**: `song_flags`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for song flags

#### `songs_pkey`
- **Table**: `songs`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for songs

#### `user_tags_pkey`
- **Table**: `user_tags`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for user tags

#### `votes_pkey`
- **Table**: `votes`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for votes

#### `weekly_scores_pkey`
- **Table**: `weekly_scores`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for weekly scores

#### `weekly_stats_pkey`
- **Table**: `weekly_stats`
- **Type**: `PRIMARY KEY`
- **Column**: `id`
- **Purpose**: Unique identifier for weekly stats

### 2. Foreign Key Constraints

#### `admin_users_id_fkey`
- **Table**: `admin_users`
- **Column**: `id`
- **Referenced Table**: `auth.users`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links admin users to auth users

#### `battles_song_a_id_fkey`
- **Table**: `battles`
- **Column**: `song_a_id`
- **Referenced Table**: `songs`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links battle to first song

#### `battles_song_b_id_fkey`
- **Table**: `battles`
- **Column**: `song_b_id`
- **Referenced Table**: `songs`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links battle to second song

#### `golden_ears_judge_id_fkey`
- **Table**: `golden_ears`
- **Column**: `judge_id`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links Golden Ears award to judge

#### `notifications_user_id_fkey`
- **Table**: `notifications`
- **Column**: `user_id`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links notification to user

#### `profiles_id_fkey`
- **Table**: `profiles`
- **Column**: `id`
- **Referenced Table**: `auth.users`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links profile to auth user

#### `song_flags_song_id_fkey`
- **Table**: `song_flags`
- **Column**: `song_id`
- **Referenced Table**: `songs`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links flag to song

#### `song_flags_user_id_fkey`
- **Table**: `song_flags`
- **Column**: `user_id`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links flag to user

#### `songs_deleted_by_fkey`
- **Table**: `songs`
- **Column**: `deleted_by`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `NO ACTION`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links soft delete to user

#### `songs_status_changed_by_fkey`
- **Table**: `songs`
- **Column**: `status_changed_by`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `NO ACTION`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links status change to user

#### `songs_user_id_fkey`
- **Table**: `songs`
- **Column**: `user_id`
- **Referenced Table**: `auth.users`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links song to auth user

#### `songs_user_id_profiles_fkey`
- **Table**: `songs`
- **Column**: `user_id`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links song to profile

#### `user_tags_song_id_fkey`
- **Table**: `user_tags`
- **Column**: `song_id`
- **Referenced Table**: `songs`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links tag to song

#### `user_tags_user_id_fkey`
- **Table**: `user_tags`
- **Column**: `user_id`
- **Referenced Table**: `auth.users`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links tag to auth user

#### `votes_battle_id_fkey`
- **Table**: `votes`
- **Column**: `battle_id`
- **Referenced Table**: `battles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links vote to battle

#### `votes_song_id_voted_for_fkey`
- **Table**: `votes`
- **Column**: `song_id_voted_for`
- **Referenced Table**: `songs`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links vote to chosen song

#### `votes_user_id_fkey`
- **Table**: `votes`
- **Column**: `user_id`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links vote to user

#### `weekly_scores_song_id_fkey`
- **Table**: `weekly_scores`
- **Column**: `song_id`
- **Referenced Table**: `songs`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links weekly score to song

#### `weekly_stats_judge_id_fkey`
- **Table**: `weekly_stats`
- **Column**: `judge_id`
- **Referenced Table**: `profiles`
- **Referenced Column**: `id`
- **Delete Rule**: `CASCADE`
- **Update Rule**: `NO ACTION`
- **Purpose**: Links weekly stats to judge

### 3. Unique Constraints

#### `profiles_username_key`
- **Table**: `profiles`
- **Type**: `UNIQUE`
- **Columns**: `username`
- **Purpose**: Ensures unique usernames

#### `profiles_username_lower_unique`
- **Table**: `profiles`
- **Type**: `UNIQUE INDEX`
- **Columns**: `lower(username)`
- **Condition**: `WHERE username IS NOT NULL`
- **Purpose**: Case-insensitive unique usernames (prevents "User" and "user")

#### `golden_ears_week_unique`
- **Table**: `golden_ears`
- **Type**: `UNIQUE`
- **Columns**: `judge_id, week_start`
- **Purpose**: One Golden Ears award per judge per week

#### `golden_ears_processing_week_unique`
- **Table**: `golden_ears_processing`
- **Type**: `UNIQUE`
- **Columns**: `week_start`
- **Purpose**: One processing record per week

#### `song_flags_unique_per_user`
- **Table**: `song_flags`
- **Type**: `UNIQUE`
- **Columns**: `song_id, user_id, category`
- **Purpose**: One flag per user per song per category

#### `user_tags_user_id_song_id_key`
- **Table**: `user_tags`
- **Type**: `UNIQUE`
- **Columns**: `user_id, song_id`
- **Purpose**: One tag per user per song

#### `weekly_scores_unique`
- **Table**: `weekly_scores`
- **Type**: `UNIQUE`
- **Columns**: `song_id, week_number`
- **Purpose**: One score per song per week

#### `weekly_stats_week_unique`
- **Table**: `weekly_stats`
- **Type**: `UNIQUE`
- **Columns**: `judge_id, week_start`
- **Purpose**: One stats record per judge per week

### 4. Check Constraints

#### `golden_ears_accuracy_score_check`
- **Table**: `golden_ears`
- **Column**: `accuracy_score`
- **Purpose**: Validates accuracy score range

#### `golden_ears_battles_judged_check`
- **Table**: `golden_ears`
- **Column**: `battles_judged`
- **Purpose**: Validates battles judged count

#### `songs_privacy_level_check`
- **Table**: `songs`
- **Column**: `privacy_level`
- **Purpose**: Validates privacy level values

#### Not Null Constraints
- **Multiple Tables**: Various columns across all tables
- **Purpose**: Ensures required fields are not null
- **Examples**: `id`, `created_at`, `user_id`, etc.

## Constraint Management

### 1. Constraint Creation
- **Primary Keys**: Created with table creation
- **Foreign Keys**: Added after table creation
- **Unique Constraints**: Added for business rules
- **Check Constraints**: Added for data validation

### 2. Constraint Validation
- **Data Integrity**: Ensures data consistency
- **Business Rules**: Enforces business logic
- **Referential Integrity**: Maintains relationships
- **Data Quality**: Prevents invalid data

### 3. Constraint Performance
- **Index Usage**: Constraints often create indexes
- **Query Optimization**: Constraints help query planning
- **Data Validation**: Constraints prevent invalid data
- **Storage Efficiency**: Constraints optimize storage

## Cascade Delete Behavior

### 1. CASCADE Deletes
- **User Deletion**: Deletes all user-related data
- **Song Deletion**: Deletes all song-related data
- **Battle Deletion**: Deletes all battle-related data
- **Profile Deletion**: Deletes all profile-related data

### 2. NO ACTION Deletes
- **Soft Delete References**: Prevents deletion of referenced records
- **Status Change References**: Prevents deletion of status changers
- **Audit References**: Preserves audit trail integrity

### 3. Referential Integrity
- **Data Consistency**: Ensures all references are valid
- **Orphan Prevention**: Prevents orphaned records
- **Relationship Maintenance**: Maintains data relationships

## Constraint Monitoring

### 1. Constraint Violations
- **Error Handling**: Proper error messages for violations
- **Data Validation**: Client-side validation before database
- **User Feedback**: Clear error messages to users
- **Logging**: Log constraint violations for debugging

### 2. Performance Impact
- **Index Usage**: Monitor constraint index usage
- **Query Performance**: Track constraint impact on queries
- **Storage Overhead**: Monitor constraint storage usage
- **Maintenance**: Regular constraint maintenance

### 3. Data Quality
- **Validation Rules**: Ensure constraints match business rules
- **Data Cleanup**: Regular cleanup of invalid data
- **Constraint Updates**: Update constraints as business rules change
- **Testing**: Regular testing of constraint behavior

## Security Considerations

### 1. Data Protection
- **Referential Integrity**: Prevents data corruption
- **Access Control**: Constraints work with RLS policies
- **Data Validation**: Prevents malicious data insertion
- **Audit Trail**: Constraints support audit logging

### 2. Performance Security
- **Query Optimization**: Constraints help query planning
- **Index Security**: Constraint indexes are secure
- **Data Access**: Constraints don't bypass RLS
- **Resource Protection**: Constraints prevent resource abuse

This comprehensive constraint system ensures data integrity, enforces business rules, and maintains referential integrity throughout the SongWars database while providing optimal performance and security.
