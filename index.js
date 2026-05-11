require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

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
const VERIFY_MESSAGE_ID = '1502787676867137536';
const WELC_CHANNEL_NAME = 'welc';

const AGE_MESSAGE_ID = '1502807865335877775';
const MIC_MESSAGE_ID = '1502807873359712378';
const PINGS_MESSAGE_ID = '1502807897107861645';

const AGE_ROLES = {
  one: '1502796200951418891',
  two: '1502796437539389681',
  three: '1502796509442342973',
};

const MIC_ROLES = {
  one: '1502796568158404728',
  two: '1502796596977471701',
};

const PING_ROLES = {
  one: '1502796646554140802',
  two: '1502796804616618075',
  three: '1502797058745172028',
  four: '1502797257173631006',
  five: '1503535577364955257',
  six: '1503535715437248572',
};

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  // assign guest role
  const role = member.guild.roles.cache.find(r => r.name === GUEST_ROLE_NAME);
  if (!role) {
    console.log('❌ Guest role not found! Make sure it is spelled correctly in your server.');
  } else {
    try {
      await member.roles.add(role);
      console.log(`✅ Assigned guest role to ${member.user.tag}`);
    } catch (error) {
      console.log(`❌ Couldn't assign role: ${error}`);
    }
  }

  // welcome embed
  const welcChannel = member.guild.channels.cache.find(c => c.name === WELC_CHANNEL_NAME);
  if (welcChannel) {
    const embed = new EmbedBuilder()
      .setColor(0xC7B8B7)
      .setDescription(
        `♡⸝⸝ welc <@${member.id}> ㅤㅤㅤㅤㅤㅤ\n` +
        `ㅤㅤㅤㅤㅤㅤ ・・・・・ㅤㅤㅤ<#${member.guild.channels.cache.find(c => c.name === 'verify')?.id}>`
      )
    await welcChannel.send({ embeds: [embed] });
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  const member = await reaction.message.guild.members.fetch(user.id);
  const emojiName = reaction.emoji.name;
  const messageId = reaction.message.id;

  // verify
  if (messageId === VERIFY_MESSAGE_ID && emojiName === 'star') {
    const guestRole = reaction.message.guild.roles.cache.find(r => r.name === GUEST_ROLE_NAME);
    const localRole = reaction.message.guild.roles.cache.find(r => r.name === LOCAL_ROLE_NAME);
    if (localRole) await member.roles.add(localRole);
    if (guestRole) await member.roles.remove(guestRole);
    console.log(`✅ Verified ${user.tag} - assigned local, removed guest`);
  }

  // age - remove other age roles first, then add new one
  if (messageId === AGE_MESSAGE_ID && AGE_ROLES[emojiName]) {
    for (const roleId of Object.values(AGE_ROLES)) {
      const role = reaction.message.guild.roles.cache.get(roleId);
      if (role && member.roles.cache.has(roleId)) await member.roles.remove(role);
    }
    const newRole = reaction.message.guild.roles.cache.get(AGE_ROLES[emojiName]);
    if (newRole) await member.roles.add(newRole);
    console.log(`✅ Assigned age role to ${user.tag}`);
  }

  // mic - remove other mic roles first, then add new one
  if (messageId === MIC_MESSAGE_ID && MIC_ROLES[emojiName]) {
    for (const roleId of Object.values(MIC_ROLES)) {
      const role = reaction.message.guild.roles.cache.get(roleId);
      if (role && member.roles.cache.has(roleId)) await member.roles.remove(role);
    }
    const newRole = reaction.message.guild.roles.cache.get(MIC_ROLES[emojiName]);
    if (newRole) await member.roles.add(newRole);
    console.log(`✅ Assigned mic role to ${user.tag}`);
  }

  // pings - just add the role
  if (messageId === PINGS_MESSAGE_ID && PING_ROLES[emojiName]) {
    const newRole = reaction.message.guild.roles.cache.get(PING_ROLES[emojiName]);
    if (newRole) await member.roles.add(newRole);
    console.log(`✅ Assigned ping role to ${user.tag}`);
  }
});

// remove ping roles when reaction is removed
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  const member = await reaction.message.guild.members.fetch(user.id);
  const emojiName = reaction.emoji.name;

  if (reaction.message.id === PINGS_MESSAGE_ID && PING_ROLES[emojiName]) {
    const role = reaction.message.guild.roles.cache.get(PING_ROLES[emojiName]);
    if (role) await member.roles.remove(role);
    console.log(`✅ Removed ping role from ${user.tag}`);
  }
});

client.login(process.env.TOKEN);