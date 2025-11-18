# 🚀 Quick Start Guide

## For New Users

### 1. Prerequisites Check
Before starting, make sure you have:
- ✅ Node.js 18.0.0 or higher installed
- ✅ Git installed
- ✅ A Discord account
- ✅ MongoDB database (local or cloud)

### 2. Discord Bot Setup

#### Step 1: Create Discord Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Streamer Manager")
4. Click "Create"

#### Step 2: Create Bot
1. Go to the "Bot" section
2. Click "Add Bot"
3. Click "Reset Token" and copy the token (you'll need this)
4. Enable these Privileged Gateway Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

#### Step 3: Get Client ID
1. Go to the "OAuth2" section
2. Copy your "Client ID"

#### Step 4: Invite Bot to Server
1. Go to OAuth2 > URL Generator
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Administrator (for simplicity) OR
   - ✅ Manage Channels
   - ✅ Manage Roles
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Read Message History
   - ✅ Use Slash Commands
4. Copy the generated URL
5. Open the URL in your browser
6. Select your server and authorize

### 3. Get Discord IDs

#### Enable Developer Mode
1. Open Discord
2. Go to User Settings > Advanced
3. Enable "Developer Mode"

#### Get Guild (Server) ID
1. Right-click your server icon
2. Click "Copy ID"

#### Get Role IDs
1. Go to Server Settings > Roles
2. Right-click on a role
3. Click "Copy ID"
4. Repeat for all management roles

#### Get Channel/Category IDs
1. Right-click a channel or category
2. Click "Copy ID"
3. Repeat for ticket category, alerts channel, etc.

### 4. MongoDB Setup

#### Option A: MongoDB Atlas (Recommended - Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free
3. Create a new cluster (M0 Free tier)
4. Wait for cluster creation (~5 minutes)
5. Click "Connect"
6. Add your current IP to whitelist
7. Create a database user
8. Choose "Connect your application"
9. Copy the connection string
10. Replace `<password>` with your database password

#### Option B: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/streamer-management`

### 5. Project Setup

```bash
# Clone the repository
git clone https://github.com/AKTROLEK/Secret-bot-streamer.git
cd Secret-bot-streamer

# Install bot dependencies
npm install

# Install dashboard dependencies
cd dashboard
npm install
cd ..

# Copy environment template
cp .env.example .env
```

### 6. Configure Environment

Edit `.env` file with your values:

```env
# Required - Discord Bot
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here

# Required - Database
MONGODB_URI=your_mongodb_connection_string

# Required - Discord Roles (get these IDs from your server)
SOCIAL_MEDIA_MANAGER_ROLE_ID=your_role_id
SOCIAL_TEAM_ROLE_ID=your_role_id
STREAMER_MANAGEMENT_ROLE_ID=your_role_id

# Required - Discord Channels
TICKET_CATEGORY_ID=your_category_id
ALERTS_CHANNEL_ID=your_channel_id
REPORTS_CHANNEL_ID=your_channel_id

# Optional - Platform APIs (add later if needed)
YOUTUBE_API_KEY=
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
OPENAI_API_KEY=
```

### 7. Start the Bot

```bash
# Make sure you're in the project root
npm start
```

You should see:
```
🚀 Starting Streamer Management Bot...
✅ Connected to MongoDB
✅ Loaded command: ticket
✅ Loaded command: profile
✅ Loaded command: credit
✅ Loaded command: store
✅ Loaded event: ready
✅ Loaded event: interactionCreate
✅ Logged in as YourBotName#1234
🔄 Started refreshing application (/) commands.
✅ Successfully reloaded 4 application (/) commands.
✅ Initialized service: monitoring.js
✅ Bot is fully operational!
```

### 8. Test the Bot

In your Discord server, try:
```
/profile
/credit balance
/ticket create type:General subject:"Test Ticket"
/store browse
```

### 9. Start the Dashboard (Optional)

```bash
# In a new terminal, from project root
npm run dashboard
```

Dashboard will be available at: `http://localhost:3000`

---

## Common Issues & Solutions

### ❌ "Invalid Token"
**Problem:** Discord token is incorrect or expired
**Solution:** 
1. Go to Discord Developer Portal
2. Go to Bot section
3. Click "Reset Token"
4. Copy new token to `.env`

### ❌ "Missing Access"
**Problem:** Bot doesn't have required permissions
**Solution:**
1. Re-invite bot with Administrator permission OR
2. Give bot specific permissions in server settings

### ❌ "MongooseError: buffering timed out"
**Problem:** Cannot connect to MongoDB
**Solution:**
1. Check MONGODB_URI is correct
2. Check IP is whitelisted in MongoDB Atlas
3. Check database user credentials

### ❌ "Commands not showing in Discord"
**Problem:** Slash commands not registered
**Solution:**
1. Make sure DISCORD_CLIENT_ID and DISCORD_GUILD_ID are set
2. Wait a few minutes for Discord to sync
3. Try restarting Discord app

### ❌ "Cannot find module"
**Problem:** Dependencies not installed
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# For dashboard
cd dashboard
rm -rf node_modules
npm install
```

---

## Initial Configuration

### Create Your First Streamer

1. In Discord, run:
   ```
   /ticket create type:Application subject:"Streamer Application"
   ```

2. Fill in the ticket with your information

3. An admin can then manually add the streamer to the database, or you can use MongoDB Compass to add:
   ```json
   {
     "discordId": "your_discord_user_id",
     "username": "YourUsername",
     "status": "active",
     "credit": {
       "balance": 100,
       "savings": 0,
       "totalEarned": 100,
       "totalSpent": 0
     }
   }
   ```

### Add Store Items

Use MongoDB Compass or shell to add items:
```javascript
db.storeitems.insertOne({
  itemId: "ITEM-001",
  name: "Video Promotion",
  description: "Promote your video on all social media channels",
  category: "video_promotion",
  creditCost: 50,
  available: true,
  stock: -1,
  iconEmoji: "📢"
})
```

---

## Production Deployment

### Deploy Dashboard to Vercel

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to [Vercel](https://vercel.com)

3. Click "Import Project"

4. Import from GitHub

5. Configure:
   - Root Directory: `dashboard`
   - Framework: Next.js

6. Add environment variables in Vercel settings

7. Deploy!

### Deploy Bot to Railway

1. Create account at [Railway.app](https://railway.app)

2. Create new project

3. Connect GitHub repository

4. Configure:
   - Root Directory: `/`
   - Start Command: `npm start`

5. Add environment variables

6. Deploy!

---

## Next Steps

1. ✅ Test all commands
2. ✅ Configure platform API keys
3. ✅ Customize store items
4. ✅ Set up achievement system
5. ✅ Configure automated reports
6. ✅ Customize bot presence and branding
7. ✅ Add custom Discord roles
8. ✅ Configure webhook integrations
9. ✅ Set up backup procedures
10. ✅ Train your team on the system

---

## Getting Help

- 📚 Read the [README.md](README.md) for detailed documentation
- 📖 Check [API.md](API.md) for command reference
- 🚀 See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guides
- 🐛 Open an issue on GitHub
- 💬 Create a support ticket in Discord

---

## Tips for Success

✨ **Start Small** - Get basic features working first, then add platforms
✨ **Test Often** - Try commands frequently to catch issues early
✨ **Backup Data** - Export MongoDB data regularly
✨ **Monitor Logs** - Check bot logs to catch errors
✨ **Update Dependencies** - Keep packages up to date for security
✨ **Use Transactions** - For credit operations, ensure data consistency
✨ **Rate Limit** - Implement cooldowns to prevent abuse
✨ **Document Changes** - Keep track of customizations

---

**Congratulations! Your streamer management system is ready to go! 🎉**
