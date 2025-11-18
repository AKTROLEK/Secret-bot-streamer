export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`👥 Serving ${client.users.cache.size} user(s)`);
    
    // Set bot presence
    client.user.setPresence({
      activities: [{ name: 'Streamers | /help', type: 3 }], // Type 3 = Watching
      status: 'online',
    });
  },
};
