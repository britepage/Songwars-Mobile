# The Churn Competition System

## How Songs Compete Over Time

The Churn system is SongWars' way of ensuring that every song gets a fair chance to compete while keeping the platform fresh with new music. It's like a tournament that never ends, where songs enter, compete for 4 weeks, and either advance to higher levels or make room for new entries.

## What is the Churn System?

### The Basic Concept
The Churn system is a 4-week competition cycle where:
- **New songs enter** the competition every week
- **Songs compete** for 4 weeks in battles
- **Performance determines** whether songs advance or are eliminated
- **The cycle continues** indefinitely, always bringing fresh music
- **Fair opportunity** for every song to prove itself

### Why We Need This System
- **Keeps the platform fresh** with new music constantly
- **Gives every song a fair chance** to compete
- **Prevents stagnation** by cycling out underperforming songs
- **Maintains quality** by promoting only the best music
- **Creates ongoing excitement** with continuous competition

## How the 4-Week Cycle Works

### Week 1: Entry
- **New songs enter** the competition
- **Start competing** in battles immediately
- **Begin accumulating** points and wins
- **Establish their presence** in the community
- **Start building** their reputation

### Week 2: Competition
- **Continue battling** against other songs
- **Accumulate more points** and wins
- **Build momentum** if performing well
- **Face tougher competition** as they advance
- **Establish their standing** in the rankings

### Week 3: Pressure
- **Face increased competition** from other advancing songs
- **Need strong performance** to continue advancing
- **Battle against** the best songs from their cohort
- **Prove their staying power** in the competition
- **Show they deserve** to continue

### Week 4: Decision
- **Final week** of their competition cycle
- **Must perform well** to advance to higher levels
- **Face elimination** if they don't meet standards
- **Either advance** to the next level or make room for new songs
- **Complete their cycle** and either continue or exit

## How Songs Advance or Get Eliminated

### Score Calculation System
Songs are scored using the **Wilson Score Interval**, a statistical method that balances approval rate with sample size confidence:

**Wilson Score Formula:**
- **Approval Rate**: Percentage of battles won (likes ÷ total votes)
- **Sample Size**: Total number of votes received
- **Confidence Level**: 95% confidence interval (z = 1.96)
- **Lower Bound**: Conservative estimate of true approval rate

**Mathematical Calculation:**
1. **Approval Rate**: p = likes ÷ total_votes
2. **Sample Size**: n = likes + dislikes
3. **Wilson Score**: Lower bound of 95% confidence interval
4. **Formula**: (p + z²/(2n) - z × √((p(1-p) + z²/(4n))/n)) ÷ (1 + z²/n) × 100
5. **Capped Score**: Minimum 0, Maximum 100

**Why Wilson Score?**
- **Balances Quality & Quantity**: Higher approval rate AND more votes = higher score
- **Prevents Gaming**: Can't win with just 1-2 lucky votes
- **Statistical Confidence**: Accounts for sample size uncertainty
- **Fair Comparison**: Songs with different vote counts can be fairly compared

### Advancement Criteria
Songs advance to higher levels based on:
- **Calculated Score** - mathematical score from the formula above
- **Win/Loss Record** - how many battles they win
- **Vote Percentage** - what percentage of voters choose them
- **Battle Volume** - minimum number of battles required
- **Recent Performance** - how they've been doing lately
- **Overall Ranking** - their position compared to other songs

