import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } from 'discord.js';
import Ticket from '../models/Ticket.js';
import config from '../../config/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage support tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new support ticket')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Type of ticket')
            .setRequired(true)
            .addChoices(
              { name: '📝 Application', value: 'application' },
              { name: '🐛 Issue Report', value: 'issue' },
              { name: '💰 Credit Adjustment', value: 'credit_adjustment' },
              { name: '📢 Promotion Request', value: 'promotion_request' },
              { name: '🔧 Technical Support', value: 'technical_support' },
              { name: '❓ General', value: 'general' }
            ))
        .addStringOption(option =>
          option
            .setName('subject')
            .setDescription('Brief subject of your ticket')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('description')
            .setDescription('Detailed description of your request/issue')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close your ticket')
        .addStringOption(option =>
          option
            .setName('ticket_id')
            .setDescription('Ticket ID to close')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List your tickets')
        .addStringOption(option =>
          option
            .setName('status')
            .setDescription('Filter by status')
            .setRequired(false)
            .addChoices(
              { name: 'Open', value: 'open' },
              { name: 'In Progress', value: 'in_progress' },
              { name: 'Resolved', value: 'resolved' },
              { name: 'Closed', value: 'closed' }
            ))),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await createTicket(interaction);
    } else if (subcommand === 'close') {
      await closeTicket(interaction);
    } else if (subcommand === 'list') {
      await listTickets(interaction);
    }
  },
};

async function createTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const type = interaction.options.getString('type');
  const subject = interaction.options.getString('subject');
  const description = interaction.options.getString('description') || 'No description provided';

  try {
    // Generate ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create ticket channel
    const guild = interaction.guild;
    const ticketChannel = await guild.channels.create({
      name: `ticket-${ticketId.toLowerCase()}`,
      type: 0, // Text channel
      parent: config.channels.ticketCategory || null,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        // Add staff roles
        ...(config.roles.socialMediaManager ? [{
          id: config.roles.socialMediaManager,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        }] : []),
        ...(config.roles.socialTeam ? [{
          id: config.roles.socialTeam,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        }] : []),
        ...(config.roles.streamerManagement ? [{
          id: config.roles.streamerManagement,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        }] : []),
      ],
    });

    // Create ticket in database
    const ticket = new Ticket({
      ticketId,
      channelId: ticketChannel.id,
      userId: interaction.user.id,
      username: interaction.user.username,
      type,
      subject,
      description,
      messages: [{
        userId: interaction.user.id,
        username: interaction.user.username,
        content: description,
        timestamp: new Date(),
        isStaff: false,
      }],
    });

    await ticket.save();

    // Send ticket information to channel
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`🎫 Ticket: ${ticketId}`)
      .setDescription(`**Type:** ${type.replace(/_/g, ' ').toUpperCase()}\n**Subject:** ${subject}`)
      .addFields(
        { name: 'Description', value: description },
        { name: 'Created by', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Status', value: '🟢 Open', inline: true }
      )
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_close')
          .setLabel('Close Ticket')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔒'),
        new ButtonBuilder()
          .setCustomId('ticket_claim')
          .setLabel('Claim Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👋')
      );

    await ticketChannel.send({ embeds: [embed], components: [row] });

    await interaction.editReply({
      content: `✅ Ticket created successfully! Please check <#${ticketChannel.id}>`,
    });

    // Log to alerts channel
    if (config.channels.alerts) {
      const alertChannel = guild.channels.cache.get(config.channels.alerts);
      if (alertChannel) {
        const alertEmbed = new EmbedBuilder()
          .setColor('#ffcc00')
          .setTitle('🆕 New Ticket Created')
          .setDescription(`**Ticket ID:** ${ticketId}\n**Type:** ${type}\n**Channel:** <#${ticketChannel.id}>`)
          .addFields(
            { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
            { name: 'Subject', value: subject, inline: true }
          )
          .setTimestamp();

        await alertChannel.send({ embeds: [alertEmbed] });
      }
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
    await interaction.editReply({
      content: '❌ An error occurred while creating the ticket. Please try again later.',
    });
  }
}

async function closeTicket(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const ticketId = interaction.options.getString('ticket_id');

  try {
    const ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
      return interaction.editReply('❌ Ticket not found.');
    }

    // Check if user owns the ticket or is staff
    const isOwner = ticket.userId === interaction.user.id;
    const isStaff = interaction.member.roles.cache.has(config.roles.socialMediaManager) ||
                    interaction.member.roles.cache.has(config.roles.socialTeam) ||
                    interaction.member.roles.cache.has(config.roles.streamerManagement);

    if (!isOwner && !isStaff) {
      return interaction.editReply('❌ You do not have permission to close this ticket.');
    }

    ticket.status = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    // Delete channel
    const channel = interaction.guild.channels.cache.get(ticket.channelId);
    if (channel) {
      await channel.delete();
    }

    await interaction.editReply('✅ Ticket closed successfully.');
  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.editReply('❌ An error occurred while closing the ticket.');
  }
}

async function listTickets(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const statusFilter = interaction.options.getString('status');

  try {
    const query = { userId: interaction.user.id };
    if (statusFilter) {
      query.status = statusFilter;
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(10);

    if (tickets.length === 0) {
      return interaction.editReply('📭 You have no tickets.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📋 Your Tickets')
      .setDescription(`Showing ${tickets.length} ticket(s)`)
      .setTimestamp();

    for (const ticket of tickets) {
      const statusEmoji = {
        open: '🟢',
        in_progress: '🟡',
        waiting: '🟠',
        resolved: '✅',
        closed: '🔒',
      }[ticket.status] || '❓';

      embed.addFields({
        name: `${statusEmoji} ${ticket.ticketId}`,
        value: `**Type:** ${ticket.type}\n**Subject:** ${ticket.subject}\n**Status:** ${ticket.status}\n**Created:** ${ticket.createdAt.toLocaleDateString()}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error listing tickets:', error);
    await interaction.editReply('❌ An error occurred while fetching tickets.');
  }
}
