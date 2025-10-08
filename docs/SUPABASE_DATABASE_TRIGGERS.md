# SongWars Database Triggers

## Overview
This document provides comprehensive documentation of all database triggers implemented in the SongWars system. Triggers are database functions that automatically execute in response to specific database events.

**Total Database Triggers: 3** (Updated January 2025)

## Trigger Functions

### 1. Golden Ears Notification Trigger

#### `golden_ears_notification_trigger`
- **Table**: `golden_ears`
- **Event**: `UPDATE`
- **Timing**: `AFTER`
- **Function**: `notify_golden_ears_award()`
- **Orientation**: `ROW`

#### Purpose
Automatically sends notifications to users when they receive Golden Ears awards.

#### Trigger Logic
```sql
CREATE TRIGGER golden_ears_notification_trigger
    AFTER UPDATE ON golden_ears
    FOR EACH ROW
    EXECUTE FUNCTION notify_golden_ears_award();
```

#### Function Details
- **Function Name**: `notify_golden_ears_award()`
- **Language**: `PLPGSQL`
- **Security**: `INVOKER`
- **Deterministic**: `NO`

#### Behavior
1. **Trigger Condition**: Fires when `awarded` column changes from `false` to `true`
2. **Notification Creation**: Creates a notification record in the `notifications` table
3. **User Targeting**: Sends notification to the user who received the award
4. **Message Content**: Congratulatory message about earning Golden Ears

#### Notification Details
- **Type**: `golden_ears_award`
- **Title**: `🏆 Golden Ears Awarded!`
- **Message**: `Congratulations! You earned Golden Ears for your excellent musical judgment this week.`
- **Recipient**: User who received the award (`judge_id`)

### 2. Clip Start Time Trigger

#### `trigger_set_clip_start_time`
- **Table**: `songs`
- **Event**: `INSERT`
- **Timing**: `BEFORE`
- **Function**: `set_clip_start_time_on_insert()`
- **Orientation**: `ROW`

#### Purpose
Automatically moves `clip_start_time` column value to the `churnState` JSONB field during song insertion.

#### Trigger Logic
```sql
CREATE TRIGGER trigger_set_clip_start_time
    BEFORE INSERT ON songs
    FOR EACH ROW
    EXECUTE FUNCTION set_clip_start_time_on_insert();
```

#### Function Details
- **Function Name**: `set_clip_start_time_on_insert()`
- **Language**: `PLPGSQL`
- **Security**: `INVOKER`
- **Deterministic**: `NO`

#### Behavior
1. **Trigger Condition**: Fires before inserting a new song record
2. **Data Migration**: Moves `clip_start_time` column value to `churnState` JSONB
3. **JSONB Update**: Sets `churnState.clipStartTime` with the column value
4. **Null Handling**: Only processes non-null and positive values

#### Data Transformation
```sql
-- Before trigger
{
  "clip_start_time": 15.5,
  "churnState": null
}

-- After trigger
{
  "clip_start_time": 15.5,
  "churnState": {
    "clipStartTime": 15.5
  }
}
```

## Trigger Implementation Details

### 1. Golden Ears Notification Trigger

