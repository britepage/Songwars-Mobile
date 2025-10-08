# SongWars Extensions and Indexes

## Overview
This document provides comprehensive documentation of PostgreSQL extensions and database indexes used in the SongWars system for enhanced functionality and performance optimization.

**Total PostgreSQL Extensions: 8** (Updated January 2025)

## PostgreSQL Extensions

### 1. Core Extensions

#### `plpgsql` (Version 1.0)
- **Schema**: `pg_catalog`
- **Relocatable**: `false`
- **Purpose**: Procedural Language for PostgreSQL
- **Usage**: Used for all stored procedures and functions
- **Status**: Core extension, always available

#### `pgcrypto` (Version 1.3)
- **Schema**: `extensions`
- **Relocatable**: `true`
- **Purpose**: Cryptographic functions
- **Usage**: Password hashing, encryption, UUID generation
- **Key Functions**: `gen_random_uuid()`, `crypt()`, `digest()`

#### `uuid-ossp` (Version 1.1)
- **Schema**: `extensions`
- **Relocatable**: `true`
- **Purpose**: UUID generation functions
- **Usage**: Alternative UUID generation methods
- **Key Functions**: `uuid_generate_v4()`, `uuid_generate_v1()`

### 2. Supabase-Specific Extensions

#### `supabase_vault` (Version 0.3.1)
- **Schema**: `vault`
- **Relocatable**: `false`
- **Purpose**: Supabase Vault for secrets management
- **Usage**: Secure storage of sensitive configuration
- **Features**: Encryption, key management, secret rotation

#### `pg_graphql` (Version 1.5.11)
- **Schema**: `graphql`
- **Relocatable**: `false`
- **Purpose**: GraphQL API generation
- **Usage**: Automatic GraphQL API from database schema
- **Features**: Auto-generated queries, mutations, subscriptions

#### `pg_net` (Version 0.14.0)
- **Schema**: `extensions`
- **Relocatable**: `false`
- **Purpose**: Network operations
- **Usage**: HTTP requests, webhooks, external API calls
- **Features**: Async HTTP requests, webhook handling

### 3. Performance Extensions

#### `pg_stat_statements` (Version 1.10)
- **Schema**: `extensions`
- **Relocatable**: `true`
- **Purpose**: Query performance statistics
- **Usage**: Monitoring query performance and optimization
- **Features**: Query timing, execution counts, resource usage

#### `pg_cron` (Version 1.6)
- **Schema**: `pg_catalog`
- **Relocatable**: `false`
- **Purpose**: Job scheduling
- **Usage**: Automated tasks, cleanup operations
- **Features**: Cron-like scheduling, job management

## Database Indexes

### 1. Primary Key Indexes

#### `admin_users_pkey`
- **Table**: `admin_users`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX admin_users_pkey ON public.admin_users USING btree (id)`

#### `audit_log_pkey`
- **Table**: `audit_log`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX audit_log_pkey ON public.audit_log USING btree (id)`

#### `battles_pkey`
- **Table**: `battles`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX battles_pkey ON public.battles USING btree (id)`

#### `churn_events_pkey`
- **Table**: `churn_events`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX churn_events_pkey ON public.churn_events USING btree (id)`

#### `golden_ears_pkey`
- **Table**: `golden_ears`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX golden_ears_pkey ON public.golden_ears USING btree (id)`

#### `golden_ears_processing_pkey`
- **Table**: `golden_ears_processing`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX golden_ears_processing_pkey ON public.golden_ears_processing USING btree (id)`

#### `notifications_pkey`
- **Table**: `notifications`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id)`

#### `profiles_pkey`
- **Table**: `profiles`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)`

#### `song_flags_pkey`
- **Table**: `song_flags`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX song_flags_pkey ON public.song_flags USING btree (id)`

#### `songs_pkey`
- **Table**: `songs`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX songs_pkey ON public.songs USING btree (id)`

#### `user_tags_pkey`
- **Table**: `user_tags`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX user_tags_pkey ON public.user_tags USING btree (id)`

#### `votes_pkey`
- **Table**: `votes`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX votes_pkey ON public.votes USING btree (id)`

