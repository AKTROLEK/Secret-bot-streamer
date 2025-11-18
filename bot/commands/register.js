import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Streamer from '../models/Streamer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register as a streamer')
    .addStringOption(option =>
      option
        .setName('platform')
        .setDescription('Primary streaming platform')
        .setRequired(true)
        .addChoices(
          { name: 'YouTube', value: 'youtube' },
          { name: 'Twitch', value: 'twitch' },
          { name: 'TikTok', value: 'tiktok' },
          { name: 'Kick', value: 'kick' },
          { name: 'Instagram', value: 'instagram' },
          { name: 'Facebook Gaming', value: 'facebook' }
        ))
    .addStringOption(option =>
      option
        .setName('channel_url')
        .setDescription('Your channel/profile URL')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if user is already registered
      const existingStreamer = await Streamer.findOne({ discordId: interaction.user.id });

      if (existingStreamer) {
        return interaction.editReply('❌ You are already registered as a streamer!');
      }

      const platform = interaction.options.getString('platform');
      const channelUrl = interaction.options.getString('channel_url');

      // Create new streamer
      const streamer = new Streamer({
        discordId: interaction.user.id,
        username: interaction.user.username,
        status: 'pending',
        platforms: {
          [platform]: {
            channelUrl: channelUrl,
            enabled: true,
          },
        },
        credit: {
          balance: 50, // Welcome bonus
          totalEarned: 50,
        },
      });

      await streamer.save();

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Registration Successful!')
        .setDescription('Welcome to the Streamer Management System!')
        .addFields(
          { name: 'Status', value: 'Pending Review', inline: true },
          { name: 'Platform', value: platform.toUpperCase(), inline: true },
          { name: 'Welcome Bonus', value: '50 credits', inline: true },
          { name: 'Next Steps', value: 'Your application is being reviewed by our team. You will be notified once approved!', inline: false }
        )
        .setFooter({ text: 'Use /profile to view your streamer profile' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Notify staff (if configured)
      // Add notification logic here

    } catch (error) {
      console.error('Error registering streamer:', error);
      await interaction.editReply('❌ An error occurred during registration. Please try again later.');
    }
  },
};
