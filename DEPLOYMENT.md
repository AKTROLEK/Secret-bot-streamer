# Vercel Deployment Configuration

## Environment Variables

Set these in your Vercel project settings:

### Required Variables
```
DISCORD_TOKEN=your_discord_bot_token
DISCORD_CLIENT_ID=your_client_id
DISCORD_GUILD_ID=your_guild_id
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://yourdomain.vercel.app
```

### Optional Platform API Keys
```
YOUTUBE_API_KEY=your_key
TWITCH_CLIENT_ID=your_id
TWITCH_CLIENT_SECRET=your_secret
TIKTOK_API_KEY=your_key
KICK_API_KEY=your_key
INSTAGRAM_API_KEY=your_key
FACEBOOK_API_KEY=your_key
OPENAI_API_KEY=your_key
```

### Discord Role and Channel IDs
```
SOCIAL_MEDIA_MANAGER_ROLE_ID=role_id
SOCIAL_TEAM_ROLE_ID=role_id
STREAMER_MANAGEMENT_ROLE_ID=role_id
TICKET_CATEGORY_ID=category_id
ALERTS_CHANNEL_ID=channel_id
REPORTS_CHANNEL_ID=channel_id
```

## Deployment Steps

1. **Prepare Repository**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project settings

3. **Configure Build Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Go to Project Settings > Environment Variables
   - Add all required variables listed above
   - Make sure to add them for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your dashboard
   - Your site will be live at `https://your-project.vercel.app`

## Post-Deployment

### Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed

### Bot Hosting
The Discord bot needs to run separately. Options:
1. **Railway**: Easy deployment for Node.js bots
2. **Heroku**: Free tier available
3. **DigitalOcean**: VPS for full control
4. **AWS EC2**: Scalable cloud hosting

### Database
Recommended MongoDB hosting:
1. **MongoDB Atlas**: Free tier available, globally distributed
2. **DigitalOcean MongoDB**: Managed database
3. **AWS DocumentDB**: Enterprise-grade MongoDB compatible

## Monitoring

### Vercel Analytics
- Enable in Project Settings > Analytics
- Track page views, performance, and Web Vitals

### Bot Monitoring
- Use service like UptimeRobot for bot uptime
- Set up logging service (Datadog, LogDNA)
- Monitor error rates and performance

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure environment variables are set correctly

### Runtime Errors
- Check Function logs in Vercel dashboard
- Verify database connection string
- Check API keys are valid

### Bot Connection Issues
- Verify DISCORD_TOKEN is correct
- Check bot has proper permissions
- Ensure bot is invited to server with correct scopes

## Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Database**: Use connection pooling for better performance
3. **Caching**: Implement caching for frequently accessed data
4. **Monitoring**: Set up alerts for errors and downtime
5. **Backups**: Regular database backups
6. **Updates**: Keep dependencies updated for security

## Performance Optimization

### Dashboard
- Use `next/image` for optimized images
- Implement code splitting
- Enable ISR (Incremental Static Regeneration) where applicable
- Use Edge Functions for better performance

### Bot
- Implement command cooldowns
- Use database indexes
- Cache frequently accessed data
- Implement rate limiting

## Security Checklist

- ✅ All secrets in environment variables
- ✅ Input validation on all forms
- ✅ Rate limiting enabled
- ✅ CORS configured properly
- ✅ Authentication implemented
- ✅ SQL injection prevention
- ✅ XSS protection enabled
- ✅ HTTPS enforced

## Scaling Considerations

### When to Scale
- Response times > 500ms
- Error rates > 1%
- CPU usage > 80%
- Memory usage > 80%

### How to Scale
- **Horizontal**: Add more bot instances with load balancer
- **Vertical**: Upgrade database and hosting plans
- **Caching**: Implement Redis for session management
- **CDN**: Use Vercel's Edge Network effectively

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Discord.js Guide](https://discordjs.guide/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