#### `weekly_scores_pkey`
- **Table**: `weekly_scores`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX weekly_scores_pkey ON public.weekly_scores USING btree (id)`

#### `weekly_stats_pkey`
- **Table**: `weekly_stats`
- **Type**: `UNIQUE`
- **Columns**: `id`
- **Definition**: `CREATE UNIQUE INDEX weekly_stats_pkey ON public.weekly_stats USING btree (id)`

### 2. Unique Constraint Indexes

#### `profiles_username_key`
- **Table**: `profiles`
- **Type**: `UNIQUE`
- **Columns**: `username`
- **Definition**: `CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username)`

#### `golden_ears_week_unique`
- **Table**: `golden_ears`
- **Type**: `UNIQUE`
- **Columns**: `judge_id, week_start`
- **Definition**: `CREATE UNIQUE INDEX golden_ears_week_unique ON public.golden_ears USING btree (judge_id, week_start)`

#### `golden_ears_processing_week_unique`
- **Table**: `golden_ears_processing`
- **Type**: `UNIQUE`
- **Columns**: `week_start`
- **Definition**: `CREATE UNIQUE INDEX golden_ears_processing_week_unique ON public.golden_ears_processing USING btree (week_start)`

#### `song_flags_unique_per_user`
- **Table**: `song_flags`
- **Type**: `UNIQUE`
- **Columns**: `song_id, user_id, category`
- **Definition**: `CREATE UNIQUE INDEX song_flags_unique_per_user ON public.song_flags USING btree (song_id, user_id, category)`

#### `user_tags_user_id_song_id_key`
- **Table**: `user_tags`
- **Type**: `UNIQUE`
- **Columns**: `user_id, song_id`
- **Definition**: `CREATE UNIQUE INDEX user_tags_user_id_song_id_key ON public.user_tags USING btree (user_id, song_id)`

#### `weekly_scores_unique`
- **Table**: `weekly_scores`
- **Type**: `UNIQUE`
- **Columns**: `song_id, week_number`
- **Definition**: `CREATE UNIQUE INDEX weekly_scores_unique ON public.weekly_scores USING btree (song_id, week_number)`

#### `weekly_stats_week_unique`
- **Table**: `weekly_stats`
- **Type**: `UNIQUE`
- **Columns**: `judge_id, week_start`
- **Definition**: `CREATE UNIQUE INDEX weekly_stats_week_unique ON public.weekly_stats USING btree (judge_id, week_start)`

### 3. Performance Indexes

#### Audit Log Indexes
- **`idx_audit_log_action`**: `CREATE INDEX idx_audit_log_action ON public.audit_log USING btree (action)`
- **`idx_audit_log_created_at`**: `CREATE INDEX idx_audit_log_created_at ON public.audit_log USING btree (created_at)`
- **`idx_audit_log_user_id`**: `CREATE INDEX idx_audit_log_user_id ON public.audit_log USING btree (user_id)`

#### Battle Indexes
- **`idx_battles_created`**: `CREATE INDEX idx_battles_created ON public.battles USING btree (created_at)`
- **`idx_battles_song_a_id`**: `CREATE INDEX idx_battles_song_a_id ON public.battles USING btree (song_a_id)`
- **`idx_battles_song_b_id`**: `CREATE INDEX idx_battles_song_b_id ON public.battles USING btree (song_b_id)`

#### Golden Ears Indexes
- **`idx_golden_ears_awarded`**: `CREATE INDEX idx_golden_ears_awarded ON public.golden_ears USING btree (awarded) WHERE (awarded = true)`
- **`idx_golden_ears_judge`**: `CREATE INDEX idx_golden_ears_judge ON public.golden_ears USING btree (judge_id)`
- **`idx_golden_ears_week`**: `CREATE INDEX idx_golden_ears_week ON public.golden_ears USING btree (week_start)`

#### Golden Ears Processing Indexes
- **`idx_golden_ears_processing_status`**: `CREATE INDEX idx_golden_ears_processing_status ON public.golden_ears_processing USING btree (status)`
- **`idx_golden_ears_processing_week`**: `CREATE INDEX idx_golden_ears_processing_week ON public.golden_ears_processing USING btree (week_start)`

#### Notification Indexes
- **`idx_notifications_read`**: `CREATE INDEX idx_notifications_read ON public.notifications USING btree (read) WHERE (read = false)`
- **`idx_notifications_type`**: `CREATE INDEX idx_notifications_type ON public.notifications USING btree (type)`
- **`idx_notifications_user`**: `CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id)`

#### Profile Indexes
- **`profiles_role_idx`**: `CREATE INDEX profiles_role_idx ON public.profiles USING btree (role)`
- **`profiles_username_idx`**: `CREATE INDEX profiles_username_idx ON public.profiles USING btree (username)`

#### Song Flag Indexes
- **`song_flags_song_category_idx`**: `CREATE INDEX song_flags_song_category_idx ON public.song_flags USING btree (song_id, category)`

#### Song Indexes
- **`idx_songs_active`**: `CREATE INDEX idx_songs_active ON public.songs USING btree (is_active)`
- **`idx_songs_active_not_deleted`**: `CREATE INDEX idx_songs_active_not_deleted ON public.songs USING btree (is_active, deleted_at) WHERE (deleted_at IS NULL)`
- **`idx_songs_churn_start`**: `CREATE INDEX idx_songs_churn_start ON public.songs USING btree (churn_start_date)`
- **`idx_songs_churn_week`**: `CREATE INDEX idx_songs_churn_week ON public.songs USING btree (((\"churnState\" ->> 'week'::text)))`
- **`idx_songs_clip_start_time`**: `CREATE INDEX idx_songs_clip_start_time ON public.songs USING btree (clip_start_time)`
- **`idx_songs_deleted_at`**: `CREATE INDEX idx_songs_deleted_at ON public.songs USING btree (deleted_at)`
- **`idx_songs_deleted_by`**: `CREATE INDEX idx_songs_deleted_by ON public.songs USING btree (deleted_by)`
- **`idx_songs_genre`**: `CREATE INDEX idx_songs_genre ON public.songs USING btree (genre)`
- **`idx_songs_privacy`**: `CREATE INDEX idx_songs_privacy ON public.songs USING btree (is_public, privacy_level)`
- **`idx_songs_trash_expires`**: `CREATE INDEX idx_songs_trash_expires ON public.songs USING btree (trash_expires_at)`

#### User Tag Indexes
- **`idx_user_tags_song_id`**: `CREATE INDEX idx_user_tags_song_id ON public.user_tags USING btree (song_id)`
- **`idx_user_tags_user_id`**: `CREATE INDEX idx_user_tags_user_id ON public.user_tags USING btree (user_id)`

#### Vote Indexes
- **`idx_votes_battle`**: `CREATE INDEX idx_votes_battle ON public.votes USING btree (battle_id)`
- **`idx_votes_battle_id`**: `CREATE INDEX idx_votes_battle_id ON public.votes USING btree (battle_id)`
- **`idx_votes_song_id_voted_for`**: `CREATE INDEX idx_votes_song_id_voted_for ON public.votes USING btree (song_id_voted_for)`
- **`idx_votes_user_id`**: `CREATE INDEX idx_votes_user_id ON public.votes USING btree (user_id)`
- **`idx_votes_user_week`**: `CREATE INDEX idx_votes_user_week ON public.votes USING btree (user_id, created_at)`

#### Weekly Score Indexes
- **`idx_weekly_scores_song_week`**: `CREATE INDEX idx_weekly_scores_song_week ON public.weekly_scores USING btree (song_id, week_number)`
- **`idx_weekly_scores_week`**: `CREATE INDEX idx_weekly_scores_week ON public.weekly_scores USING btree (week_number)`

#### Weekly Stats Indexes
- **`idx_weekly_stats_judge`**: `CREATE INDEX idx_weekly_stats_judge ON public.weekly_stats USING btree (judge_id)`
- **`idx_weekly_stats_qualified`**: `CREATE INDEX idx_weekly_stats_qualified ON public.weekly_stats USING btree (qualified) WHERE (qualified = true)`
- **`idx_weekly_stats_week`**: `CREATE INDEX idx_weekly_stats_week ON public.weekly_stats USING btree (week_start)`

## Index Performance Characteristics

### 1. B-Tree Indexes
- **Type**: Most common index type
- **Use Case**: Equality and range queries
- **Performance**: Excellent for most query patterns
- **Maintenance**: Low overhead

### 2. Partial Indexes
- **Examples**: `idx_golden_ears_awarded`, `idx_notifications_read`, `idx_weekly_stats_qualified`
- **Use Case**: Filtered queries on specific conditions
- **Performance**: Very efficient for filtered queries
- **Storage**: Reduced storage requirements

### 3. Composite Indexes
- **Examples**: `idx_songs_active_not_deleted`, `idx_weekly_scores_song_week`
- **Use Case**: Multi-column queries
- **Performance**: Excellent for complex WHERE clauses
- **Order**: Column order matters for query optimization

### 4. JSONB Indexes
- **Example**: `idx_songs_churn_week`
- **Use Case**: JSONB field queries
- **Performance**: Efficient for JSONB operations
- **Syntax**: Uses `->>` operator for text extraction

## Index Maintenance

### 1. Regular Monitoring
- **Usage Statistics**: Monitor index usage with `pg_stat_user_indexes`
- **Size Monitoring**: Track index size growth
- **Performance Impact**: Monitor query performance

### 2. Index Optimization
- **Unused Indexes**: Identify and remove unused indexes
- **Duplicate Indexes**: Remove redundant indexes
- **Index Bloat**: Rebuild bloated indexes

### 3. Query Optimization
- **EXPLAIN ANALYZE**: Use to verify index usage
- **Index Hints**: Ensure queries use appropriate indexes
- **Query Rewriting**: Optimize queries for better index usage

## Extension Management

### 1. Extension Updates
- **Version Control**: Track extension versions
- **Update Process**: Test updates in development first
- **Rollback Plan**: Have rollback strategy ready

### 2. Extension Monitoring
- **Performance Impact**: Monitor extension performance
- **Resource Usage**: Track extension resource consumption
- **Error Monitoring**: Monitor for extension errors

### 3. Security Considerations
- **Access Control**: Limit extension access appropriately
- **Data Protection**: Ensure extensions don't expose sensitive data
- **Audit Logging**: Log extension usage for security

This comprehensive index and extension configuration provides SongWars with optimal performance and enhanced functionality while maintaining security and data integrity.
