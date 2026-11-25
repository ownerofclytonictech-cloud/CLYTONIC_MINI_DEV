require('dotenv').config();

module.exports = {
  botName: 'Clytonic Tech MD',
  botVersion: '1.0.0',
  prefix: '.',

  ownerNumber: '263775814192',
  ownerName: 'Clytonic Tech DM',
  ownerEmail: 'clytonictech0@gmail.com',
  channelLink: 'https://whatsapp.com/channel/0029VbDjHxGATRSgdFSNaF1r',

  defaultMode: 'public',
  serverOnline: true,
  dbPath: './database/settings.json',

  roles: {
    OWNER: 'owner',
    ADMIN: 'admin',
    PREMIUM: 'premium',
    USER: 'user'
  },

  messages: {
    ownerOnly: '⛔ This command is for Owner only.',
    adminOnly: '⛔ This command is for Group Admins only.',
    premiumOnly: '⛔ This command is for Premium users only.',
    groupOnly: '⛔ This command can only be used in groups.',
    privateOnly: '⛔ This command can only be used in private chat.',
    serverOffline: '🔴 Server is OFFLINE. Bot is not responding.',
    notRegistered: '⛔ You are not registered. Contact owner for access.'
  }
};
