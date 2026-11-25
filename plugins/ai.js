const config = require('../config');

const FOOTER = `\n\n_Powered by ${config.ownerName}_ ⚡`;

const commands = [
  {
    name: 'ai', aliases: ['ask', 'chat'], role: 'premium',
    description: 'Ask AI a question (premium)',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const query = args.join(' ');
      if (!query) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}ai <question>\n\n*Premium feature*${FOOTER}` }, { quoted: msg });
      await sock.sendMessage(from, { text: `🤖 *AI Response*\n\nYour question: "${query}"\n\n⚠️ AI API not yet configured. Owner needs to set up an AI endpoint (OpenAI/Gemini) in config.js.${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'translate', aliases: ['tr'], role: 'premium',
    description: 'Translate text (premium)',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      const text = args.join(' ');
      if (!text) return sock.sendMessage(from, { text: `❌ Usage: ${config.prefix}translate <text>${FOOTER}` }, { quoted: msg });
      await sock.sendMessage(from, { text: `🌐 *Translation*\nOriginal: "${text}"\n\n⚠️ Translation API not yet configured.${FOOTER}` }, { quoted: msg });
    }
  }
];

module.exports = { commands };
