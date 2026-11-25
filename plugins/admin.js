const config = require('../config');

const FOOTER = `\n\n_Powered by ${config.ownerName}_ ⚡`;

const commands = [
  {
    name: 'promote', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Promote a member to admin',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
      if (!target) return sock.sendMessage(from, { text: `❌ Tag a member or type number.\nUsage: ${config.prefix}promote @user${FOOTER}` }, { quoted: msg });
      try {
        await sock.groupParticipantsUpdate(from, [target], 'promote');
        await sock.sendMessage(from, { text: `✅ Successfully promoted ${target.split('@')[0]} to admin.${FOOTER}` });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'demote', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Demote an admin to member',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
      if (!target) return sock.sendMessage(from, { text: `❌ Tag a member or type number.\nUsage: ${config.prefix}demote @user${FOOTER}` }, { quoted: msg });
      try {
        await sock.groupParticipantsUpdate(from, [target], 'demote');
        await sock.sendMessage(from, { text: `✅ Successfully demoted ${target.split('@')[0]}.${FOOTER}` });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'kick', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Kick a member from the group',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? `${args[0].replace(/[^0-9]/g, '')}@s.whatsapp.net` : null);
      if (!target) return sock.sendMessage(from, { text: `❌ Tag a member or type number.\nUsage: ${config.prefix}kick @user${FOOTER}` }, { quoted: msg });
      try {
        await sock.groupParticipantsUpdate(from, [target], 'remove');
        await sock.sendMessage(from, { text: `👢 ${target.split('@')[0]} has been kicked.${FOOTER}` });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'add', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Add a member to the group',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}add 263xxxxxxxxx${FOOTER}` }, { quoted: msg });
      try {
        await sock.groupParticipantsUpdate(from, [`${number}@s.whatsapp.net`], 'add');
        await sock.sendMessage(from, { text: `✅ ${number} added to the group.${FOOTER}` });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'tagall', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Tag all group members',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const groupMetadata = await sock.groupMetadata(from);
      const participants = groupMetadata.participants.map(p => p.id);
      const text = args.join(' ') || 'Attention everyone!';
      await sock.sendMessage(from, {
        text: `📢 *${text}*\n\n${participants.map(p => `@${p.split('@')[0]}`).join('\n')}\n\n_Powered by ${config.ownerName}_ ⚡`,
        mentions: participants
      }, { quoted: msg });
    }
  },
  {
    name: 'groupinfo', aliases: ['ginfo'], role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Show group information (admin)',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const metadata = await sock.groupMetadata(from);
      const info = `╔══════════════════════════════╗
║      📋 GROUP INFORMATION     ║
╠══════════════════════════════╣
║ Name: ${metadata.subject}
║ ID: ${from}
║ Created: ${new Date(metadata.creation * 1000).toLocaleDateString('en-US')}
║ Owner: ${metadata.owner?.split('@')[0] || 'Unknown'}
║ Members: ${metadata.participants.length}
║ Admins: ${metadata.participants.filter(p => p.admin).length}
║ Description: ${metadata.desc || '-'}
╚══════════════════════════════╝${FOOTER}`;
      await sock.sendMessage(from, { text: info }, { quoted: msg });
    }
  }
];

module.exports = { commands };
