import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import StoreItem from '../models/StoreItem.js';
import Purchase from '../models/Purchase.js';
import Streamer from '../models/Streamer.js';
import Transaction from '../models/Transaction.js';

export default {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('Browse and purchase items from the rewards store')
    .addSubcommand(subcommand =>
      subcommand
        .setName('browse')
        .setDescription('Browse available store items')
        .addStringOption(option =>
          option
            .setName('category')
            .setDescription('Filter by category')
            .setRequired(false)
            .addChoices(
              { name: 'Rank Upgrades', value: 'rank_upgrade' },
              { name: 'Video Promotions', value: 'video_promotion' },
              { name: 'Editing Services', value: 'editing_service' },
              { name: 'Design Services', value: 'design_service' },
              { name: 'Gift Cards', value: 'gift_card' },
              { name: 'Physical Rewards', value: 'physical_reward' },
              { name: 'Streaming Tools', value: 'streaming_tool' },
              { name: 'Coaching Sessions', value: 'coaching_session' }
            )))
    .addSubcommand(subcommand =>
      subcommand
        .setName('purchase')
        .setDescription('Purchase an item from the store')
        .addStringOption(option =>
          option
            .setName('item_id')
            .setDescription('Item ID to purchase')
            .setRequired(true))
        .addStringOption(option =>
          option
            .setName('notes')
            .setDescription('Additional notes for your purchase')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('orders')
        .setDescription('View your purchase orders')),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'browse') {
      await browseStore(interaction);
    } else if (subcommand === 'purchase') {
      await purchaseItem(interaction);
    } else if (subcommand === 'orders') {
      await viewOrders(interaction);
    }
  },
};

async function browseStore(interaction) {
  await interaction.deferReply();

  const category = interaction.options.getString('category');

  try {
    const query = { available: true };
    if (category) {
      query.category = category;
    }

    const items = await StoreItem.find(query).sort({ creditCost: 1 }).limit(25);

    if (items.length === 0) {
      return interaction.editReply('🛒 No items available in the store at the moment.');
    }

    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('🛒 Rewards Store')
      .setDescription(category ? `Category: **${category.replace(/_/g, ' ').toUpperCase()}**` : 'Browse all available items')
      .setTimestamp();

    // Group items by category
    const itemsByCategory = {};
    for (const item of items) {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    }

    for (const [cat, catItems] of Object.entries(itemsByCategory)) {
      const itemsList = catItems
        .slice(0, 5)
        .map(item => {
          const stockInfo = item.stock === -1 ? '∞' : item.stock;
          return `${item.iconEmoji || '▸'} **${item.name}** - ${item.creditCost} credits\n   ID: \`${item.itemId}\` | Stock: ${stockInfo}\n   ${item.description.substring(0, 80)}...`;
        })
        .join('\n\n');

      embed.addFields({
        name: `${cat.replace(/_/g, ' ').toUpperCase()}`,
        value: itemsList || 'No items',
        inline: false,
      });
    }

    embed.setFooter({ text: 'Use /store purchase <item_id> to buy an item' });

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error browsing store:', error);
    await interaction.editReply('❌ An error occurred while browsing the store.');
  }
}

async function purchaseItem(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const itemId = interaction.options.getString('item_id');
  const notes = interaction.options.getString('notes') || '';

  try {
    const item = await StoreItem.findOne({ itemId, available: true });

    if (!item) {
      return interaction.editReply('❌ Item not found or not available.');
    }

    // Check stock
    if (item.stock !== -1 && item.stock <= 0) {
      return interaction.editReply('❌ This item is out of stock.');
    }

    const streamer = await Streamer.findOne({ discordId: interaction.user.id });

    if (!streamer) {
      return interaction.editReply('❌ You are not registered as a streamer.');
    }

    // Check if streamer has enough credits
    if (streamer.credit.balance < item.creditCost) {
      return interaction.editReply(`❌ Insufficient credits. You need ${item.creditCost} credits but only have ${streamer.credit.balance} credits.`);
    }

    // Check requirements
    if (item.requirements) {
      if (item.requirements.minRating && streamer.rating.overall < item.requirements.minRating) {
        return interaction.editReply(`❌ You need a minimum rating of ${item.requirements.minRating} to purchase this item.`);
      }
      if (item.requirements.minVideos && streamer.stats.totalVideos < item.requirements.minVideos) {
        return interaction.editReply(`❌ You need at least ${item.requirements.minVideos} videos to purchase this item.`);
      }
      if (item.requirements.minStreamingHours && streamer.stats.totalStreamingHours < item.requirements.minStreamingHours) {
        return interaction.editReply(`❌ You need at least ${item.requirements.minStreamingHours} streaming hours to purchase this item.`);
      }
    }

    // Process purchase
    const purchaseId = `PURCHASE-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const purchase = new Purchase({
      purchaseId,
      userId: streamer.discordId,
      username: streamer.username,
      itemId: item.itemId,
      itemName: item.name,
      itemCategory: item.category,
      creditCost: item.creditCost,
      userNotes: notes,
    });

    await purchase.save();

    // Deduct credits
    streamer.credit.balance -= item.creditCost;
    streamer.credit.totalSpent += item.creditCost;
    await streamer.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `PURCHASE-${purchaseId}`,
      userId: streamer.discordId,
      username: streamer.username,
      type: 'spend_purchase',
      amount: -item.creditCost,
      balanceAfter: streamer.credit.balance,
      description: `Purchased: ${item.name}`,
      relatedTo: {
        type: 'purchase',
        id: purchaseId,
        details: {
          itemName: item.name,
          itemCategory: item.category,
        },
      },
    });

    await transaction.save();

    // Update stock if not unlimited
    if (item.stock !== -1) {
      item.stock -= 1;
      await item.save();
    }

    const embed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Purchase Successful!')
      .setDescription(`You have successfully purchased **${item.name}**`)
      .addFields(
        { name: 'Purchase ID', value: purchaseId, inline: true },
        { name: 'Cost', value: `${item.creditCost} credits`, inline: true },
        { name: 'New Balance', value: `${streamer.credit.balance} credits`, inline: true },
        { name: 'Item Description', value: item.description, inline: false }
      )
      .setFooter({ text: 'Your order is being processed. You will be notified when ready.' })
      .setTimestamp();

    if (notes) {
      embed.addFields({ name: 'Your Notes', value: notes, inline: false });
    }

    await interaction.editReply({ embeds: [embed] });

    // Notify staff (you can add this to a specific channel)
    // This is a placeholder for notification logic
  } catch (error) {
    console.error('Error purchasing item:', error);
    await interaction.editReply('❌ An error occurred while processing your purchase.');
  }
}

async function viewOrders(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const purchases = await Purchase.find({ userId: interaction.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    if (purchases.length === 0) {
      return interaction.editReply('📭 You have no purchase orders.');
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('📦 Your Purchase Orders')
      .setDescription(`Showing ${purchases.length} order(s)`)
      .setTimestamp();

    for (const purchase of purchases) {
      const statusEmoji = {
        pending: '⏳',
        processing: '🔄',
        completed: '✅',
        cancelled: '❌',
        refunded: '💸',
      }[purchase.status] || '❓';

      embed.addFields({
        name: `${statusEmoji} ${purchase.purchaseId}`,
        value: `**Item:** ${purchase.itemName}\n**Cost:** ${purchase.creditCost} credits\n**Status:** ${purchase.status.toUpperCase()}\n**Date:** ${purchase.createdAt.toLocaleDateString()}`,
        inline: false,
      });
    }

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Error viewing orders:', error);
    await interaction.editReply('❌ An error occurred while fetching your orders.');
  }
}