### Elimination Process
Songs are eliminated if they:
- **Don't win enough battles** during their 4-week cycle
- **Receive low vote percentages** from the community
- **Have insufficient battle volume** (haven't fought enough battles)
- **Show consistently poor performance** over time
- **Are consistently rejected** by the community
- **Exceed time limits** without improvement
- **Fail to accumulate** sufficient points
- **Don't engage** the community effectively
- **Fall below** the performance threshold

### What Happens to Eliminated Songs
- **Removed from active competition** but not deleted
- **Can be restored** if the artist improves them
- **Preserved in the system** for future reference
- **Make room** for new songs to enter
- **Allow the platform** to stay fresh and dynamic

## The Competition Levels

### Entry Level
- **New songs start here** when they first enter
- **Face other new songs** in their first battles
- **Learn the competition** and build their reputation
- **Prove they belong** in the SongWars community
- **Establish their presence** in the platform

### Intermediate Level
- **Songs that advance** from the entry level
- **Face tougher competition** from proven performers
- **Battle against** songs that have already proven themselves
- **Need stronger performance** to continue advancing
- **Show they can compete** at higher levels

### Advanced Level
- **Top-performing songs** that have proven themselves
- **Face the best competition** on the platform
- **Battle against** the most successful songs
- **Represent the pinnacle** of SongWars competition
- **Set the standard** for excellence

### Elite Level
- **The absolute best songs** on the platform
- **Face only the most successful** songs in battles
- **Represent the gold standard** of musical excellence
- **Inspire other artists** to improve their work
- **Define what makes** music great on SongWars

## The Benefits of the Churn System

### For Artists
- **Fair opportunity** to compete and prove themselves
- **Clear progression path** from entry to elite levels
- **Motivation to improve** their music based on performance
- **Recognition for success** as they advance through levels
- **Continuous feedback** on their musical quality

### For the Community
- **Fresh music constantly** entering the platform
- **Quality filtering** that promotes only the best songs
- **Exciting competition** that never gets stale
- **Clear progression** that's easy to understand
- **Fair system** that gives everyone a chance

### For Music Discovery
- **New discoveries** every week as new songs enter
- **Quality assurance** through the competition process
- **Community curation** that brings the best to the top
- **Continuous evolution** of what's considered great
- **Democratic process** that reflects community taste

## How the System Stays Fair

### Equal Opportunity
- **Every song gets the same chance** to compete
- **No favoritism** in song selection or pairing
- **Random pairing** ensures fair matchups
- **Consistent evaluation** across all songs
- **Transparent scoring** that everyone can understand

### Community-Driven Decisions
- **The community votes** on every battle
- **No industry gatekeepers** deciding what's good
- **Democratic process** that reflects real taste
- **Transparent results** that everyone can see
- **Fair evaluation** based on musical merit

### Continuous Improvement
- **Songs can improve** and re-enter the competition
- **Artists learn** from their performance feedback
- **Community taste evolves** over time
- **System adapts** to changing preferences
- **Quality standards** rise with community engagement

## The Impact on Music Discovery

### Quality Filtering
- **Only the best songs** advance to higher levels
- **Community validation** ensures quality
- **Continuous competition** maintains standards
- **Elimination process** removes underperforming songs
- **Quality rises** as the community becomes more engaged

### Fresh Content
- **New songs enter** every week
- **Platform stays dynamic** with constant change
- **No stagnation** in the music available
- **Continuous discovery** of new artists
- **Evolving taste** reflected in the competition

### Community Engagement
- **Exciting competition** that keeps users engaged
- **Clear progression** that's easy to follow
- **Fair system** that everyone can trust
- **Democratic process** that gives everyone a voice
- **Continuous excitement** with new battles and results

## The Future of the Churn System

### Ongoing Development
We're constantly improving the Churn system:
- **Better scoring algorithms** for fairer evaluation
- **Enhanced competition formats** for more excitement
- **Improved progression paths** for clearer advancement
- **Better feedback systems** for artists
- **More engaging features** for the community

### Community Evolution
As the community grows, the Churn system will:
- **Scale with participation** to maintain quality
- **Adapt to new music** and changing tastes
- **Recognize diverse excellence** across genres
- **Build stronger communities** around music
- **Create lasting value** for all participants

## Join the Competition

The Churn system is what makes SongWars exciting and fair. Whether you're an artist looking to prove your music's worth, a music lover seeking quality discoveries, or someone who wants to be part of a dynamic music community, the Churn system provides the structure and opportunity you need.

**Ready to compete?** Upload your music or start voting in battles today and see how the Churn system can help you discover amazing music and build a reputation in the SongWars community!

The Churn system ensures that SongWars remains fresh, fair, and exciting by giving every song a chance to compete while maintaining the highest quality standards through community-driven evaluation. It's the engine that powers music discovery and keeps the platform dynamic and engaging.
