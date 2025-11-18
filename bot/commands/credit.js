import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Streamer from '../models/Streamer.js';
import Transaction from '../models/Transaction.js';
import config from '../../config/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('credit')
    .setDescription('Manage streamer credits')
    .addSubcommand(subcommand =>
      subcommand
        .setName('balance')
        .setDescription('Check your credit balance'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('history')
        .setDescription('View your transaction history')
        .addIntegerOption(option =>
          option
            .setName('limit')
            .setDescription('Number of transactions to show (default: 10)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('transfer')
        .setDescription('Transfer credits to another streamer')
        .addUserOption(option =>
          option
            .setName('recipient')
            .setDescription('User to transfer credits to')
            .setRequired(true))
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Amount of credits to transfer')
            .setRequired(true)
            .setMinValue(1)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add credits to a streamer (Admin only)')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User to add credits to')
            .setRequired(true))
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Amount of credits to add')
            .setRequired(true)
            .setMinValue(1))
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for adding credits')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator))
    .addSubcommand(subcommand =>
      subcommand
        .setName('deduct')
        .setDescription('Deduct credits from a streamer (Admin only)')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('User to deduct credits from')
            .setRequired(true))
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Amount of credits to deduct')
            .setRequired(true)
            .setMinValue(1))
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason for deducting credits')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'balance') {
      await checkBalance(interaction);
    } else if (subcommand === 'history') {
      await viewHistory(interaction);
    } else if (subcommand === 'transfer') {
      await transferCredits(interaction);
    } else if (subcommand === 'add') {
      await addCredits(interaction);
    } else if (subcommand === 'deduct') {
      await deductCredits(interaction);
    }
  },
};

