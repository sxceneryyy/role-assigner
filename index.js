require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User]
});

const GUEST_ROLE_NAME = 'guest';
const LOCAL_ROLE_NAME = 'local';
const VERIFY_MESSAGE_ID = '1502781898823565422';

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

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id !== VERIFY_MESSAGE_ID) return;
  if (reaction.emoji.name !== 'star') return;

  const member = await reaction.message.guild.members.fetch(user.id);
  const guestRole = reaction.message.guild.roles.cache.find(r => r.name === GUEST_ROLE_NAME);
  const localRole = reaction.message.guild.roles.cache.find(r => r.name === LOCAL_ROLE_NAME);

  if (localRole) await member.roles.add(localRole);
  if (guestRole) await member.roles.remove(guestRole);

  console.log(`✅ Verified ${user.tag} - assigned local, removed guest`);
});

client.login(process.env.TOKEN);