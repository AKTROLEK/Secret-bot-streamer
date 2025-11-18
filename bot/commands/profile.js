import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Streamer from '../models/Streamer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View streamer profile')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to view profile for (defaults to yourself)')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const targetUser = interaction.options.getUser('user') || interaction.user;

    try {
      const streamer = await Streamer.findOne({ discordId: targetUser.id });

      if (!streamer) {
        return interaction.editReply(`❌ ${targetUser.username} is not registered as a streamer.`);
      }

      // Build platform list
      const platforms = [];
      if (streamer.platforms.youtube.enabled) {
        platforms.push(`▸ YouTube: [${streamer.platforms.youtube.channelUrl || 'Not linked'}](${streamer.platforms.youtube.channelUrl || '#'})`);
      }
      if (streamer.platforms.twitch.enabled) {
        platforms.push(`▸ Twitch: [${streamer.platforms.twitch.username || 'Not linked'}](${streamer.platforms.twitch.channelUrl || '#'})`);
      }
      if (streamer.platforms.tiktok.enabled) {
        platforms.push(`▸ TikTok: [${streamer.platforms.tiktok.username || 'Not linked'}](${streamer.platforms.tiktok.profileUrl || '#'})`);
      }
      if (streamer.platforms.kick.enabled) {
        platforms.push(`▸ Kick: [${streamer.platforms.kick.username || 'Not linked'}](${streamer.platforms.kick.channelUrl || '#'})`);
      }
      if (streamer.platforms.instagram.enabled) {
        platforms.push(`▸ Instagram: [${streamer.platforms.instagram.username || 'Not linked'}](${streamer.platforms.instagram.profileUrl || '#'})`);
      }
      if (streamer.platforms.facebook.enabled) {
        platforms.push(`▸ Facebook: [${streamer.platforms.facebook.pageUrl || 'Not linked'}](${streamer.platforms.facebook.pageUrl || '#'})`);
      }

      const platformsText = platforms.length > 0 ? platforms.join('\n') : 'No platforms linked';

      // Create embed
      const embed = new EmbedBuilder()
        .setColor(streamer.status === 'active' ? '#00ff00' : '#ff0000')
        .setTitle(`📊 Streamer Profile: ${streamer.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '📌 Status', value: streamer.status.toUpperCase(), inline: true },
          { name: '💰 Credit Balance', value: `${streamer.credit.balance.toLocaleString()} credits`, inline: true },
          { name: '🏦 Savings', value: `${streamer.credit.savings.toLocaleString()} credits`, inline: true },
          { name: '\u200B', value: '\u200B' }, // Spacer
          { name: '📺 Total Videos', value: streamer.stats.totalVideos.toString(), inline: true },
          { name: '🎬 Total Streams', value: streamer.stats.totalStreams.toString(), inline: true },
          { name: '⏱️ Streaming Hours', value: `${streamer.stats.totalStreamingHours.toFixed(1)}h`, inline: true },
          { name: '\u200B', value: '\u200B' }, // Spacer
          { name: '⭐ Overall Rating', value: `${streamer.rating.overall}/100`, inline: true },
          { name: '🎯 Consistency', value: `${streamer.rating.consistency}/100`, inline: true },
          { name: '📈 Engagement', value: `${streamer.rating.engagement}/100`, inline: true },
          { name: '\u200B', value: '\u200B' }, // Spacer
          { name: '🌐 Platforms', value: platformsText, inline: false }
        )
        .setFooter({ text: `Joined: ${streamer.createdAt.toLocaleDateString()}` })
        .setTimestamp();

      // Add achievements if any
      if (streamer.achievements && streamer.achievements.length > 0) {
        const achievementsList = streamer.achievements
          .slice(0, 5)
          .map(a => `🏆 ${a.name}`)
          .join('\n');
        embed.addFields({ name: '🏆 Recent Achievements', value: achievementsList, inline: false });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching profile:', error);
      await interaction.editReply('❌ An error occurred while fetching the profile.');
    }
  },
};
