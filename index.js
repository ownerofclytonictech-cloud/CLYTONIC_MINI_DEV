const { connectToWhatsApp } = require('./lib/connection');
const { loadDatabase } = require('./lib/database');
const { loadPlugins } = require('./lib/message');
const config = require('./config');

console.log(`
╔══════════════════════════════════════════╗
║     CLYTONIC TECH MD - WHATSAPP BOT      ║
║     Version: ${config.botVersion}                        ║
║     Owner: ${config.ownerName}            ║
║     Mode: ${config.defaultMode}                          ║
╚══════════════════════════════════════════╝
`);

loadDatabase();
loadPlugins();
connectToWhatsApp();
