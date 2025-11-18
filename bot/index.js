import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
  ],
});

// Collections
client.commands = new Collection();

// Connect to Database
async function connectDatabase() {
  try {
    if (config.database.mongoUri) {
      await mongoose.connect(config.database.mongoUri);
      console.log('✅ Connected to MongoDB');
    } else {
      console.log('⚠️  No database URI configured. Using in-memory storage (not recommended for production)');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

// Load Commands
async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  
  if (!fs.existsSync(commandsPath)) {
    console.log('⚠️  No commands directory found');
    return;
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    
    if ('data' in command.default && 'execute' in command.default) {
      client.commands.set(command.default.data.name, command.default);
      console.log(`✅ Loaded command: ${command.default.data.name}`);
    } else {
      console.log(`⚠️  Command at ${filePath} is missing required "data" or "execute" property`);
    }
  }
}

// Load Events
async function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  
  if (!fs.existsSync(eventsPath)) {
    console.log('⚠️  No events directory found');
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = await import(`file://${filePath}`);
    
    if (event.default.once) {
      client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
      client.on(event.default.name, (...args) => event.default.execute(...args));
    }
    console.log(`✅ Loaded event: ${event.default.name}`);
  }
}

// Register Commands with Discord
async function registerCommands() {
  const commands = [];
  
  for (const [name, command] of client.commands) {
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '10' }).setToken(config.discord.token);

  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: commands },
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }
}

// Initialize Services
async function initializeServices() {
  const servicesPath = path.join(__dirname, 'services');
  
  if (!fs.existsSync(servicesPath)) {
    console.log('⚠️  No services directory found');
    return;
  }

  const serviceFiles = fs.readdirSync(servicesPath).filter(file => file.endsWith('.js'));

  for (const file of serviceFiles) {
    const filePath = path.join(servicesPath, file);
    const service = await import(`file://${filePath}`);
    
    if ('initialize' in service.default) {
      await service.default.initialize(client);
      console.log(`✅ Initialized service: ${file}`);
    }
  }
}

// Main initialization
async function main() {
  console.log('🚀 Starting Streamer Management Bot...');
  
  // Check required configuration
  if (!config.discord.token) {
    console.error('❌ DISCORD_TOKEN is not set in environment variables');
    process.exit(1);
  }

  // Connect to database
  await connectDatabase();

  // Load commands and events
  await loadCommands();
  await loadEvents();

  // Login to Discord
  await client.login(config.discord.token);

  // Wait for client to be ready
  client.once('ready', async () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    
    // Register commands
    if (config.discord.clientId && config.discord.guildId) {
      await registerCommands();
    } else {
      console.log('⚠️  CLIENT_ID or GUILD_ID not set - commands will not be registered');
    }

    // Initialize services
    await initializeServices();

    console.log('✅ Bot is fully operational!');
  });
}

// Error handling
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Start the bot
main().catch(console.error);

export default client;
