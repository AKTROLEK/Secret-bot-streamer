import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Get help and information about available commands')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('Get help for a specific category')
        .setRequired(false)
        .addChoices(
          { name: 'General', value: 'general' },
          { name: 'Credits', value: 'credits' },
          { name: 'Store', value: 'store' },
          { name: 'Tickets', value: 'tickets' },
          { name: 'Admin', value: 'admin' }
        )),

  async execute(interaction) {
    await interaction.deferReply();

    const category = interaction.options.getString('category');

    if (!category) {
      // General help
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🎮 Streamer Management Bot - Help')
        .setDescription('Welcome to the Streamer Management System! Here are the available command categories:')
        .addFields(
          { 
            name: '📋 General Commands', 
            value: '`/help category:General` - Profile and registration commands', 
            inline: false 
          },
          { 
            name: '💰 Credit Commands', 
            value: '`/help category:Credits` - Manage your credits and transactions', 
            inline: false 
          },
          { 
            name: '🛒 Store Commands', 
            value: '`/help category:Store` - Browse and purchase rewards', 
            inline: false 
          },
          { 
            name: '🎫 Ticket Commands', 
            value: '`/help category:Tickets` - Create and manage support tickets', 
            inline: false 
          },
          { 
            name: '⚙️ Admin Commands', 
            value: '`/help category:Admin` - Management and admin tools', 
            inline: false 
          }
        )
        .setFooter({ text: 'Use /help category:<name> for detailed information' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    // Category-specific help
    const helpEmbeds = {
      general: new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📋 General Commands')
        .addFields(
          { 
            name: '/register <platform> <channel_url>', 
            value: 'Register as a new streamer\n**Example:** `/register platform:YouTube channel_url:youtube.com/c/yourchannel`', 
            inline: false 
          },
          { 
            name: '/profile [user]', 
            value: 'View streamer profile and stats\n**Example:** `/profile` or `/profile @user`', 
            inline: false 
          }
        ),

      credits: new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('💰 Credit Commands')
        .addFields(
          { 
            name: '/credit balance', 
            value: 'Check your current credit balance and totals', 
            inline: false 
          },
          { 
            name: '/credit history [limit]', 
            value: 'View your transaction history\n**Example:** `/credit history` or `/credit history limit:20`', 
            inline: false 
          },
          { 
            name: '/credit transfer <recipient> <amount>', 
            value: 'Transfer credits to another streamer\n**Example:** `/credit transfer @user amount:100`', 
            inline: false 
          }
        ),

      store: new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('🛒 Store Commands')
        .addFields(
          { 
            name: '/store browse [category]', 
            value: 'Browse available items in the rewards store\n**Example:** `/store browse` or `/store browse category:Video Promotions`', 
            inline: false 
          },
          { 
            name: '/store purchase <item_id> [notes]', 
            value: 'Purchase an item from the store\n**Example:** `/store purchase item_id:ITEM-001`', 
            inline: false 
          },
          { 
            name: '/store orders', 
            value: 'View your purchase order history', 
            inline: false 
          }
        ),

      tickets: new EmbedBuilder()
        .setColor('#ffcc00')
        .setTitle('🎫 Ticket Commands')
        .addFields(
          { 
            name: '/ticket create <type> <subject> [description]', 
            value: 'Create a new support ticket\n**Example:** `/ticket create type:Issue subject:"Bug Report"`', 
            inline: false 
          },
          { 
            name: '/ticket close <ticket_id>', 
            value: 'Close an existing ticket\n**Example:** `/ticket close ticket_id:TICKET-12345`', 
            inline: false 
          },
          { 
            name: '/ticket list [status]', 
            value: 'List your tickets\n**Example:** `/ticket list` or `/ticket list status:Open`', 
            inline: false 
          }
        ),

      admin: new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('⚙️ Admin Commands')
        .setDescription('**Note:** These commands require administrator permissions')
        .addFields(
          { 
            name: '/credit add <user> <amount> <reason>', 
            value: 'Add credits to a streamer\'s account\n**Example:** `/credit add @user amount:500 reason:"Bonus reward"`', 
            inline: false 
          },
          { 
            name: '/credit deduct <user> <amount> <reason>', 
            value: 'Deduct credits from a streamer\'s account\n**Example:** `/credit deduct @user amount:100 reason:"Adjustment"`', 
            inline: false 
          }
        ),
    };

    const embed = helpEmbeds[category];
    if (embed) {
      embed.setFooter({ text: 'For more information, check the documentation' });
      embed.setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply('❌ Invalid category selected.');
    }
  },
};
