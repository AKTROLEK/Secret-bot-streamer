# 📚 API Documentation

## Discord Bot Commands

### User Commands

#### `/profile [user]`
View a streamer's profile information.

**Parameters:**
- `user` (optional): User to view profile for. Defaults to yourself.

**Response:**
- Displays streamer status, credits, stats, ratings, platforms, and achievements

**Example:**
```
/profile
/profile @username
```

---

#### `/credit balance`
Check your current credit balance.

**Response:**
- Available balance
- Savings balance
- Total earned
- Total spent

**Example:**
```
/credit balance
```

---

#### `/credit history [limit]`
View your transaction history.

**Parameters:**
- `limit` (optional): Number of transactions to show (default: 10, max: 25)

**Response:**
- List of recent transactions with amounts, types, and dates

**Example:**
```
/credit history
/credit history 20
```

---

#### `/credit transfer <recipient> <amount>`
Transfer credits to another streamer.

**Parameters:**
- `recipient` (required): User to transfer credits to
- `amount` (required): Amount of credits to transfer (minimum: 1)

**Response:**
- Success confirmation with new balance
- Transaction record created

**Example:**
```
/credit transfer @recipient 100
```

---

#### `/store browse [category]`
Browse available items in the rewards store.

**Parameters:**
- `category` (optional): Filter by specific category

**Categories:**
- Rank Upgrades
- Video Promotions
- Editing Services
- Design Services
- Gift Cards
- Physical Rewards
- Streaming Tools
- Coaching Sessions

**Response:**
- List of available items with prices and descriptions

**Example:**
```
/store browse
/store browse category:Video Promotions
```

---

#### `/store purchase <item_id> [notes]`
Purchase an item from the rewards store.

**Parameters:**
- `item_id` (required): ID of the item to purchase
- `notes` (optional): Additional notes for your purchase

**Response:**
- Purchase confirmation
- Credit deduction
- Order tracking number

**Example:**
```
/store purchase ITEM-123
/store purchase ITEM-123 notes:"Please use blue theme"
```

---

#### `/store orders`
View your purchase order history.

**Response:**
- List of purchases with status and dates

**Example:**
```
/store orders
```

---

#### `/ticket create <type> <subject> [description]`
Create a new support ticket.

**Parameters:**
- `type` (required): Type of ticket
  - Application
  - Issue Report
  - Credit Adjustment
  - Promotion Request
  - Technical Support
  - General
- `subject` (required): Brief subject
- `description` (optional): Detailed description

**Response:**
- Ticket created
- Private channel created
- Ticket ID assigned

**Example:**
```
/ticket create type:Application subject:"Streamer Application"
/ticket create type:Issue subject:"Bug Report" description:"Detailed description"
```

---

#### `/ticket close <ticket_id>`
Close an existing ticket.

**Parameters:**
- `ticket_id` (required): ID of the ticket to close

**Response:**
- Ticket closed
- Channel deleted

**Example:**
```
/ticket close TICKET-12345
```

---

#### `/ticket list [status]`
List your tickets.

**Parameters:**
- `status` (optional): Filter by status
  - Open
  - In Progress
  - Resolved
  - Closed

**Response:**
- List of tickets matching criteria

**Example:**
```
/ticket list
/ticket list status:Open
```

---

### Admin Commands

#### `/credit add <user> <amount> <reason>`
Add credits to a streamer's account (Admin only).

**Permissions Required:** Administrator

**Parameters:**
- `user` (required): User to add credits to
- `amount` (required): Amount of credits to add
- `reason` (required): Reason for adding credits

**Response:**
- Credits added
- Transaction recorded
- User notified

**Example:**
```
/credit add @user 500 reason:"Achievement reward"
```

---

#### `/credit deduct <user> <amount> <reason>`
Deduct credits from a streamer's account (Admin only).

**Permissions Required:** Administrator

**Parameters:**
- `user` (required): User to deduct credits from
- `amount` (required): Amount of credits to deduct
- `reason` (required): Reason for deducting credits

**Response:**
- Credits deducted
- Transaction recorded
- User notified

**Example:**
```
/credit deduct @user 100 reason:"Refund processed"
```

---

## Automated Features

### Weekly Reset
**Schedule:** Every Sunday at midnight (UTC)

**Actions:**
- Reset weekly video counts
- Reset weekly streaming hours
- Generate weekly performance report
- Highlight top 3 performers

---

### Monthly Reset
**Schedule:** First day of each month at midnight (UTC)

**Actions:**
- Reset monthly video counts
- Reset monthly streaming hours
- Generate monthly performance report
- Award monthly achievements

---

### Inactivity Check
**Schedule:** Daily at 9:00 AM (UTC)

**Actions:**
- Identify streamers inactive for 7+ days
- Send alerts to management
- Send reminders to inactive streamers

---

### Streaming Schedule Reminders
**Schedule:** Every hour

**Actions:**
- Check scheduled streams starting in 1 hour
- Send reminder notifications to streamers
- Track missed scheduled streams

---

## Database Models

