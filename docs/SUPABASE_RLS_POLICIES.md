# SongWars Row Level Security (RLS) Policies

## Overview
This document provides comprehensive documentation of all Row Level Security (RLS) policies implemented in the SongWars database. RLS policies control data access at the row level, ensuring users can only access data they're authorized to see.

**Total RLS Policies: 44** (Updated January 2025)

## Policy Categories

### 1. Admin Users Policies

#### `admin_users_self_select`
- **Table**: `admin_users`
- **Operation**: SELECT
- **Roles**: `authenticated`
- **Condition**: `(id = auth.uid())`
- **Purpose**: Admins can only view their own admin record

### 2. Audit Log Policies

#### `Admins can read audit logs`
- **Table**: `audit_log`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()))`
- **Purpose**: Only admins can read audit logs

#### `System can insert audit logs`
- **Table**: `audit_log`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `true`
- **Purpose**: System functions can insert audit logs

### 3. Battle Policies

#### `Allow all users to read battles`
- **Table**: `battles`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `true`
- **Purpose**: All users can view battle data

#### `Authenticated users can insert battles`
- **Table**: `battles`
- **Operation**: INSERT
- **Roles**: `authenticated`
- **Condition**: `(auth.role() = 'authenticated'::text)`
- **Purpose**: Authenticated users can create battles

### 4. Churn Events Policies

#### `Allow authenticated read access to churn_events`
- **Table**: `churn_events`
- **Operation**: SELECT
- **Roles**: `authenticated`
- **Condition**: `true`
- **Purpose**: Authenticated users can view churn events

#### `Allow system to manage churn_events`
- **Table**: `churn_events`
- **Operation**: ALL
- **Roles**: `authenticated`
- **Condition**: `true`
- **Purpose**: System can manage all churn events

### 5. Golden Ears Policies

#### `Users can view own Golden Ears`
- **Table**: `golden_ears`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() = judge_id)`
- **Purpose**: Users can only view their own Golden Ears awards

#### `System can insert Golden Ears`
- **Table**: `golden_ears`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can create Golden Ears awards

#### `System can update Golden Ears`
- **Table**: `golden_ears`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can update Golden Ears awards

#### `System can delete Golden Ears`
- **Table**: `golden_ears`
- **Operation**: DELETE
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can delete Golden Ears awards

### 6. Golden Ears Processing Policies

#### `Admins can view processing status`
- **Table**: `golden_ears_processing`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() IN (SELECT admin_users.id FROM admin_users))`
- **Purpose**: Only admins can view processing status

#### `System can insert processing`
- **Table**: `golden_ears_processing`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can create processing records

#### `System can update processing`
- **Table**: `golden_ears_processing`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can update processing records

#### `System can delete processing`
- **Table**: `golden_ears_processing`
- **Operation**: DELETE
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can delete processing records

### 7. Notification Policies

#### `Users can view own notifications`
- **Table**: `notifications`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can only view their own notifications

#### `Users can update own notifications`
- **Table**: `notifications`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can update their own notifications

#### `System can create notifications`
- **Table**: `notifications`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can create notifications

### 8. Profile Policies

#### `Allow public read access to profiles`
- **Table**: `profiles`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(is_public = true)`
- **Purpose**: Public can view public profiles

#### `Allow authenticated users to select their own profile`
- **Table**: `profiles`
- **Operation**: SELECT
- **Roles**: `authenticated`
- **Condition**: `(auth.uid() = id)`
- **Purpose**: Users can view their own profile

#### `Users can view their own profile`
- **Table**: `profiles`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() = id)`
- **Purpose**: Users can view their own profile

#### `Users can insert their own profile`
- **Table**: `profiles`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.uid() = id)`
- **Purpose**: Users can create their own profile

#### `Users can update their own profile`
- **Table**: `profiles`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `(auth.uid() = id)`
- **Purpose**: Users can update their own profile

### 9. Song Flag Policies

#### `song_flags_select_own`
- **Table**: `song_flags`
- **Operation**: SELECT
- **Roles**: `authenticated`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can view their own flags

#### `song_flags_insert_own`
- **Table**: `song_flags`
- **Operation**: INSERT
- **Roles**: `authenticated`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can create their own flags

### 10. Song Policies

#### `Allow authenticated read access to active songs`
- **Table**: `songs`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `((deleted_at IS NULL) AND ((is_public = true) OR (auth.uid() = user_id)))`
- **Purpose**: Users can view active public songs or their own songs

