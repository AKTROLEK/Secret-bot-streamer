import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Streamer from '../models/Streamer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the top streamers')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Leaderboard category')
        .setRequired(false)
        .addChoices(
          { name: 'Overall Rating', value: 'rating' },
          { name: 'Total Videos', value: 'videos' },
          { name: 'Streaming Hours', value: 'hours' },
          { name: 'Credits Earned', value: 'credits' }
        ))
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Number of top streamers to show (default: 10)')
        .setMinValue(3)
        .setMaxValue(25)
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const category = interaction.options.getString('category') || 'rating';
    const limit = interaction.options.getInteger('limit') || 10;

    try {
      let sortField = {};
      let titleCategory = '';
      let valueField = '';

      switch (category) {
        case 'rating':
          sortField = { 'rating.overall': -1 };
          titleCategory = 'Overall Rating';
          valueField = (s) => `${s.rating.overall}/100`;
          break;
        case 'videos':
          sortField = { 'stats.totalVideos': -1 };
          titleCategory = 'Total Videos';
          valueField = (s) => `${s.stats.totalVideos} videos`;
          break;
        case 'hours':
          sortField = { 'stats.totalStreamingHours': -1 };
          titleCategory = 'Streaming Hours';
          valueField = (s) => `${s.stats.totalStreamingHours.toFixed(1)} hours`;
          break;
        case 'credits':
          sortField = { 'credit.totalEarned': -1 };
          titleCategory = 'Credits Earned';
          valueField = (s) => `${s.credit.totalEarned.toLocaleString()} credits`;
          break;
      }

      const streamers = await Streamer.find({ status: 'active' })
        .sort(sortField)
        .limit(limit);

      if (streamers.length === 0) {
        return interaction.editReply('📭 No active streamers found.');
      }

      const embed = new EmbedBuilder()
        .setColor('#ffd700')
        .setTitle(`🏆 Leaderboard - ${titleCategory}`)
        .setDescription(`Top ${streamers.length} streamers`)
        .setTimestamp();

      const medals = ['🥇', '🥈', '🥉'];

      for (let i = 0; i < streamers.length; i++) {
        const streamer = streamers[i];
        const medal = i < 3 ? medals[i] : `#${i + 1}`;
        
        embed.addFields({
          name: `${medal} ${streamer.username}`,
          value: valueField(streamer),
          inline: true,
        });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      await interaction.editReply('❌ An error occurred while fetching the leaderboard.');
    }
  },
};