async function checkBalance(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const streamer = await Streamer.findOne({ discordId: interaction.user.id });

    if (!streamer) {
      return interaction.editReply('❌ You are not registered as a streamer.');
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('💰 Credit Balance')
      .addFields(
        { name: 'Available Balance', value: `${streamer.credit.balance.toLocaleString()} credits`, inline: true },
        { name: 'Savings', value: `${streamer.credit.savings.toLocaleString()} credits`, inline: true },
        { name: '\u200B', value: '\u200B' },
        { name: 'Total Earned', value: `${streamer.credit.totalEarned.toLocaleString()} credits`, inline: true },
        { name: 'Total Spent', value: `${streamer.credit.totalSpent.toLocaleString()} credits`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error checking balance:', error);
    await interaction.editReply('❌ An error occurred while checking your balance.');
  }
}

async function viewHistory(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const limit = interaction.options.getInteger('limit') || 10;

  try {
    const transactions = await Transaction.find({ userId: interaction.user.id })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 25));

    if (transactions.length === 0) {
      return interaction.editReply('📭 No transaction history found.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📜 Transaction History')
      .setDescription(`Showing last ${transactions.length} transaction(s)`)
      .setTimestamp();

    for (const tx of transactions) {
      const emoji = tx.amount > 0 ? '➕' : '➖';
      const typeDisplay = tx.type.replace(/_/g, ' ').toUpperCase();
      
      embed.addFields({
        name: `${emoji} ${typeDisplay}`,
        value: `**Amount:** ${tx.amount > 0 ? '+' : ''}${tx.amount} credits\n**Balance After:** ${tx.balanceAfter} credits\n**Date:** ${tx.createdAt.toLocaleString()}\n${tx.description ? `**Note:** ${tx.description}` : ''}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error viewing history:', error);
    await interaction.editReply('❌ An error occurred while fetching transaction history.');
  }
}

async function transferCredits(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const recipient = interaction.options.getUser('recipient');
  const amount = interaction.options.getInteger('amount');

  if (recipient.id === interaction.user.id) {
    return interaction.editReply('❌ You cannot transfer credits to yourself.');
  }

  try {
    const sender = await Streamer.findOne({ discordId: interaction.user.id });
    const receiver = await Streamer.findOne({ discordId: recipient.id });

    if (!sender) {
      return interaction.editReply('❌ You are not registered as a streamer.');
    }

    if (!receiver) {
      return interaction.editReply('❌ The recipient is not registered as a streamer.');
    }

    if (sender.credit.balance < amount) {
      return interaction.editReply(`❌ Insufficient credits. You have ${sender.credit.balance} credits available.`);
    }

    // Deduct from sender
    sender.credit.balance -= amount;
    await sender.save();

    // Add to receiver
    receiver.credit.balance += amount;
    receiver.credit.totalEarned += amount;
    await receiver.save();

    // Create transaction records
    const transactionIdBase = `TRANSFER-${Date.now()}`;
    
    const senderTx = new Transaction({
      transactionId: `${transactionIdBase}-SEND`,
      userId: sender.discordId,
      username: sender.username,
      type: 'transfer_send',
      amount: -amount,
      balanceAfter: sender.credit.balance,
      description: `Transfer to ${receiver.username}`,
      transferTo: {
        userId: receiver.discordId,
        username: receiver.username,
      },
    });

    const receiverTx = new Transaction({
      transactionId: `${transactionIdBase}-RECEIVE`,
      userId: receiver.discordId,
      username: receiver.username,
      type: 'transfer_receive',
      amount: amount,
      balanceAfter: receiver.credit.balance,
      description: `Transfer from ${sender.username}`,
      transferFrom: {
        userId: sender.discordId,
        username: sender.username,
      },
    });

    await senderTx.save();
    await receiverTx.save();

    await interaction.editReply(`✅ Successfully transferred ${amount} credits to ${recipient.username}. Your new balance: ${sender.credit.balance} credits.`);
  } catch (error) {
    console.error('Error transferring credits:', error);
    await interaction.editReply('❌ An error occurred while transferring credits.');
  }
}

async function addCredits(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const targetUser = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('amount');
  const reason = interaction.options.getString('reason');

  try {
    const streamer = await Streamer.findOne({ discordId: targetUser.id });

    if (!streamer) {
      return interaction.editReply('❌ User is not registered as a streamer.');
    }

    streamer.credit.balance += amount;
    streamer.credit.totalEarned += amount;
    await streamer.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `ADMIN-ADD-${Date.now()}`,
      userId: streamer.discordId,
      username: streamer.username,
      type: 'admin_add',
      amount: amount,
      balanceAfter: streamer.credit.balance,
      description: reason,
      adminAction: {
        adminId: interaction.user.id,
        adminUsername: interaction.user.username,
        reason: reason,
      },
    });

    await transaction.save();

    await interaction.editReply(`✅ Added ${amount} credits to ${targetUser.username}. New balance: ${streamer.credit.balance} credits.`);

    // Send notification to user
    try {
      await targetUser.send(`💰 You have received ${amount} credits from management.\n**Reason:** ${reason}\n**New Balance:** ${streamer.credit.balance} credits`);
    } catch (err) {
      console.log('Could not DM user about credit addition');
    }
  } catch (error) {
    console.error('Error adding credits:', error);
    await interaction.editReply('❌ An error occurred while adding credits.');
  }
}

async function deductCredits(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const targetUser = interaction.options.getUser('user');
  const amount = interaction.options.getInteger('amount');
  const reason = interaction.options.getString('reason');

  try {
    const streamer = await Streamer.findOne({ discordId: targetUser.id });

    if (!streamer) {
      return interaction.editReply('❌ User is not registered as a streamer.');
    }

    if (streamer.credit.balance < amount) {
      return interaction.editReply(`⚠️  User only has ${streamer.credit.balance} credits. Proceeding will result in negative balance.`);
    }

    streamer.credit.balance -= amount;
    streamer.credit.totalSpent += amount;
    await streamer.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `ADMIN-DEDUCT-${Date.now()}`,
      userId: streamer.discordId,
      username: streamer.username,
      type: 'admin_deduct',
      amount: -amount,
      balanceAfter: streamer.credit.balance,
      description: reason,
      adminAction: {
        adminId: interaction.user.id,
        adminUsername: interaction.user.username,
        reason: reason,
      },
    });

    await transaction.save();

    await interaction.editReply(`✅ Deducted ${amount} credits from ${targetUser.username}. New balance: ${streamer.credit.balance} credits.`);

    // Send notification to user
    try {
      await targetUser.send(`⚠️  ${amount} credits have been deducted from your account by management.\n**Reason:** ${reason}\n**New Balance:** ${streamer.credit.balance} credits`);
    } catch (err) {
      console.log('Could not DM user about credit deduction');
    }
  } catch (error) {
    console.error('Error deducting credits:', error);
    await interaction.editReply('❌ An error occurred while deducting credits.');
  }
}