#### `Users can view their own songs including trashed`
- **Table**: `songs`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can view all their own songs, including trashed ones

#### `Users can insert their own songs`
- **Table**: `songs`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can create their own songs

#### `Allow authenticated users to insert own song`
- **Table**: `songs`
- **Operation**: INSERT
- **Roles**: `authenticated`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Authenticated users can create their own songs

#### `Users can update their own songs`
- **Table**: `songs`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `((auth.uid() = user_id) AND (deleted_at IS NULL))`
- **Purpose**: Users can update their own non-deleted songs

#### `Users can soft delete their own songs`
- **Table**: `songs`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `((auth.uid() = user_id) AND (deleted_at IS NULL))`
- **Purpose**: Users can soft delete their own non-deleted songs

#### `Allow authenticated users to update song scores`
- **Table**: `songs`
- **Operation**: UPDATE
- **Roles**: `authenticated`
- **Condition**: `true`
- **Purpose**: Authenticated users can update song scores (for voting)

### 11. User Tag Policies

#### `Users can view their own tags`
- **Table**: `user_tags`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can view their own song tags

#### `Users can insert their own tags`
- **Table**: `user_tags`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can create their own song tags

#### `Users can delete their own tags`
- **Table**: `user_tags`
- **Operation**: DELETE
- **Roles**: `public`
- **Condition**: `(auth.uid() = user_id)`
- **Purpose**: Users can delete their own song tags

### 12. Vote Policies

#### `Users can read their own votes`
- **Table**: `votes`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(user_id = auth.uid())`
- **Purpose**: Users can view their own votes

#### `Users can insert their own votes`
- **Table**: `votes`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(user_id = auth.uid())`
- **Purpose**: Users can create their own votes

### 13. Weekly Scores Policies

#### `Allow authenticated read access to weekly_scores`
- **Table**: `weekly_scores`
- **Operation**: SELECT
- **Roles**: `authenticated`
- **Condition**: `true`
- **Purpose**: Authenticated users can view weekly scores

#### `Allow system to manage weekly_scores`
- **Table**: `weekly_scores`
- **Operation**: ALL
- **Roles**: `authenticated`
- **Condition**: `true`
- **Purpose**: System can manage all weekly scores

### 14. Weekly Stats Policies

#### `Users can view own weekly stats`
- **Table**: `weekly_stats`
- **Operation**: SELECT
- **Roles**: `public`
- **Condition**: `(auth.uid() = judge_id)`
- **Purpose**: Users can view their own weekly stats

#### `System can insert weekly stats`
- **Table**: `weekly_stats`
- **Operation**: INSERT
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can create weekly stats

#### `System can update weekly stats`
- **Table**: `weekly_stats`
- **Operation**: UPDATE
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can update weekly stats

#### `System can delete weekly stats`
- **Table**: `weekly_stats`
- **Operation**: DELETE
- **Roles**: `public`
- **Condition**: `(auth.role() = 'service_role'::text)`
- **Purpose**: System can delete weekly stats

## Security Principles

### 1. User Data Isolation
- Users can only access their own data (songs, votes, tags, etc.)
- Public data (battles, public profiles) is accessible to all
- Admin data requires admin privileges

### 2. System Operations
- System operations use `service_role` authentication
- Automated processes can manage data without user context
- Audit logging is system-wide accessible

### 3. Data Visibility
- Soft-deleted songs are only visible to owners
- Public profiles are visible to all
- Private profiles are only visible to owners
- Admin data requires admin privileges

### 4. Role-Based Access
- **Public**: Unauthenticated users (limited access)
- **Authenticated**: Logged-in users (full user access)
- **Admin**: Administrative users (system-wide access)
- **Service Role**: System operations (unrestricted access)

## Policy Maintenance

### Adding New Policies
1. Identify the table and operation
2. Determine appropriate roles and conditions
3. Test with different user types
4. Document the policy purpose

### Modifying Existing Policies
1. Review impact on existing functionality
2. Test thoroughly with different scenarios
3. Update documentation
4. Monitor for security issues

### Policy Testing
- Test with different user roles
- Verify data isolation
- Check system operations
- Validate admin access

This RLS policy structure ensures that SongWars maintains strict data security while allowing appropriate access for different user types and system operations.
