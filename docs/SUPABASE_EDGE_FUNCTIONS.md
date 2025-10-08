# SongWars Edge Functions

## Overview
This document provides comprehensive documentation of all Edge Functions implemented in the SongWars system. Edge Functions are serverless functions that run on Supabase's edge network, providing automated processing and scheduled tasks.

## Edge Functions List

**Total Edge Functions: 2** (Updated January 2025)

### 1. Golden Ears Processor (`golden-ears-processor`)

#### Purpose
Automated processing of Golden Ears awards for the previous week's competition results.

#### Functionality
- **Trigger**: Scheduled to run weekly (typically Monday mornings)
- **Processing**: Calculates judge accuracy and awards Golden Ears to top 25%
- **Data Source**: Uses `weekly_stats` and `votes` tables
- **Output**: Updates `golden_ears` table with awards

#### Key Features
- **Batch Processing**: Processes users in batches to prevent database overload
- **Accuracy Calculation**: Compares user votes against final song scores
- **Award Distribution**: Awards Golden Ears to top 25% of qualified judges
- **Audit Logging**: Comprehensive logging of all processing activities
- **Error Handling**: Graceful error handling and recovery

#### Processing Flow
1. **Week Calculation**: Determines target week (2 weeks ago due to 1-week lag)
2. **User Processing**: Processes all users who voted in the target week
3. **Accuracy Calculation**: Calculates judge accuracy using most recent song scores for fair evaluation
4. **Qualification Check**: Identifies users with 20+ battles judged
5. **Award Distribution**: Awards Golden Ears to top 25% of qualified users
6. **Notification**: Sends notifications to award recipients

#### Configuration
- **Runtime**: Deno
- **Memory**: 128MB
- **Timeout**: 300 seconds
- **Schedule**: Weekly (Monday 00:00 UTC)

### 2. Weekly Churn (`weekly-churn`)

#### Purpose
Automated processing of the weekly churn system, advancing songs through the 4-week competition cycle.

#### Functionality
- **Trigger**: Scheduled to run weekly (typically Monday mornings)
- **Processing**: Advances all active songs to the next churn week
- **Data Source**: Uses `songs` table with active songs
- **Output**: Updates song churn state and creates weekly scores

#### Key Features
- **Churn Advancement**: Moves songs from week 0 to week 4
- **Score Calculation**: Calculates and stores weekly scores
- **Elimination**: Marks songs as inactive at week 4
- **Audit Logging**: Comprehensive logging of all churn activities
- **Error Handling**: Graceful error handling and recovery

#### Processing Flow
1. **Song Selection**: Identifies all active songs in churn
2. **Week Advancement**: Increments churn week for each song
3. **Score Calculation**: Calculates weekly scores based on likes/dislikes
4. **Score Storage**: Stores scores in `weekly_scores` table
5. **Elimination**: Marks songs as inactive at week 4
6. **Audit Logging**: Logs all churn activities

#### Configuration
- **Runtime**: Deno
- **Memory**: 128MB
- **Timeout**: 300 seconds
- **Schedule**: Weekly (Monday 00:00 UTC)

## Cron Jobs and Scheduled Tasks

**Total Active Cron Jobs: 3** (Updated January 2025)

### 1. Weekly Churn Processing
- **Function**: `weekly-churn`
- **Schedule**: `0 0 * * 1` (Every Monday at midnight UTC)
- **Purpose**: Processes weekly churn advancement for all active songs
- **Method**: HTTP POST to Edge Function endpoint

### 2. Golden Ears Processing
- **Function**: `golden-ears-processor`
- **Schedule**: `0 1 * * 1` (Every Monday at 1 AM UTC)
- **Purpose**: Awards Golden Ears to top 25% of qualified judges
- **Method**: HTTP POST to Edge Function endpoint

### 3. Trash Purge Processing
- **Function**: `purge_expired_trash()` (Database function)
- **Schedule**: `0 2 * * *` (Every day at 2 AM UTC)
- **Purpose**: Permanently deletes songs that have expired from trash (10+ days)
- **Method**: Direct database function call via pg_cron

