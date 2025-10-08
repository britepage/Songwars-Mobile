# The Genre System

## Overview
The SongWars genre system organizes music into categories and provides real-time battle availability indicators to help users make informed decisions about their music uploads and battle participation.

## How It Works

### Master Genre List
SongWars uses a centralized list of 24 major music genres that covers the most common musical styles:

- **Alternative** - Independent and non-mainstream music
- **Blues** - Traditional and modern blues styles
- **Christian** - Christian and contemporary Christian music
- **Classical** - Orchestral and traditional classical music
- **Country** - Country and western music
- **Dance** - Electronic dance music and club music
- **Electronic** - Electronic and synthesized music
- **Folk** - Traditional and contemporary folk music
- **Funk** - Funk and soul-influenced music
- **Gospel** - Religious and spiritual music
- **Hip-Hop** - Rap and hip-hop music
- **Indie** - Independent and indie music
- **Jazz** - Jazz and jazz-influenced music
- **Latin** - Latin American and Spanish music
- **Metal** - Heavy metal and metal subgenres
- **Pop** - Popular and mainstream music
- **Punk** - Punk rock and punk-influenced music
- **R&B** - Rhythm and blues music
- **Reggae** - Reggae and reggae-influenced music
- **Rock** - Rock and rock-influenced music
- **Ska** - Ska and ska-influenced music
- **Soul** - Soul music and soul-influenced music
- **World** - International and world music
- **Other** - Music that doesn't fit other categories

### Battle Status Indicators
The system automatically detects which genres are ready for battles and shows visual indicators:

- **`●` (Filled Dot)** = Battle Ready
  - Genre has 2 or more active songs
  - Users can participate in battles for this genre
  - Songs in this genre will be matched for battles

- **`○` (Empty Dot)** = Needs More Songs
  - Genre has fewer than 2 active songs
  - Users cannot participate in battles for this genre yet
  - More songs need to be uploaded to enable battles

### Real-Time Updates
The battle status indicators update automatically:
- When songs are uploaded to a genre
- When songs are moved between genres
- When songs are deleted or become inactive
- When users navigate to different parts of the app

## Where You See It

### Song Upload Form
- **Genre Selection**: Choose from the master genre list
- **Status Indicators**: See which genres are battle-ready
- **User Guidance**: Know which genres will allow immediate battles

### Song Edit Form
- **Genre Changes**: Modify your song's genre
- **Status Updates**: See current battle availability
- **Strategic Decisions**: Choose genres based on battle readiness

### Battle Screen
- **Genre Filter**: Select from available battle-ready genres
- **Dynamic List**: Only shows genres with 2+ active songs
- **Real-Time Updates**: List updates as songs are uploaded

## Benefits for Users

### For Artists
- **Strategic Uploads**: Choose genres that are battle-ready for immediate competition
- **Genre Guidance**: Understand which categories have active communities
- **Competition Planning**: Know when your genre will be available for battles

### For Music Lovers
- **Battle Availability**: See which genres have active battles
- **Genre Exploration**: Discover music in different categories
- **Community Activity**: Understand which genres are most active

### For the Community
- **Genre Balance**: Encourage uploads to underrepresented genres
- **Battle Diversity**: Ensure variety in available battle categories
- **Community Growth**: Guide users toward active genres

## Technical Details

### Data Source
- **RPC Function**: `get_battle_available_genres()`
- **Real-Time**: Updates automatically as songs are uploaded
- **Consistent**: Same data source across all components
- **Efficient**: Only fetches when components load

### Visual Design
- **Simple Indicators**: Easy-to-understand dot system
- **Color Coding**: Green for ready, gray for not ready
- **Consistent Styling**: Matches the overall site design
- **Accessible**: Clear visual distinction for all users

### Performance
- **Optimized Queries**: Efficient database queries
- **Cached Results**: Results cached during component lifecycle
- **Minimal Updates**: Only updates when necessary
- **Fast Loading**: Quick response times for users

## Best Practices

### For Artists
1. **Check Status**: Look at battle indicators before uploading
2. **Choose Wisely**: Select genres that match your music style
3. **Be Patient**: Some genres may need more songs to become battle-ready
4. **Stay Active**: Upload to genres you want to see grow

### For Music Lovers
1. **Explore Genres**: Try battles in different categories
2. **Support Growth**: Vote on songs in underrepresented genres
3. **Encourage Uploads**: Suggest genres to artists you know
4. **Stay Informed**: Check status indicators regularly

### For the Community
1. **Genre Diversity**: Encourage uploads across all genres
2. **Active Participation**: Vote in battles to keep genres active
3. **Community Building**: Help new users understand the system
4. **Feedback**: Report issues with genre categorization

## Future Enhancements

### Planned Features
- **Subgenre Support**: More specific genre categories
- **Genre Trends**: Analytics on genre popularity
- **Custom Genres**: User-defined genre categories
- **Genre Recommendations**: AI-powered genre suggestions

### Community Input
- **Genre Requests**: Suggest new genres to add
- **Categorization Feedback**: Help improve genre definitions
- **Usage Analytics**: Share data on genre popularity
- **Feature Requests**: Suggest improvements to the system

## Getting Started

### For New Users
1. **Explore Genres**: Look at the master genre list
2. **Check Status**: See which genres are battle-ready
3. **Choose Wisely**: Select appropriate genres for your music
4. **Stay Updated**: Check status indicators regularly

### For Artists
1. **Upload Strategy**: Consider battle readiness when choosing genres
2. **Genre Research**: Understand which genres are most active
3. **Community Engagement**: Participate in battles for your chosen genres
4. **Feedback Loop**: Use battle results to improve your music

### For Music Lovers
1. **Battle Participation**: Vote in battles for different genres
2. **Genre Exploration**: Discover music in various categories
3. **Community Support**: Encourage uploads to underrepresented genres
4. **Active Engagement**: Help maintain active battle communities

The genre system is designed to make music discovery and competition more organized, fair, and engaging for everyone in the SongWars community. By understanding how it works, you can make better decisions about your music and participation in the platform.
