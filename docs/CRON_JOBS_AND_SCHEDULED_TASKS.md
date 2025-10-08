# Cron Jobs and Scheduled Tasks Documentation

## Overview
The SongWars system uses PostgreSQL's `pg_cron` extension to automate critical system processes. All cron jobs are configured to run automatically without manual intervention.

## Active Cron Jobs

**Total Active Cron Jobs: 3** (Updated January 2025)

### 1. Weekly Churn Processing
- **Job ID**: 1
- **Schedule**: `0 0 * * 1` (Every Monday at midnight UTC)
- **Function**: `weekly-churn` Edge Function
- **Purpose**: Processes weekly churn advancement for all active songs
- **Method**: HTTP POST to Edge Function endpoint

**Process Flow**:
1. **Monday Detection** - Only runs on Mondays (day 1)
2. **Churn Processing** - Calls `process_weekly_churn()` database function
3. **Song Advancement** - Moves songs from week 0 to week 4
4. **Score Calculation** - Calculates and stores weekly scores
5. **Elimination** - Marks songs as inactive at week 4
6. **Audit Logging** - Logs all churn activities
7. **Top Songs** - Retrieves top songs by genre for weekly reveals

**Configuration**:
```sql
SELECT cron.schedule(
  'Churn Cron',
  '0 0 * * 1',
  'select net.http_post(
    url:=''https://rgmrnjcjvfucofacnsnw.supabase.co/functions/v1/weekly-churn'',
    headers:=jsonb_build_object(''Authorization'', ''Bearer [SERVICE_ROLE_KEY]'', ''Content-Type'', ''application/json''), 
    timeout_milliseconds:=5000
  );'
);
```

### 2. Golden Ears Processing
- **Job ID**: 8
- **Schedule**: `0 1 * * 1` (Every Monday at 1 AM UTC)
- **Function**: `golden-ears-processor` Edge Function
- **Purpose**: Awards Golden Ears to top 25% of qualified judges
- **Method**: HTTP POST to Edge Function endpoint

**Process Flow**:
1. **Week Calculation** - Determines target week (2 weeks ago due to 1-week lag)
2. **User Processing** - Processes all users who voted in the target week
3. **Accuracy Calculation** - Calculates judge accuracy using most recent song scores
4. **Qualification Check** - Identifies users with 20+ battles judged
5. **Award Distribution** - Awards Golden Ears to top 25% of qualified users
6. **Notification** - Sends notifications to award recipients

**Configuration**:
```sql
SELECT cron.schedule(
  'golden-ears-weekly-processor',
  '0 1 * * 1',
  'SELECT http_golden_ears_processor();'
);
```

### 3. Trash Purge Processing
- **Job ID**: 7
- **Schedule**: `0 2 * * *` (Every day at 2 AM UTC)
- **Function**: `purge_expired_trash()` Database Function
- **Purpose**: Permanently deletes songs that have expired from trash (10+ days)
- **Method**: Direct database function call

**Process Flow**:
1. **Expired Detection** - Finds songs with `trash_expires_at` < now()
2. **Database Cleanup** - Permanently deletes database records
3. **Storage Cleanup** - Removes associated audio files from storage
4. **Audit Logging** - Logs all deletions
5. **Count Return** - Returns count of deleted songs

**Configuration**:
```sql
SELECT cron.schedule(
  'purge-expired-trash',
  '0 2 * * *',
  'SELECT public.purge_expired_trash();'
);
```

## Cron Job Management

### Viewing Active Jobs
```sql
SELECT * FROM cron.job ORDER BY jobid;
```

### Job Status Monitoring
```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  last_run,
  next_run
FROM cron.job 
WHERE active = true
ORDER BY jobid;
```

### Manual Execution
```sql
-- Execute weekly churn manually
SELECT cron.run_job(1);

-- Execute Golden Ears processing manually
SELECT cron.run_job(8);

-- Execute trash purge manually
SELECT cron.run_job(7);
```

### Job Control
```sql
-- Pause a job
SELECT cron.unschedule('job-name');

-- Resume a job
SELECT cron.schedule('job-name', 'schedule', 'command');

-- Delete a job
SELECT cron.unschedule('job-name');
```

## Error Handling and Monitoring

### Log Monitoring
- **Supabase Dashboard** - View Edge Function execution logs
- **Database Logs** - Monitor database function execution
- **Error Tracking** - All errors are logged and can be monitored

### Failure Recovery
- **Automatic Retry** - Edge Functions have built-in retry logic
- **Manual Execution** - Jobs can be run manually if needed
- **Error Notifications** - Critical failures can trigger alerts

### Performance Monitoring
- **Execution Time** - Monitor job execution duration
- **Resource Usage** - Track CPU and memory usage
- **Success Rates** - Monitor job success/failure rates

## Security Considerations

### Access Control
- **Service Role** - Cron jobs use service role for database access
- **Edge Function Authentication** - HTTP calls use service role keys
- **Function Security** - All functions use `SECURITY DEFINER`

### Data Protection
- **Audit Logging** - All cron job activities are logged
- **Error Handling** - Sensitive data is not exposed in error messages
- **Access Logging** - All database access is logged

## Troubleshooting

### Common Issues

#### Cron Job Not Running
1. **Check pg_cron extension** - Ensure extension is installed
2. **Verify job schedule** - Check cron schedule syntax
3. **Check job status** - Verify job is active
4. **Review logs** - Check for error messages

#### Edge Function Failures
1. **Check function logs** - Review Supabase Dashboard logs
2. **Verify authentication** - Ensure service role key is correct
3. **Check network connectivity** - Verify HTTP calls are successful
4. **Review function code** - Check for runtime errors

#### Database Function Errors
1. **Check function logs** - Review database logs
2. **Verify permissions** - Ensure service role has necessary permissions
3. **Check data integrity** - Verify input data is valid
4. **Review function logic** - Check for logical errors

### Manual Recovery Procedures

#### Weekly Churn Recovery
```sql
-- Check churn processing status
SELECT * FROM churn_events ORDER BY event_date DESC LIMIT 5;

-- Manual churn processing
SELECT process_weekly_churn();
```

#### Golden Ears Recovery
```sql
-- Check Golden Ears processing status
SELECT * FROM golden_ears_processing ORDER BY week_start DESC LIMIT 5;

-- Manual Golden Ears processing
SELECT http_golden_ears_processor();
```

#### Trash Purge Recovery
```sql
-- Check trash status
SELECT COUNT(*) FROM songs WHERE deleted_at IS NOT NULL;

-- Manual trash purge
SELECT purge_expired_trash();
```

## Maintenance and Updates

### Regular Maintenance
- **Job Monitoring** - Weekly review of job execution logs
- **Performance Review** - Monthly performance analysis
- **Error Analysis** - Quarterly error pattern review
- **Schedule Optimization** - Annual schedule review

### Updates and Changes
- **Function Updates** - Update Edge Functions as needed
- **Schedule Changes** - Modify schedules based on system needs
- **New Jobs** - Add new automated processes as required
- **Job Removal** - Remove obsolete jobs

### Backup and Recovery
- **Job Configuration Backup** - Export cron job configurations
- **Function Code Backup** - Version control Edge Functions
- **Database Backup** - Regular database backups
- **Recovery Procedures** - Documented recovery processes

This comprehensive cron job system ensures reliable automation of critical SongWars processes while maintaining security, monitoring, and recoverability.
