const config = require('../config');

const FOOTER = `\n\n_Powered by ${config.ownerName}_ ⚡`;

const commands = [
  {
    name: 'groupinfo', aliases: ['ginfo'], groupOnly: true,
    description: 'Show group information (all members)',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const metadata = await sock.groupMetadata(from);
      await sock.sendMessage(from, { text: `📋 *${metadata.subject}*\n👥 ${metadata.participants.length} members\n📅 ${new Date(metadata.creation * 1000).toLocaleDateString('en-US')}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'linkgroup', aliases: ['linkgc'], role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Get group invite link',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      try {
        const code = await sock.groupInviteCode(from);
        await sock.sendMessage(from, { text: `🔗 *Group Invite Link*\nhttps://chat.whatsapp.com/${code}${FOOTER}` }, { quoted: msg });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'revoke', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Reset group invite link',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      try {
        await sock.groupRevokeInvite(from);
        await sock.sendMessage(from, { text: `✅ Invite link has been reset.${FOOTER}` }, { quoted: msg });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'setname', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Change group name',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const name = args.join(' ');
      if (!name) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}setname <new name>${FOOTER}` }, { quoted: msg });
      try {
        await sock.groupUpdateSubject(from, name);
        await sock.sendMessage(from, { text: `✅ Group name changed to: *${name}*${FOOTER}` }, { quoted: msg });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'setdesc', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Change group description',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const desc = args.join(' ');
      if (!desc) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}setdesc <description>${FOOTER}` }, { quoted: msg });
      try {
        await sock.groupUpdateDescription(from, desc);
        await sock.sendMessage(from, { text: `✅ Group description updated.${FOOTER}` }, { quoted: msg });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'close', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Close group (admins only can chat)',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      try {
        await sock.groupSettingUpdate(from, 'announcement');
        await sock.sendMessage(from, { text: `🔒 Group closed. Only admins can chat.${FOOTER}` }, { quoted: msg });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  },
  {
    name: 'open', role: 'admin', adminOnly: true, groupOnly: true,
    description: 'Open group (everyone can chat)',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      try {
        await sock.groupSettingUpdate(from, 'not_announcement');
        await sock.sendMessage(from, { text: `🔓 Group opened. All members can chat.${FOOTER}` }, { quoted: msg });
      } catch (err) { await sock.sendMessage(from, { text: `❌ Failed: ${err.message}${FOOTER}` }, { quoted: msg }); }
    }
  }
];

module.exports = { commands };
