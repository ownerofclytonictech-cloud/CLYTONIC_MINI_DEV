const {
  getDB, setMode, setServerStatus,
  addOwner, removeOwner, addPremium, removePremium,
  banUser, unbanUser
} = require('../lib/database');
const config = require('../config');

const FOOTER = `\n\n_Powered by ${config.ownerName}_ ⚡`;

const commands = [
  {
    name: 'mode',
    aliases: ['setmode'],
    role: 'owner',
    description: 'Change bot mode (public/self)',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const mode = args[0]?.toLowerCase();
      if (!mode || !['public', 'self'].includes(mode)) {
        return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}mode public|self\nCurrent: ${getDB().mode}${FOOTER}` }, { quoted: msg });
      }
      setMode(mode);
      await sock.sendMessage(from, { text: `✅ Mode changed to: *${mode}*\n${mode === 'self' ? '🔒 Only owner can use commands.' : '🌐 Everyone can use commands.'}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'server',
    role: 'owner',
    description: 'Toggle server online/offline',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const action = args[0]?.toLowerCase();
      if (action === 'on') { setServerStatus(true); return sock.sendMessage(from, { text: `🟢 Server ONLINE. Bot responds to everyone.${FOOTER}` }, { quoted: msg }); }
      if (action === 'off') { setServerStatus(false); return sock.sendMessage(from, { text: `🔴 Server OFFLINE. Bot is silent except for owner server commands.${FOOTER}` }, { quoted: msg }); }
      const db = getDB();
      await sock.sendMessage(from, { text: `🖥️ Server Status: *${db.serverOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}*\nUsage: ${config.prefix}server on|off${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'addowner',
    role: 'owner',
    description: 'Add new owner',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}addowner 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      const ok = addOwner(number);
      await sock.sendMessage(from, { text: ok ? `✅ ${number} added as owner.${FOOTER}` : `⚠️ ${number} is already an owner.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'delowner',
    role: 'owner',
    description: 'Remove owner',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}delowner 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      const ok = removeOwner(number);
      await sock.sendMessage(from, { text: ok ? `✅ ${number} removed from owners.${FOOTER}` : `⚠️ Cannot remove. At least one owner must remain, or number not found.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'addprem',
    aliases: ['addpremium'],
    role: 'owner',
    description: 'Add premium user',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}addprem 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      const ok = addPremium(number);
      await sock.sendMessage(from, { text: ok ? `✅ ${number} added as premium user.${FOOTER}` : `⚠️ ${number} is already premium.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'delprem',
    aliases: ['delpremium'],
    role: 'owner',
    description: 'Remove premium user',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}delprem 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      const ok = removePremium(number);
      await sock.sendMessage(from, { text: ok ? `✅ ${number} removed from premium.${FOOTER}` : `⚠️ ${number} is not premium.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'ban',
    role: 'owner',
    description: 'Ban a user',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}ban 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      const ok = banUser(number);
      await sock.sendMessage(from, { text: ok ? `🔨 ${number} has been banned.${FOOTER}` : `⚠️ ${number} is already banned.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'unban',
    role: 'owner',
    description: 'Unban a user',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}unban 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      const ok = unbanUser(number);
      await sock.sendMessage(from, { text: ok ? `✅ ${number} has been unbanned.${FOOTER}` : `⚠️ ${number} is not in the ban list.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'ownerpanel',
    aliases: ['panel', 'op'],
    role: 'owner',
    description: 'Owner control panel',
    async execute(ctx) {
      const { sock, msg, from, db } = ctx;
      const uptime = Math.floor((Date.now() - db.stats.startTime) / 1000 / 60);
      const panel = `╔══════════════════════════════════════╗
║        👑 OWNER CONTROL PANEL        ║
╠══════════════════════════════════════╣
║ 🤖 Bot: ${config.botName}
║ 📦 Version: ${config.botVersion}
║ 🖥️ Mode: ${db.mode.toUpperCase()}
║ 📡 Server: ${db.serverOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
║ ⏱️ Uptime: ${uptime} minutes
╠══════════════════════════════════════╣
║ 📊 STATISTICS
║ ├ Commands: ${db.stats.totalCommands}
║ ├ Messages: ${db.stats.totalMessages}
║ └ Owners: ${db.owners.length}
╠══════════════════════════════════════╣
║ 👥 USERS
║ ├ Premium: ${db.premiumUsers.length}
║ └ Banned: ${db.bannedUsers.length}
╠══════════════════════════════════════╣
║ ⚙️ QUICK COMMANDS
║ ${config.prefix}mode public|self
║ ${config.prefix}server on|off
║ ${config.prefix}addprem <number>
║ ${config.prefix}ban <number>
║ ${config.prefix}broadcast <msg>
╚══════════════════════════════════════╝${FOOTER}`;
      await sock.sendMessage(from, { text: panel }, { quoted: msg });
    }
  },
  {
    name: 'broadcast',
    aliases: ['bc'],
    role: 'owner',
    description: 'Broadcast to all groups',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const text = args.join(' ');
      if (!text) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}broadcast <message>${FOOTER}` }, { quoted: msg });
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      await sock.sendMessage(from, { text: `📤 Broadcasting to ${groupIds.length} groups...${FOOTER}` }, { quoted: msg });
      let success = 0, failed = 0;
      for (const id of groupIds) {
        try {
          await sock.sendMessage(id, { text: `📢 *BROADCAST*\n\n${text}\n\n_Powered by ${config.ownerName}_ ⚡` });
          success++;
          await new Promise(r => setTimeout(r, 1500));
        } catch { failed++; }
      }
      await sock.sendMessage(from, { text: `✅ Broadcast finished.\nSuccess: ${success}\nFailed: ${failed}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'update',
    role: 'owner',
    description: 'Update bot from git',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const { exec } = require('child_process');
      await sock.sendMessage(from, { text: `🔄 Checking for updates...${FOOTER}` }, { quoted: msg });
      exec('git pull', (err, stdout, stderr) => {
        if (err) sock.sendMessage(from, { text: `❌ Update failed:\n${stderr || err.message}${FOOTER}` }, { quoted: msg });
        else sock.sendMessage(from, { text: `✅ Update result:\n${stdout || 'Already up to date.'}${FOOTER}` }, { quoted: msg });
      });
    }
  },
  {
    name: 'restart',
    role: 'owner',
    description: 'Restart the bot',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      await sock.sendMessage(from, { text: `🔄 Restarting bot...${FOOTER}` }, { quoted: msg });
      setTimeout(() => process.exit(0), 2000);
    }
  }
];

module.exports = { commands };
