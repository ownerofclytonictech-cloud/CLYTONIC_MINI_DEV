const axios = require('axios');
const config = require('../config');

const FOOTER = `\n\n_Powered by ${config.ownerName}_ ⚡`;

const commands = [
  {
    name: 'menu', aliases: ['help', 'commands'], description: 'Show all commands',
    async execute(ctx) {
      const { sock, msg, from, role } = ctx;
      const { plugins } = require('../lib/message');
      const categories = {};
      const seen = new Set();
      for (const [name, plugin] of plugins.entries()) {
        if (seen.has(plugin.name)) continue;
        seen.add(plugin.name);
        const cat = plugin.role || 'user';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(plugin);
      }
      let menu = `╔══════════════════════════════════╗
║   🤖 ${config.botName}   ║
║   Version ${config.botVersion}              ║
╠══════════════════════════════════╣
║ 👤 Your Role: ${role.toUpperCase()}
╠══════════════════════════════════╣\n`;
      const roleEmoji = { owner: '👑', admin: '🛡️', premium: '⭐', user: '👤' };
      for (const [cat, cmds] of Object.entries(categories)) {
        menu += `\n${roleEmoji[cat] || '📁'} *${cat.toUpperCase()}*\n`;
        for (const cmd of cmds) {
          menu += `  ${config.prefix}${cmd.name}${cmd.aliases ? ` (${cmd.aliases.join(', ')})` : ''}\n`;
          if (cmd.description) menu += `    └ ${cmd.description}\n`;
        }
      }
      menu += `\n╚══════════════════════════════════╝
📧 ${config.ownerEmail}
🔗 ${config.channelLink}${FOOTER}`;
      await sock.sendMessage(from, { text: menu }, { quoted: msg });
    }
  },
  {
    name: 'owner', aliases: ['creator'], description: 'Show owner info',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.ownerName}
ORG:Clytonic Tech;
TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}
EMAIL:${config.ownerEmail}
END:VCARD`;
      await sock.sendMessage(from, { contacts: { displayName: config.ownerName, contacts: [{ vcard }] } }, { quoted: msg });
      await sock.sendMessage(from, { text: `👑 *Bot Owner*\n\n📛 ${config.ownerName}\n📱 +${config.ownerNumber}\n📧 ${config.ownerEmail}\n🔗 ${config.channelLink}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'channel', aliases: ['ch'], description: 'WhatsApp channel link',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      await sock.sendMessage(from, { text: `📢 *Official Channel*\n\n${config.channelLink}\n\nFollow for bot updates!${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'uptime', description: 'Check bot uptime',
    async execute(ctx) {
      const { sock, msg, from, db } = ctx;
      const ms = Date.now() - db.stats.startTime;
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      await sock.sendMessage(from, { text: `⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n📊 *Commands:* ${db.stats.totalCommands}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'stats', description: 'Bot statistics',
    async execute(ctx) {
      const { sock, msg, from, db } = ctx;
      await sock.sendMessage(from, {
        text: `📊 *BOT STATISTICS*\n\n` +
              `🤖 Mode: ${db.mode}\n` +
              `📡 Server: ${db.serverOnline ? 'ONLINE 🟢' : 'OFFLINE 🔴'}\n` +
              `⚡ Commands: ${db.stats.totalCommands}\n` +
              `💬 Messages: ${db.stats.totalMessages}\n` +
              `👑 Owners: ${db.owners.length}\n` +
              `⭐ Premium: ${db.premiumUsers.length}\n` +
              `🚫 Banned: ${db.bannedUsers.length}${FOOTER}`
      }, { quoted: msg });
    }
  },
  {
    name: 'tiktok', aliases: ['tt'], role: 'premium', description: 'Download TikTok video (premium)',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const url = args[0];
      if (!url || !url.includes('tiktok')) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}tiktok <tiktok url>${FOOTER}` }, { quoted: msg });
      await sock.sendMessage(from, { text: `⏳ Downloading TikTok video...${FOOTER}` }, { quoted: msg });
      try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 30000 });
        const data = res.data;
        if (data?.video?.noWatermark) {
          await sock.sendMessage(from, { video: { url: data.video.noWatermark }, caption: `🎬 *TikTok Download*\n\n📝 ${data.title || 'No title'}\n👤 ${data.author?.name || 'Unknown'}\n\n_Powered by ${config.ownerName}_ ⚡` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `❌ Failed to extract video URL.${FOOTER}` }, { quoted: msg });
        }
      } catch (err) { await sock.sendMessage(from, { text: `❌ Download failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'instagram', aliases: ['ig'], role: 'premium', description: 'Download Instagram media (premium)',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const url = args[0];
      if (!url || !url.includes('instagram')) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}instagram <ig url>${FOOTER}` }, { quoted: msg });
      await sock.sendMessage(from, { text: `⏳ Downloading Instagram media...${FOOTER}` }, { quoted: msg });
      try {
        const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`, { timeout: 30000 });
        const data = res.data;
        if (data?.url) {
          await sock.sendMessage(from, { video: { url: data.url }, caption: `📸 *Instagram Download*\n\n${data.title || ''}\n\n_Powered by ${config.ownerName}_ ⚡` }, { quoted: msg });
        } else {
          await sock.sendMessage(from, { text: `❌ Failed to extract media URL.${FOOTER}` }, { quoted: msg });
        }
      } catch (err) { await sock.sendMessage(from, { text: `❌ Download failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'youtube', aliases: ['yt'], role: 'premium', description: 'Download YouTube audio/video (premium)',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const url = args[0];
      if (!url || !url.includes('youtu')) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}youtube <youtube url>${FOOTER}` }, { quoted: msg });
      await sock.sendMessage(from, { text: `⏳ YouTube downloader requires a dedicated API endpoint. Owner needs to set up an API key (RapidAPI/ytdl) in config.js.\n\n*Placeholder response.*${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'sticker', aliases: ['s'], role: 'premium', description: 'Convert image to sticker (premium)',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) return sock.sendMessage(from, { text: `❌ Reply to an image with ${config.prefix}sticker${FOOTER}` }, { quoted: msg });
      await sock.sendMessage(from, { text: `⚠️ Sticker feature requires installing \`sharp\` or \`jimp\`.\n\nRun: \`npm install sharp\`${FOOTER}` }, { quoted: msg });
    }
  }
];

module.exports = { commands };