### Streamer Schema
```javascript
{
  discordId: String (unique, indexed),
  username: String,
  status: Enum ['pending', 'active', 'inactive', 'suspended'],
  platforms: {
    youtube: { channelId, channelUrl, enabled },
    twitch: { username, channelUrl, enabled },
    tiktok: { username, profileUrl, enabled },
    kick: { username, channelUrl, enabled },
    instagram: { username, profileUrl, enabled },
    facebook: { pageId, pageUrl, enabled }
  },
  credit: {
    balance: Number,
    savings: Number,
    totalEarned: Number,
    totalSpent: Number
  },
  stats: {
    totalVideos, totalStreams, totalStreamingHours,
    weeklyVideos, weeklyStreamingHours,
    monthlyVideos, monthlyStreamingHours,
    lastVideoDate, lastStreamDate, lastActiveDate
  },
  rating: {
    overall: Number (0-100),
    consistency: Number (0-100),
    engagement: Number (0-100),
    quality: Number (0-100)
  },
  schedule: Array of scheduled streams,
  rulesCompliance: Platform-specific compliance tracking,
  achievements: Array of achievements,
  language: Enum ['en', 'ar']
}
```

---

### Transaction Schema
```javascript
{
  transactionId: String (unique),
  userId: String (indexed),
  type: Enum [
    'earn_video', 'earn_stream', 'earn_weekly_goal', 
    'earn_engagement', 'earn_achievement', 'spend_purchase',
    'spend_promotion', 'admin_add', 'admin_deduct',
    'transfer_send', 'transfer_receive', 
    'savings_deposit', 'savings_withdraw'
  ],
  amount: Number,
  balanceAfter: Number,
  description: String,
  relatedTo: { type, id, details },
  createdAt: Date (indexed)
}
```

---

### Ticket Schema
```javascript
{
  ticketId: String (unique),
  channelId: String,
  userId: String (indexed),
  type: Enum [
    'application', 'issue', 'credit_adjustment',
    'promotion_request', 'technical_support', 'general'
  ],
  status: Enum ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
  subject: String,
  description: String,
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  assignedTo: { userId, username, assignedAt },
  messages: Array of message objects,
  createdAt: Date (indexed)
}
```

---

### Store Item Schema
```javascript
{
  itemId: String (unique),
  name: String,
  nameAr: String,
  description: String,
  descriptionAr: String,
  category: Enum [
    'rank_upgrade', 'video_promotion', 'editing_service',
    'design_service', 'gift_card', 'physical_reward',
    'streaming_tool', 'coaching_session', 'custom'
  ],
  creditCost: Number,
  available: Boolean,
  stock: Number (-1 for unlimited),
  requirements: {
    minRating, minVideos, minStreamingHours,
    requiredAchievements
  }
}
```

---

## Platform Integration APIs

### YouTube Integration
```javascript
// Fetch channel data
fetchYouTubeChannelData(channelId)
// Returns: { title, subscriberCount, viewCount, videoCount, thumbnail }

// Fetch recent videos
fetchYouTubeRecentVideos(channelId, maxResults)
// Returns: Array of { videoId, title, description, publishedAt, thumbnail }
```

---

### Twitch Integration
```javascript
// Fetch user data
fetchTwitchUserData(username)
// Returns: { id, displayName, description, profileImageUrl, viewCount }
```

---

## AI Service APIs

### Content Suggestions
```javascript
generateContentSuggestions(streamerData, platform)
// Returns: { suggestions: String }
```

### Title Generation
```javascript
generateTitleSuggestions(topic, platform)
// Returns: { titles: Array<String> }
```

### Content Quality Analysis
```javascript
analyzeContentQuality(contentDescription)
// Returns: { analysis: String }
```

### Optimal Streaming Time
```javascript
getOptimalStreamingTime(streamerData, platform)
// Returns: { recommendation: String }
```

### Rule Violation Detection
```javascript
detectRuleViolations(contentText)
// Returns: { assessment: String }
```

---

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INSUFFICIENT_CREDITS` | Not enough credits for operation | Earn more credits or reduce amount |
| `ITEM_NOT_FOUND` | Store item doesn't exist | Check item ID |
| `OUT_OF_STOCK` | Item out of stock | Wait for restock or choose another item |
| `INVALID_PERMISSIONS` | User lacks required permissions | Contact administrator |
| `STREAMER_NOT_FOUND` | User not registered as streamer | Apply via ticket system |
| `TICKET_NOT_FOUND` | Ticket doesn't exist | Check ticket ID |
| `PLATFORM_API_ERROR` | External API error | Try again later or contact support |
| `DATABASE_ERROR` | Database operation failed | Contact support |

---

## Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Command execution | 5 commands | 10 seconds |
| Credit transfers | 3 transfers | 1 minute |
| Ticket creation | 2 tickets | 1 hour |
| Store purchases | 5 purchases | 1 hour |
| API requests | 100 requests | 1 minute |

---

## Webhooks (Future Feature)

### Events
- `streamer.created`
- `streamer.updated`
- `credit.earned`
- `credit.spent`
- `ticket.created`
- `ticket.resolved`
- `purchase.completed`
- `achievement.unlocked`

---

## Best Practices

1. **Always check responses** - Handle errors gracefully
2. **Use appropriate commands** - Don't use admin commands for user operations
3. **Validate input** - Check data before submitting
4. **Handle rate limits** - Implement exponential backoff
5. **Cache when possible** - Reduce API calls
6. **Log operations** - Track important actions
7. **Secure credentials** - Never expose tokens or keys
8. **Test thoroughly** - Verify in development before production

---

## Support

For API support:
- Create a ticket: `/ticket create type:Technical Support`
- Check documentation updates
- Contact development team

---

**Last Updated:** 2024-11-18
**API Version:** 1.0.0
