const { getDB, incrementCommands, isOwner } = require('./database');
const { canUseCommand, getRole, isGroupAdmin } = require('./permissions');
const config = require('../config');

const plugins = new Map();

function loadPlugins() {
  const pluginFiles = [
    './plugins/owner',
    './plugins/admin',
    './plugins/group',
    './plugins/fun',
    './plugins/ai',
    './plugins/utility'
  ];

  for (const file of pluginFiles) {
    try {
      const plugin = require(`../${file}`);
      if (plugin.commands) {
        for (const cmd of plugin.commands) {
          plugins.set(cmd.name, cmd);
          if (cmd.aliases) for (const alias of cmd.aliases) plugins.set(alias, cmd);
        }
      }
    } catch (err) {
      console.error(`Plugin load error (${file}):`, err.message);
    }
  }

  console.log(`✅ ${plugins.size} commands loaded`);
}

function parseCommand(text, prefix) {
  if (!text.startsWith(prefix)) return null;
  const parts = text.slice(prefix.length).trim().split(/\s+/);
  return { command: parts[0].toLowerCase(), args: parts.slice(1), fullText: text };
}

async function handleMessage(sock, msg) {
  const db = getDB();
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  const messageType = Object.keys(msg.message)[0];
  let text = '';
  if (messageType === 'conversation') text = msg.message.conversation;
  else if (messageType === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
  else return;

  const parsed = parseCommand(text, config.prefix);
  if (!parsed) return;
  const { command, args, fullText } = parsed;

  if (!db.serverOnline) {
    if (!(isOwner(sender) && command === 'server')) return;
  }

  if (db.mode === 'self') {
    if (!isOwner(sender)) return;
  }

  const plugin = plugins.get(command);
  if (!plugin) return;

  const permission = canUseCommand(sender, plugin);
  if (!permission.allowed) {
    await sock.sendMessage(from, { text: permission.reason }, { quoted: msg });
    return;
  }

  if (plugin.groupOnly && !isGroup) {
    await sock.sendMessage(from, { text: config.messages.groupOnly }, { quoted: msg });
    return;
  }

  if (plugin.privateOnly && isGroup) {
    await sock.sendMessage(from, { text: config.messages.privateOnly }, { quoted: msg });
    return;
  }

  if (plugin.adminOnly && isGroup) {
    const groupMetadata = await sock.groupMetadata(from);
    if (!isGroupAdmin(sender, groupMetadata)) {
      await sock.sendMessage(from, { text: config.messages.adminOnly }, { quoted: msg });
      return;
    }
  }

  incrementCommands();

  try {
    await plugin.execute({
      sock, msg, from, sender, args, command, fullText, isGroup,
      role: getRole(sender), db
    });
  } catch (err) {
    console.error(`Command error (${command}):`, err.message);
    await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
  }
}

module.exports = { handleMessage, loadPlugins, plugins };
