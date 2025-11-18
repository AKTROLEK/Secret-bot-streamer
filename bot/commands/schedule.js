import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Streamer from '../models/Streamer.js';

export default {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Manage your streaming schedule')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a scheduled stream')
        .addStringOption(option =>
          option
            .setName('day')
            .setDescription('Day of the week')
            .setRequired(true)
            .addChoices(
              { name: 'Monday', value: 'monday' },
              { name: 'Tuesday', value: 'tuesday' },
              { name: 'Wednesday', value: 'wednesday' },
              { name: 'Thursday', value: 'thursday' },
              { name: 'Friday', value: 'friday' },
              { name: 'Saturday', value: 'saturday' },
              { name: 'Sunday', value: 'sunday' }
            ))
        .addStringOption(option =>
          option
            .setName('start_time')
            .setDescription('Start time (HH:MM format, e.g., 14:30)')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('end_time')
            .setDescription('End time (HH:MM format, e.g., 16:30)')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('platform')
            .setDescription('Streaming platform')
            .setRequired(true)
            .addChoices(
              { name: 'YouTube', value: 'youtube' },
              { name: 'Twitch', value: 'twitch' },
              { name: 'TikTok', value: 'tiktok' },
              { name: 'Kick', value: 'kick' },
              { name: 'Instagram', value: 'instagram' },
              { name: 'Facebook Gaming', value: 'facebook' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('View your streaming schedule'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('Clear your entire schedule')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') {
      await addSchedule(interaction);
    } else if (subcommand === 'view') {
      await viewSchedule(interaction);
    } else if (subcommand === 'clear') {
      await clearSchedule(interaction);
    }
  },
};

async function addSchedule(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const day = interaction.options.getString('day');
  const startTime = interaction.options.getString('start_time');
  const endTime = interaction.options.getString('end_time');
  const platform = interaction.options.getString('platform');

  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return interaction.editReply('❌ Invalid time format. Please use HH:MM format (e.g., 14:30)');
  }

  try {
    const streamer = await Streamer.findOne({ discordId: interaction.user.id });

    if (!streamer) {
      return interaction.editReply('❌ You are not registered as a streamer.');
    }

    // Check if schedule already exists for this day
    const existingIndex = streamer.schedule.findIndex(s => s.day === day && s.platform === platform);
    
    if (existingIndex >= 0) {
      // Update existing schedule
      streamer.schedule[existingIndex].startTime = startTime;
      streamer.schedule[existingIndex].endTime = endTime;
    } else {
      // Add new schedule
      streamer.schedule.push({
        day,
        startTime,
        endTime,
        platform,
      });
    }

    await streamer.save();

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Schedule Updated')
      .setDescription('Your streaming schedule has been updated successfully!')
      .addFields(
        { name: 'Day', value: day.charAt(0).toUpperCase() + day.slice(1), inline: true },
        { name: 'Time', value: `${startTime} - ${endTime}`, inline: true },
        { name: 'Platform', value: platform.toUpperCase(), inline: true }
      )
      .setFooter({ text: 'You will receive reminders 1 hour before your scheduled streams' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error adding schedule:', error);
    await interaction.editReply('❌ An error occurred while adding the schedule.');
  }
}

async function viewSchedule(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const streamer = await Streamer.findOne({ discordId: interaction.user.id });

    if (!streamer) {
      return interaction.editReply('❌ You are not registered as a streamer.');
    }

    if (!streamer.schedule || streamer.schedule.length === 0) {
      return interaction.editReply('📅 You have no scheduled streams. Use `/schedule add` to create one!');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📅 Your Streaming Schedule')
      .setDescription('Here are your scheduled streams for the week')
      .setTimestamp();

    // Group by day
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const scheduleByDay = {};

    for (const schedule of streamer.schedule) {
      if (!scheduleByDay[schedule.day]) {
        scheduleByDay[schedule.day] = [];
      }
      scheduleByDay[schedule.day].push(schedule);
    }

    for (const day of dayOrder) {
      if (scheduleByDay[day]) {
        const streams = scheduleByDay[day]
          .map(s => `${s.platform.toUpperCase()}: ${s.startTime} - ${s.endTime}`)
          .join('\n');

        embed.addFields({
          name: day.charAt(0).toUpperCase() + day.slice(1),
          value: streams,
          inline: false,
        });
      }
    }

    embed.setFooter({ text: 'Use /schedule add to add more streams or /schedule clear to reset' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error viewing schedule:', error);
    await interaction.editReply('❌ An error occurred while fetching your schedule.');
  }
}

async function clearSchedule(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const streamer = await Streamer.findOne({ discordId: interaction.user.id });

    if (!streamer) {
      return interaction.editReply('❌ You are not registered as a streamer.');
    }

    streamer.schedule = [];
    await streamer.save();

    await interaction.editReply('✅ Your streaming schedule has been cleared.');
  } catch (error) {
    console.error('Error clearing schedule:', error);
    await interaction.editReply('❌ An error occurred while clearing your schedule.');
  }
}
