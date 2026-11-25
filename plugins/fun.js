const config = require('../config');

const FOOTER = `\n\n_Powered by ${config.ownerName}_ ⚡`;

const commands = [
  {
    name: 'ping', aliases: ['p'], description: 'Check bot latency',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const start = Date.now();
      await sock.sendMessage(from, { text: `🏓 Pong!${FOOTER}` }, { quoted: msg });
      const latency = Date.now() - start;
      await sock.sendMessage(from, { text: `⚡ Latency: *${latency}ms*${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'joke', description: 'Random joke',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const jokes = [
        'Why do programmers prefer dark mode? Because light attracts bugs.',
        'A SQL query walks into a bar, approaches two tables and asks: "Can I JOIN you?"',
        'Why did the developer go broke? Because he used up all his cache.',
        'How many programmers does it take to change a light bulb? None, that\'s a hardware problem.',
        'What\'s the object-oriented way to become wealthy? Inheritance.'
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      await sock.sendMessage(from, { text: `😂 ${joke}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'quote', description: 'Random quote',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const quotes = [
        '"Talk is cheap. Show me the code." — Linus Torvalds',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
        '"Simplicity is the soul of efficiency." — Austin Freeman',
        '"The best error message is the one that never shows up." — Thomas Fuchs'
      ];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      await sock.sendMessage(from, { text: `💭 ${quote}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: '8ball', description: 'Magic 8 ball',
    async execute(ctx) {
      const { sock, msg, from, args } = ctx;
      if (!args.length) return sock.sendMessage(from, { text: `❌ Ask something!\nUsage: ${config.prefix}8ball <question>${FOOTER}` }, { quoted: msg });
      const answers = ['Yes, definitely.', 'No.', 'Maybe.', 'Try again later.', 'Of course!', 'Don\'t count on it.', 'Could be.', 'Impossible.', 'Yes, but be careful.', 'Focus first.', 'Forget about it.', 'Absolutely yes!'];
      const answer = answers[Math.floor(Math.random() * answers.length)];
      await sock.sendMessage(from, { text: `🎱 *Question:* ${args.join(' ')}\n*Answer:* ${answer}${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'dice', aliases: ['roll'], description: 'Roll a dice',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const result = Math.floor(Math.random() * 6) + 1;
      await sock.sendMessage(from, { text: `🎲 You rolled: *${result}*${FOOTER}` }, { quoted: msg });
    }
  },
  {
    name: 'coin', aliases: ['flip'], description: 'Flip a coin',
    async execute(ctx) {
      const { sock, msg, from } = ctx;
      const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
      await sock.sendMessage(from, { text: `🪙 Result: *${result}*${FOOTER}` }, { quoted: msg });
    }
  }
];

module.exports = { commands };