## Edge Function Management

### 1. Deployment
- **Method**: Supabase CLI or Dashboard
- **Version Control**: Git-based deployment
- **Environment**: Production environment
- **Rollback**: Version-based rollback capability

### 2. Monitoring
- **Logs**: Comprehensive logging in Supabase Dashboard
- **Metrics**: Execution time, memory usage, error rates
- **Alerts**: Error notifications and performance monitoring
- **Debugging**: Detailed error logs and stack traces

### 3. Configuration
- **Environment Variables**: Secure configuration management
- **Secrets**: Vault integration for sensitive data
- **Timeouts**: Configurable execution timeouts
- **Memory**: Adjustable memory allocation

## Security Considerations

### 1. Access Control
- **Authentication**: Service role authentication
- **Authorization**: Limited to specific operations
- **Data Access**: Only accesses necessary tables
- **Audit Trail**: Complete logging of all operations

### 2. Data Protection
- **Encryption**: Data encrypted in transit and at rest
- **Secrets**: Sensitive data stored in Vault
- **Access Logs**: Complete access logging
- **Error Handling**: Secure error handling without data exposure

### 3. Performance Security
- **Resource Limits**: Memory and timeout limits
- **Rate Limiting**: Prevents resource abuse
- **Error Recovery**: Graceful error handling
- **Monitoring**: Continuous security monitoring

## Error Handling

### 1. Error Types
- **Database Errors**: Connection and query failures
- **Processing Errors**: Data processing failures
- **Timeout Errors**: Execution time exceeded
- **Memory Errors**: Memory allocation failures

### 2. Error Recovery
- **Retry Logic**: Automatic retry for transient errors
- **Graceful Degradation**: Continue processing when possible
- **Error Logging**: Comprehensive error logging
- **Alerting**: Immediate error notifications

### 3. Error Prevention
- **Input Validation**: Validate all inputs
- **Resource Monitoring**: Monitor resource usage
- **Timeout Management**: Appropriate timeout settings
- **Memory Management**: Efficient memory usage

## Performance Optimization

### 1. Execution Optimization
- **Batch Processing**: Process data in batches
- **Efficient Queries**: Optimized database queries
- **Memory Management**: Efficient memory usage
- **Timeout Optimization**: Appropriate timeout settings

### 2. Resource Management
- **Memory Allocation**: Optimal memory allocation
- **CPU Usage**: Efficient CPU utilization
- **Database Connections**: Connection pooling
- **Storage Access**: Efficient storage operations

### 3. Monitoring
- **Performance Metrics**: Track execution metrics
- **Resource Usage**: Monitor resource consumption
- **Error Rates**: Track error frequencies
- **Success Rates**: Monitor processing success

## Maintenance

### 1. Regular Updates
- **Function Updates**: Regular function updates
- **Dependency Updates**: Update dependencies
- **Security Patches**: Apply security patches
- **Performance Improvements**: Optimize performance

### 2. Monitoring
- **Health Checks**: Regular health monitoring
- **Performance Monitoring**: Track performance metrics
- **Error Monitoring**: Monitor error rates
- **Resource Monitoring**: Track resource usage

### 3. Troubleshooting
- **Log Analysis**: Analyze execution logs
- **Error Investigation**: Investigate errors
- **Performance Issues**: Address performance problems
- **Resource Issues**: Resolve resource problems

## Development and Testing

### 1. Local Development
- **Supabase CLI**: Local development environment
- **Testing**: Local function testing
- **Debugging**: Local debugging capabilities
- **Version Control**: Git-based development

### 2. Testing
- **Unit Testing**: Function unit tests
- **Integration Testing**: End-to-end testing
- **Performance Testing**: Load and performance testing
- **Security Testing**: Security vulnerability testing

### 3. Deployment
- **Staging**: Staging environment testing
- **Production**: Production deployment
- **Rollback**: Version rollback capability
- **Monitoring**: Post-deployment monitoring

This Edge Functions documentation provides comprehensive coverage of all automated processing in the SongWars system, ensuring reliable and efficient operation of the weekly competition cycles.