#### Function Implementation
```sql
CREATE OR REPLACE FUNCTION notify_golden_ears_award()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.awarded = true AND OLD.awarded = false THEN
        INSERT INTO public.notifications (user_id, type, title, message)
        VALUES (
            NEW.judge_id,
            'golden_ears_award',
            '🏆 Golden Ears Awarded!',
            'Congratulations! You earned Golden Ears for your excellent musical judgment this week.'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

#### Key Features
- **Conditional Execution**: Only fires when `awarded` changes from false to true
- **Notification Creation**: Automatically creates user notification
- **Error Handling**: Graceful handling of edge cases
- **Performance**: Minimal overhead, only executes when needed

### 2. Clip Start Time Trigger

#### Function Implementation
```sql
CREATE OR REPLACE FUNCTION set_clip_start_time_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    SET search_path = public;
    
    -- If clip_start_time column has a value, move it to churnState
    IF NEW.clip_start_time IS NOT NULL AND NEW.clip_start_time > 0 THEN
        NEW."churnState" = jsonb_set(
            COALESCE(NEW."churnState", '{}'::jsonb),
            '{clipStartTime}',
            to_jsonb(NEW.clip_start_time)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
```

#### Key Features
- **Data Migration**: Moves column data to JSONB structure
- **Null Safety**: Handles null values gracefully
- **JSONB Manipulation**: Uses `jsonb_set` for safe updates
- **Performance**: Minimal overhead, only processes when needed

## Trigger Management

### Creating Triggers
1. **Function Definition**: Create the trigger function first
2. **Trigger Creation**: Create the trigger with proper timing
3. **Testing**: Test with various scenarios
4. **Documentation**: Document trigger behavior

### Modifying Triggers
1. **Function Updates**: Modify the trigger function
2. **Trigger Recreation**: Drop and recreate if needed
3. **Testing**: Thoroughly test changes
4. **Rollback Plan**: Have rollback strategy ready

### Dropping Triggers
1. **Impact Assessment**: Check what depends on the trigger
2. **Data Backup**: Backup any data that might be affected
3. **Trigger Removal**: Drop the trigger
4. **Function Cleanup**: Remove unused functions

## Performance Considerations

### Trigger Overhead
- **Minimal Impact**: Triggers are designed for minimal overhead
- **Conditional Execution**: Only execute when necessary
- **Efficient Logic**: Optimized for performance

### Monitoring
- **Execution Count**: Monitor how often triggers fire
- **Performance Impact**: Track execution time
- **Error Rates**: Monitor for trigger failures

### Optimization
- **Index Usage**: Ensure triggers use appropriate indexes
- **Query Efficiency**: Optimize trigger function queries
- **Batch Operations**: Consider batch processing when possible

## Error Handling

### Trigger Failures
- **Error Logging**: Log trigger execution errors
- **Graceful Degradation**: Handle errors without breaking operations
- **Recovery**: Implement recovery mechanisms

### Data Consistency
- **Transaction Safety**: Triggers run within transactions
- **Rollback Support**: Failed triggers can rollback transactions
- **Data Validation**: Validate data before trigger execution

## Security Considerations

### Access Control
- **Function Security**: Trigger functions have appropriate security levels
- **Data Access**: Triggers only access necessary data
- **Permission Checks**: Validate permissions in trigger functions

### Data Protection
- **Input Validation**: Validate trigger inputs
- **Output Sanitization**: Sanitize trigger outputs
- **Audit Logging**: Log trigger executions for security

## Testing Triggers

### Unit Testing
- **Function Testing**: Test trigger functions independently
- **Edge Cases**: Test with various data scenarios
- **Error Conditions**: Test error handling

### Integration Testing
- **End-to-End**: Test complete workflows
- **Data Consistency**: Verify data integrity
- **Performance**: Test under load

### Monitoring
- **Execution Tracking**: Monitor trigger execution
- **Performance Metrics**: Track trigger performance
- **Error Monitoring**: Monitor for trigger errors

## Maintenance

### Regular Checks
- **Trigger Status**: Verify triggers are active
- **Function Health**: Check trigger function health
- **Performance**: Monitor trigger performance

### Updates
- **Function Updates**: Update trigger functions as needed
- **Trigger Modifications**: Modify triggers when requirements change
- **Documentation**: Keep documentation current

### Troubleshooting
- **Error Investigation**: Investigate trigger errors
- **Performance Issues**: Address performance problems
- **Data Issues**: Resolve data consistency issues

This trigger system provides automated functionality for SongWars, ensuring that important events like Golden Ears awards are properly communicated to users and that data is consistently structured across the system.
