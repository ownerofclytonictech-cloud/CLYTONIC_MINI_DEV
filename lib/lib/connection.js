const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const { handleMessage } = require('./message');
const { getDB } = require('./database');
const config = require('../config');

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ['Clytonic Tech MD', 'Chrome', '1.0.0'],
    markOnlineOnConnect: false,
    syncFullHistory: false
  });

  if (!sock.authState.creds.registered) {
    const phoneNumber = config.ownerNumber;
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n🔑 PAIRING CODE: ${code}\n`);
        console.log('Enter this code in WhatsApp > Linked Devices > Link with phone number\n');
      } catch (err) {
        console.error('Pairing error:', err.message);
      }
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log('✅ Clytonic Tech MD CONNECTED');
      console.log(`📱 Owner: ${config.ownerName} (${config.ownerNumber})`);
      const db = getDB();
      console.log(`🔧 Mode: ${db.mode} | Server: ${db.serverOnline ? 'ONLINE' : 'OFFLINE'}`);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`⚠️ Connection closed (${statusCode}). Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) setTimeout(() => connectToWhatsApp(), 5000);
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;
    for (const msg of m.messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      try { await handleMessage(sock, msg); }
      catch (err) { console.error('Message handler error:', err.message); }
    }
  });

  return sock;
}

module.exports = { connectToWhatsApp };
