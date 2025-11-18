import cron from 'node-cron';
import Streamer from '../models/Streamer.js';
import { EmbedBuilder } from 'discord.js';
import config from '../../config/index.js';

let client = null;

// Initialize the monitoring service
export default {
  async initialize(discordClient) {
    client = discordClient;
    console.log('🔄 Initializing monitoring service...');

    // Schedule weekly reset (every Sunday at midnight)
    cron.schedule('0 0 * * 0', async () => {
      console.log('📊 Running weekly stats reset...');
      await resetWeeklyStats();
    });

    // Schedule monthly reset (first day of month at midnight)
    cron.schedule('0 0 1 * *', async () => {
      console.log('📊 Running monthly stats reset...');
      await resetMonthlyStats();
    });

    // Check for inactive streamers daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('🔍 Checking for inactive streamers...');
      await checkInactiveStreamers();
    });

    // Check streaming schedules every hour
    cron.schedule('0 * * * *', async () => {
      console.log('⏰ Checking streaming schedules...');
      await checkStreamingSchedules();
    });

    console.log('✅ Monitoring service initialized');
  },
};

async function resetWeeklyStats() {
  try {
    const streamers = await Streamer.find({ status: 'active' });

    for (const streamer of streamers) {
      // Reset weekly counters for each platform
      for (const platform of ['youtube', 'twitch', 'tiktok', 'kick', 'instagram', 'facebook']) {
        if (streamer.rulesCompliance[platform]) {
          streamer.rulesCompliance[platform].currentWeeklyVideos = 0;
          streamer.rulesCompliance[platform].currentStreamingHours = 0;
        }
      }

      streamer.stats.weeklyVideos = 0;
      streamer.stats.weeklyStreamingHours = 0;

      await streamer.save();
    }

    console.log(`✅ Reset weekly stats for ${streamers.length} streamers`);

    // Generate weekly report
    await generateWeeklyReport();
  } catch (error) {
    console.error('Error resetting weekly stats:', error);
  }
}

async function resetMonthlyStats() {
  try {
    const streamers = await Streamer.find({ status: 'active' });

    for (const streamer of streamers) {
      streamer.stats.monthlyVideos = 0;
      streamer.stats.monthlyStreamingHours = 0;
      await streamer.save();
    }

    console.log(`✅ Reset monthly stats for ${streamers.length} streamers`);

    // Generate monthly report
    await generateMonthlyReport();
  } catch (error) {
    console.error('Error resetting monthly stats:', error);
  }
}

async function checkInactiveStreamers() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const inactiveStreamers = await Streamer.find({
      status: 'active',
      'stats.lastActiveDate': { $lt: sevenDaysAgo },
    });

    if (inactiveStreamers.length === 0) return;

    const alertsChannel = client.channels.cache.get(config.channels.alerts);
    
    if (!alertsChannel) {
      console.log('⚠️  Alerts channel not configured');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('⚠️  Inactive Streamers Alert')
      .setDescription(`${inactiveStreamers.length} streamer(s) have been inactive for more than 7 days`)
      .setTimestamp();

    for (const streamer of inactiveStreamers.slice(0, 25)) {
      const lastActive = streamer.stats.lastActiveDate 
        ? streamer.stats.lastActiveDate.toLocaleDateString()
        : 'Never';

      embed.addFields({
        name: streamer.username,
        value: `Last active: ${lastActive}\nDiscord: <@${streamer.discordId}>`,
        inline: true,
      });

      // Send DM to streamer
      try {
        const user = await client.users.fetch(streamer.discordId);
        await user.send(`⚠️  You have been inactive for more than 7 days. Please check in with your streaming activities to maintain your active status!`);
      } catch (err) {
        console.log(`Could not DM streamer ${streamer.username}`);
      }
    }

    await alertsChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error checking inactive streamers:', error);
  }
}

async function checkStreamingSchedules() {
  try {
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const streamers = await Streamer.find({ status: 'active' });

    for (const streamer of streamers) {
      if (!streamer.schedule || streamer.schedule.length === 0) continue;

      for (const scheduleItem of streamer.schedule) {
        if (scheduleItem.day !== currentDay) continue;

        const [scheduleHour, scheduleMinute] = scheduleItem.startTime.split(':').map(Number);
        const scheduleTime = new Date(now);
        scheduleTime.setHours(scheduleHour, scheduleMinute, 0, 0);

        // Check if stream starts in approximately 1 hour (within 5 minutes window)
        const timeDiff = scheduleTime.getTime() - now.getTime();
        if (timeDiff > 55 * 60 * 1000 && timeDiff < 65 * 60 * 1000) {
          // Send reminder
          try {
            const user = await client.users.fetch(streamer.discordId);
            await user.send(
              `⏰ **Stream Reminder!**\n\n` +
              `Your scheduled stream on **${scheduleItem.platform}** is starting in 1 hour!\n` +
              `Scheduled time: ${scheduleItem.startTime} - ${scheduleItem.endTime}\n\n` +
              `Good luck with your stream! 🎮`
            );
          } catch (err) {
            console.log(`Could not send reminder to ${streamer.username}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking streaming schedules:', error);
  }
}

async function generateWeeklyReport() {
  try {
    const streamers = await Streamer.find({ status: 'active' })
      .sort({ 'stats.weeklyVideos': -1, 'stats.weeklyStreamingHours': -1 })
      .limit(10);

    if (streamers.length === 0) return;

    const reportsChannel = client.channels.cache.get(config.channels.reports);
    if (!reportsChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('📊 Weekly Performance Report')
      .setDescription('Top performing streamers this week')
      .setTimestamp();

    // Top 3 streamers
    for (let i = 0; i < Math.min(3, streamers.length); i++) {
      const streamer = streamers[i];
      const medals = ['🥇', '🥈', '🥉'];
      
      embed.addFields({
        name: `${medals[i]} ${streamer.username}`,
        value: `Videos: ${streamer.stats.weeklyVideos}\nStreaming Hours: ${streamer.stats.weeklyStreamingHours.toFixed(1)}h\nRating: ${streamer.rating.overall}/100`,
        inline: true,
      });
    }

    // Overall stats
    const totalVideos = streamers.reduce((sum, s) => sum + s.stats.weeklyVideos, 0);
    const totalHours = streamers.reduce((sum, s) => sum + s.stats.weeklyStreamingHours, 0);

    embed.addFields({
      name: '📈 Overall Stats',
      value: `Total Videos: ${totalVideos}\nTotal Streaming Hours: ${totalHours.toFixed(1)}h\nActive Streamers: ${streamers.length}`,
      inline: false,
    });

    await reportsChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error generating weekly report:', error);
  }
}

async function generateMonthlyReport() {
  try {
    const streamers = await Streamer.find({ status: 'active' })
      .sort({ 'stats.monthlyVideos': -1, 'stats.monthlyStreamingHours': -1 })
      .limit(10);

    if (streamers.length === 0) return;

    const reportsChannel = client.channels.cache.get(config.channels.reports);
    if (!reportsChannel) return;

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📊 Monthly Performance Report')
      .setDescription('Top performing streamers this month')
      .setTimestamp();

    // Top streamers
    for (let i = 0; i < Math.min(5, streamers.length); i++) {
      const streamer = streamers[i];
      
      embed.addFields({
        name: `#${i + 1} ${streamer.username}`,
        value: `Videos: ${streamer.stats.monthlyVideos}\nStreaming Hours: ${streamer.stats.monthlyStreamingHours.toFixed(1)}h\nRating: ${streamer.rating.overall}/100`,
        inline: true,
      });
    }

    await reportsChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error generating monthly report:', error);
  }
}
