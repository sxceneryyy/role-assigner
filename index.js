require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

const GUEST_ROLE_NAME = 'guest';

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  const role = member.guild.roles.cache.find(r => r.name === GUEST_ROLE_NAME);

  if (!role) {
    console.log('❌ Guest role not found! Make sure it is spelled correctly in your server.');
    return;
  }

  try {
    await member.roles.add(role);
    console.log(`✅ Assigned guest role to ${member.user.tag}`);
  } catch (error) {
    console.log(`❌ Couldn't assign role: ${error}`);
  }
});

client.login(process.env.TOKEN);