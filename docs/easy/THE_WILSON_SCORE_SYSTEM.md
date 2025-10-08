# The Wilson Score System

## Overview
SongWars uses the Wilson Score Interval to calculate song rankings, providing a statistically sound method that balances approval rate with sample size confidence. This system prevents gaming while ensuring fair competition.

## What is the Wilson Score?

### Statistical Foundation
The Wilson Score Interval is a statistical method that provides a confidence interval for a proportion (approval rate) based on the number of observations (votes). It's particularly useful for ranking systems where you want to balance:

- **Quality**: Higher approval rate (more likes)
- **Quantity**: More votes (larger sample size)
- **Confidence**: Statistical certainty about the true approval rate

### Why We Use Wilson Score

**Problem with Simple Approval Rate:**
- A song with 1 like out of 1 vote (100% approval) could beat a song with 99 likes out of 100 votes (99% approval)
- This doesn't reflect true quality or community preference
- Encourages gaming with low vote counts

**Wilson Score Solution:**
- Songs need BOTH high approval rate AND sufficient votes
- Provides statistical confidence in the ranking
- Prevents gaming with artificially low vote counts
- Fair comparison between songs with different vote totals

## How It Works

### The Mathematical Formula

```
Wilson Score = ((p + z²/(2n) - z × √((p×(1-p) + z²/(4n))/n)) ÷ (1 + z²/n)) × 100
```

Where:
- **p** = approval rate (likes ÷ total votes)
- **n** = sample size (likes + dislikes)
- **z** = 1.96 (95% confidence interval)

### Step-by-Step Calculation

1. **Calculate Approval Rate**: p = likes ÷ (likes + dislikes)
2. **Calculate Sample Size**: n = likes + dislikes
3. **Apply Wilson Formula**: Uses the complex formula above
4. **Scale to 0-100**: Multiply by 100 for our scoring system
5. **Cap Results**: Minimum 0, Maximum 100

### Example Scenarios

**Scenario 1: High Quality, High Volume**
- 95 likes, 5 dislikes (95% approval, 100 votes)
- Wilson Score: ~94.2
- **Result**: High score due to both quality and quantity

**Scenario 2: High Quality, Low Volume**
- 1 like, 0 dislikes (100% approval, 1 vote)
- Wilson Score: ~50.0
- **Result**: Low score due to insufficient sample size

**Scenario 3: Medium Quality, High Volume**
- 60 likes, 40 dislikes (60% approval, 100 votes)
- Wilson Score: ~52.4
- **Result**: Moderate score reflecting both approval rate and confidence

**Scenario 4: Low Quality, High Volume**
- 20 likes, 80 dislikes (20% approval, 100 votes)
- Wilson Score: ~15.8
- **Result**: Low score reflecting poor approval rate

## Benefits for SongWars

### 1. Prevents Gaming
- Can't win with just 1-2 lucky votes
- Requires sustained community engagement
- Rewards songs that consistently perform well

### 2. Fair Competition
- Songs with different vote counts can be fairly compared
- Statistical confidence accounts for sample size uncertainty
- No advantage for songs that happen to get more battles

### 3. Quality Assurance
- Only songs with both high approval AND sufficient votes rank highly
- Encourages artists to create consistently good music
- Community validation through sustained positive feedback

### 4. Statistical Rigor
- Based on established statistical methods
- 95% confidence interval provides reliable rankings
- Mathematically sound approach to ranking

## Implementation Details

### Database Function
The Wilson Score is calculated in the `calculate_song_score()` PostgreSQL function:

```sql
CREATE OR REPLACE FUNCTION calculate_song_score(likes_count integer, dislikes_count integer)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  n numeric := (likes_count + dislikes_count);
  z numeric := 1.96;  -- 95% confidence
  p numeric;
  w numeric;
BEGIN
  IF n = 0 THEN
    RETURN 50.0;  -- Neutral score for no votes
  END IF;

  p := likes_count::numeric / n;
  
  w := (
    (p + z*z/(2*n) - z * sqrt((p*(1-p) + z*z/(4*n))/n))
    / (1 + z*z/n)
  ) * 100.0;

  RETURN ROUND(LEAST(w, 100.0), 2);  -- Cap at 100
END;
$$;
```

### Score Updates
- Scores are recalculated weekly during churn processing
- All historical scores updated when system was implemented
- New songs get scores calculated on first vote
- Scores capped at 100 for display purposes

## Comparison with Previous System

### Old System (Approval Rate + Vote Bonus)
- **Base Score**: (likes ÷ total votes) × 100
- **Vote Bonus**: +0.5 points per vote (if ≥10 votes)
- **Problem**: Songs with lower approval could beat higher approval if they had more votes

### New System (Wilson Score)
- **Statistical Confidence**: Accounts for sample size uncertainty
- **Balanced Approach**: Requires both quality and quantity
- **Fair Ranking**: No advantage for random battle frequency
- **Prevents Gaming**: Can't win with artificially low vote counts

## Impact on Competition

### For Artists
- **Quality Focus**: Must create consistently good music
- **Community Engagement**: Need sustained positive feedback
- **Fair Competition**: No advantage from random battle frequency
- **Clear Expectations**: Statistical method is transparent and fair

### For the Community
- **Better Rankings**: More accurate reflection of true quality
- **Prevents Gaming**: System can't be manipulated easily
- **Fair Evaluation**: All songs judged on merit, not luck
- **Quality Discovery**: Best songs rise to the top naturally

### For the Platform
- **Statistical Rigor**: Mathematically sound ranking system
- **Prevents Exploitation**: Harder to game the system
- **Quality Assurance**: Only truly good songs rank highly
- **Community Trust**: Transparent and fair evaluation method

## Future Considerations

### Potential Enhancements
- **Time Decay**: Weight recent votes more heavily
- **Genre Adjustments**: Account for genre-specific voting patterns
- **User Weighting**: Weight votes by user credibility
- **Confidence Intervals**: Display uncertainty in rankings

### Monitoring
- **Score Distribution**: Monitor how scores are distributed
- **Vote Patterns**: Track voting behavior and patterns
- **Ranking Stability**: Ensure rankings are stable and meaningful
- **Community Feedback**: Gather feedback on ranking fairness

## Conclusion

The Wilson Score system provides SongWars with a statistically sound, fair, and robust method for ranking songs. By balancing approval rate with sample size confidence, it ensures that only truly excellent songs rise to the top while preventing gaming and maintaining community trust in the ranking system.

This mathematical approach to ranking creates a more competitive, fair, and engaging platform where quality music is properly recognized and rewarded.
