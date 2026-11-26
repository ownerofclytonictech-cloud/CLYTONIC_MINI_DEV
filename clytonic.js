'use strict';

// ═══════════════════════════════════════════════════════════════════════════
//  🐉 CLYTONIC MDX v4.0  ·  CLYTONIC TECH
// ═══════════════════════════════════════════════════════════════════════════

// ┌──────────────────────────────────────────────────────────────────────┐
// │  🔗 RENDER PAIRING SERVER URL                                        │
// └──────────────────────────────────────────────────────────────────────┘
const RENDER_API_URL = process.env.RENDER_API_URL || 'https://clytonic-pairing.onrender.com';

// ┌──────────────────────────────────────────────────────────────────────┐
// │  🔗 AUTO-JOIN GROUPS — paste full invite links                       │
// │  The bot extracts the code and joins on every connect.               │
// └──────────────────────────────────────────────────────────────────────┘
const AUTO_JOIN_GROUPS = [
    // 'https://chat.whatsapp.com/BB5XY347EdOBARaGbO54mU',
    // 'https://chat.whatsapp.com/XXXXXXXXXXXXXXXXXXXXXXX',
];

// ┌──────────────────────────────────────────────────────────────────────┐
// │  📢 AUTO-FOLLOW CHANNELS — paste full channel links here             │
// │  Accepts:                                                            │
// │    https://whatsapp.com/channel/XXXXXXXXXXXXXXXXXXXXXX               │
// │    https://wa.me/channel/XXXXXXXXXXXXXXXXXXXXXX                      │
// │    https://whatsapp.com/channel/XXXXXXXXXXXXXXXXXXXXXX/follow        │
// │  Bot extracts the channel JID and follows automatically.             │
// └──────────────────────────────────────────────────────────────────────┘
const AUTO_FOLLOW_CHANNELS = [
    // 'https://whatsapp.com/channel/0029VaXXXXXXXXXXXXXXXXXX',
    // 'https://wa.me/channel/0029VaYYYYYYYYYYYYYYYYYY',
];

// ┌──────────────────────────────────────────────────────────────────────┐
// │  ❤️ AUTO-REACT TO NEWSLETTER MESSAGES                                │
// └──────────────────────────────────────────────────────────────────────┘
const NEWSLETTER_AUTO_REACT = true;
const NEWSLETTER_JIDS_TO_REACT = [
    // Add newsletter JIDs (e.g. '120363409093179031@newsletter') to auto-react to
];
const NEWSLETTER_REACT_EMOJIS = ['❤️','🐉','✨','🔥','💎','💜','⚡','🖤','🤍','💯','😍','🥰','😻'];

// ── BUILT-INS ──────────────────────────────────────────────────────────────
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const crypto = require('crypto');

function safeRequire(name, fallback) {
    try { return require(name); }
    catch { console.warn(`⚠️ Missing: ${name}`); return fallback; }
}

let chalk;
try { chalk = require('chalk'); }
catch {
    const id = s => s;
    chalk = new Proxy(id, {
        get: (t, p) => (typeof p === 'string' && /^(bold|cyan|green|red|yellow|blue|magenta|white|gray|dim|underline|hex)$/i.test(p)) ? chalk : id,
        apply: (t, _, a) => a[0]
    });
}

const pino = safeRequire('pino', () => ({ level: 'silent', info: () => {}, error: () => {}, warn: () => {}, fatal: () => {}, child: () => ({ level: 'fatal', fatal: () => {}, info: () => {}, error: () => {}, warn: () => {} }) }));
const axios = safeRequire('axios', { get: async () => ({ data: {} }), post: async () => ({ data: {} }) });
const FormData = safeRequire('form-data', class { append() {} getHeaders() { return {}; } });
const yts = safeRequire('yt-search', () => ({ search: async () => ({ videos: [] }) }));
const { Sticker, StickerTypes } = safeRequire('wa-sticker-formatter', { Sticker: class {}, StickerTypes: { FULL: '' } });
const NodeCache = safeRequire('node-cache', class { get() {} set() {} has() { return false; } });
const QRCode = safeRequire('qrcode', { toBuffer: async () => Buffer.from([]) });

const bf = {
    default: () => ({}),
    useMultiFileAuthState: async () => ({ state: { creds: {}, keys: {} }, saveCreds: () => {} }),
    delay: ms => new Promise(r => setTimeout(r, ms)),
    getContentType: () => 'conversation',
    makeCacheableSignalKeyStore: k => k,
    downloadContentFromMessage: async () => (async function* () { yield Buffer.from([]); })(),
    fetchLatestBaileysVersion: async () => ({ version: [2, 3000, 1015901307] }),
    DisconnectReason: { loggedOut: 401 },
    proto: {}, prepareWAMessageMedia: async () => ({}), generateWAMessageFromContent: () => ({}),
    downloadMediaMessage: async () => Buffer.from([])
};
const B = safeRequire('@whiskeysockets/baileys', bf);
const makeWASocket = B.default || bf.default;
const useMultiFileAuthState = B.useMultiFileAuthState || bf.useMultiFileAuthState;
const delay = B.delay || bf.delay;
const getContentType = B.getContentType || bf.getContentType;
const makeCacheableSignalKeyStore = B.makeCacheableSignalKeyStore || bf.makeCacheableSignalKeyStore;
const downloadContentFromMessage = B.downloadContentFromMessage || bf.downloadContentFromMessage;
const fetchLatestBaileysVersion = B.fetchLatestBaileysVersion || bf.fetchLatestBaileysVersion;
const DisconnectReason = B.DisconnectReason || bf.DisconnectReason;

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════════════════════════════════════════
const BOT_IMAGES = ['https://files.catbox.moe/kvlfgn.jpeg'];
const BOT_AUDIOS = ['https://files.catbox.moe/xmnioi.mp3', 'https://files.catbox.moe/8y28fu.mp3'];
const AI_SHORT_NAME = 'CLYTONIC';
const AI_FULL_NAME = 'CLYTONIC MDX';
const AI_SYSTEM_IDENTITY = `You are ${AI_SHORT_NAME}, full name ${AI_FULL_NAME}. Created by CLYTONIC TECH in 2026. Never claim to be another AI. If asked who made you, say: CLYTONIC TECH.`;

const config = {
    PREFIX: '.',
    BOT_NAME: AI_SHORT_NAME,
    BOT_FULL_NAME: AI_FULL_NAME,
    VERSION: '4.0.0',
    OWNER_NUMBERS: ['263788159530', '263771528985'],
    OWNER_NAME: 'CLYTONIC TECH',
    OWNER_TG: 'https://t.me/clytonictech',
    OWNER_WA: 'https://wa.me/263788159530',
    BOT_IMAGES, BOT_AUDIOS,
    NEWSLETTER_JID: '120363409093179031@newsletter',
    NEWSLETTER_NAME: 'CLYTONIC TECH',
    WATERMARK: '\n\n> 🐉 POWERED BY CLYTONIC TECH',
    RENDER_API_URL, AUTO_JOIN_GROUPS, AUTO_FOLLOW_CHANNELS,
    FOOTBALL_KEY: '4c51f784d207499ca21a5ad7b46c5ef8'
};
const WM = config.WATERMARK;
const PREFIX = config.PREFIX;

const SESSIONS_DIR = './sessions';
const CREDS_DIR = './creds';
const DATA_DIR = './data';
[SESSIONS_DIR, CREDS_DIR, DATA_DIR, './data/settings', './tmp'].forEach(d => fs.ensureDirSync(d));

// ═══════════════════════════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════════════════════════
const activeSockets = new Map();
const socketCreationTime = new Map();
const botStartTime = Date.now();
const msgStore = new NodeCache({ stdTTL: 3600 });
const games = {};

const toggles = {
    pm: './data/publicMode.json', ai: './data/aiToggle.json', voice: './data/voiceToggle.json',
    antilink: './data/antilink.json', antistatus: './data/antistatus.json',
    welcome: './data/welcome.json', antidelete: './data/antidelete.json',
    bans: './data/bans.json', users: './data/users.json'
};
for (const f of Object.values(toggles)) if (!fs.existsSync(f)) fs.writeFileSync(f, JSON.stringify({}, null, 2));

const readJSON = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return {}; } };
const writeJSON = (f, d) => { try { fs.writeFileSync(f, JSON.stringify(d, null, 2)); } catch {} };

const isPublicMode = () => readJSON(toggles.pm).enabled !== false;
const isAiEnabled = () => readJSON(toggles.ai).enabled !== false;
const isVoiceEnabled = () => readJSON(toggles.voice).enabled !== false;
const setPublicMode = v => writeJSON(toggles.pm, { enabled: v });
const setAiEnabled = v => writeJSON(toggles.ai, { enabled: v });
const setVoiceEnabled = v => writeJSON(toggles.voice, { enabled: v });

const getAntilink = c => readJSON(toggles.antilink)[c] || { enabled: false, action: 'delete' };
const setAntilink = (c, e, a = 'delete') => { const d = readJSON(toggles.antilink); d[c] = { enabled: e, action: a }; writeJSON(toggles.antilink, d); };
const getAntistatus = c => readJSON(toggles.antistatus)[c] || { enabled: false, action: 'delete' };
const setAntistatus = (c, e, a = 'delete') => { const d = readJSON(toggles.antistatus); d[c] = { enabled: e, action: a }; writeJSON(toggles.antistatus, d); };
const getWelcomeCfg = c => readJSON(toggles.welcome)[c] || { enabled: false, message: null };
const setWelcomeCfg = (c, e, m = null) => { const d = readJSON(toggles.welcome); d[c] = { enabled: e, message: m }; writeJSON(toggles.welcome, d); };

const isBanned = n => (readJSON(toggles.bans).list || []).includes(n);
const banUser = n => { const d = readJSON(toggles.bans); d.list = [...new Set([...(d.list || []), n])]; writeJSON(toggles.bans, d); };
const unbanUser = n => { const d = readJSON(toggles.bans); d.list = (d.list || []).filter(x => x !== n); writeJSON(toggles.bans, d); };

function getUser(jid) {
    const d = readJSON(toggles.users);
    if (!d[jid]) d[jid] = { wallet: 0, bank: 0, pokemon: [], pokeballs: 5, lastDaily: 0, lastCatch: 0, createdAt: Date.now(), marriedTo: null, proposalFrom: null };
    writeJSON(toggles.users, d);
    return d[jid];
}
function saveUser(jid, data) { const d = readJSON(toggles.users); d[jid] = data; writeJSON(toggles.users, d); }
const loadSS = n => { const p = path.join('./data/settings', `${n}.json`); try { return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {}; } catch { return {}; } };

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const getRandomBotImage = () => BOT_IMAGES[Math.floor(Math.random() * BOT_IMAGES.length)];
const getRandomBotAudio = () => BOT_AUDIOS[Math.floor(Math.random() * BOT_AUDIOS.length)];
const getUptime = (t = botStartTime) => { const u = Date.now() - t; const h = Math.floor(u / 3600000), m = Math.floor((u % 3600000) / 60000), s = Math.floor((u % 60000) / 1000); return `${h}h ${m}m ${s}s`; };
const getDateTime = () => { const n = new Date(); return { formatted: n.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }), day: n.toLocaleDateString('en-US', { weekday: 'long' }), time: n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }; };
const readMore = String.fromCharCode(8206).repeat(4001);
const newId = () => crypto.randomBytes(6).toString('hex').toUpperCase();

async function downloadQuoted(quoted) {
    if (!quoted) throw new Error('No quoted message');
    const m = quoted.message || quoted.msg || quoted;
    const type = getContentType(m);
    if (!type) throw new Error('Unsupported media');
    const stream = await downloadContentFromMessage(m[type], type.replace('Message', ''));
    let buf = Buffer.from([]);
    for await (const c of stream) buf = Buffer.concat([buf, c]);
    if (!buf.length) throw new Error('Empty media');
    return buf;
}

async function uploadToCatbox(buffer, ext = 'bin') {
    const tmp = path.join(os.tmpdir(), `cly_${Date.now()}.${ext}`);
    fs.writeFileSync(tmp, buffer);
    try {
        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tmp), `file.${ext}`);
        form.append('reqtype', 'fileupload');
        const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders(), timeout: 60000, maxContentLength: Infinity, maxBodyLength: Infinity });
        const url = (res.data || '').trim();
        if (!url.startsWith('http')) throw new Error('Bad upload');
        return url;
    } finally { try { fs.unlinkSync(tmp); } catch {} }
}

async function makeAudioSticker(audioBuffer, opts = {}) {
    const tmpDir = path.join(os.tmpdir(), `astick_${Date.now()}`);
    fs.ensureDirSync(tmpDir);
    try {
        const audioIn = path.join(tmpDir, 'input.mp3');
        const videoOut = path.join(tmpDir, 'output.webm');
        fs.writeFileSync(audioIn, audioBuffer);
        const bg = opts.bg || '#0d0418';
        const wave = opts.wave || '#a855f7';
        const size = opts.size || '512x512';
        const ff = `ffmpeg -y -i "${audioIn}" -filter_complex "[0:a]showwaves=s=${size}:mode=cline:rate=25:colors=${wave}[wave];color=c=${bg}:s=${size}:d=10[bg];[bg][wave]overlay=shortest=1:format=auto,format=yuv420p" -t 6 -c:v libvpx-vp9 -b:v 0 -crf 30 -an "${videoOut}"`;
        await new Promise((resolve, reject) => exec(ff, { timeout: 45000 }, err => err ? reject(err) : resolve()));
        if (!fs.existsSync(videoOut)) throw new Error('ffmpeg failed');
        const videoBuf = fs.readFileSync(videoOut);
        try { return await new Sticker(videoBuf, { pack: opts.pack || 'CLYTONIC MDX', author: opts.author || 'CLYTONIC TECH', type: StickerTypes.FULL, quality: 70 }).toBuffer(); }
        catch { return videoBuf; }
    } finally { try { fs.removeSync(tmpDir); } catch {} }
}

async function extractAudio(videoBuf) {
    const tmpDir = path.join(os.tmpdir(), `ext_${Date.now()}`);
    fs.ensureDirSync(tmpDir);
    try {
        const vidIn = path.join(tmpDir, 'in.mp4');
        const audOut = path.join(tmpDir, 'out.mp3');
        fs.writeFileSync(vidIn, videoBuf);
        await new Promise((res, rej) => exec(`ffmpeg -y -i "${vidIn}" -vn -acodec libmp3lame -q:a 4 "${audOut}"`, { timeout: 60000 }, e => e ? rej(e) : res()));
        if (!fs.existsSync(audOut)) throw new Error('Extract failed');
        return fs.readFileSync(audOut);
    } finally { try { fs.removeSync(tmpDir); } catch {} }
}

async function makeSticker(buffer, mime, opts = {}) {
    try { return await new Sticker(buffer, { pack: opts.pack || 'CLYTONIC MDX', author: opts.author || 'CLYTONIC TECH', type: StickerTypes.FULL, quality: opts.quality || 80 }).toBuffer(); }
    catch { return buffer; }
}

// ═══════════════════════════════════════════════════════════════════════════
//  CHANNEL LINK → JID EXTRACTOR (NEW)
// ═══════════════════════════════════════════════════════════════════════════
async function extractChannelJid(sock, link) {
    try {
        // Already a JID?
        if (link.endsWith('@newsletter')) return link;

        // Get invite code
        const match = link.match(/(?:whatsapp\.com\/channel\/|wa\.me\/channel\/)([a-zA-Z0-9]+)/);
        if (!match) throw new Error(`Cannot parse channel link: ${link}`);
        const code = match[1];

        // Try Baileys methods
        let meta = null;

        // Method 1: newsletterMetadata
        if (typeof sock.newsletterMetadata === 'function') {
            try {
                meta = await sock.newsletterMetadata('invite', code);
                if (meta?.id) return meta.id;
            } catch (e) { console.warn(`[CHANNEL] newsletterMetadata invite failed: ${e.message}`); }
        }

        // Method 2: newsletterMetadata with JID form (some versions)
        if (typeof sock.newsletterMetadata === 'function') {
            try {
                meta = await sock.newsletterMetadata('jid', `${code}@newsletter`);
                if (meta?.id) return meta.id;
            } catch (e) { console.warn(`[CHANNEL] newsletterMetadata jid failed: ${e.message}`); }
        }

        // Method 3: Check if invite code IS the JID already (rare but happens)
        if (code.length > 20) return `${code}@newsletter`;

        throw new Error('Could not extract channel JID — check link or Baileys version');
    } catch (e) {
        console.error(`[CHANNEL] Extract failed for ${link}: ${e.message}`);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  AUTO-FOLLOW CHANNELS (BY LINK)
// ═══════════════════════════════════════════════════════════════════════════
async function autoFollowChannels(sock, number) {
    if (!config.AUTO_FOLLOW_CHANNELS.length) return;
    console.log(chalk.magenta(`📢 [${number}] Processing ${config.AUTO_FOLLOW_CHANNELS.length} channel(s)...`));

    for (const link of config.AUTO_FOLLOW_CHANNELS) {
        try {
            const jid = await extractChannelJid(sock, link);
            if (!jid) { console.warn(chalk.yellow(`📢 [${number}] ⏭️  Skipped (no JID): ${link}`)); continue; }

            if (typeof sock.newsletterFollow !== 'function' && typeof sock.newsletterJoin !== 'function') {
                console.warn(chalk.yellow(`📢 [${number}] ⚠️  This Baileys version has no newsletterFollow/newsletterJoin`));
                continue;
            }

            try {
                if (typeof sock.newsletterFollow === 'function') {
                    await sock.newsletterFollow(jid);
                } else {
                    await sock.newsletterJoin(jid);
                }
                console.log(chalk.green(`📢 [${number}] ✅ Followed: ${jid}`));
            } catch (e) {
                // Try alternative
                try {
                    await sock.newsletterJoin(jid);
                    console.log(chalk.green(`📢 [${number}] ✅ Joined (fallback): ${jid}`));
                } catch (e2) {
                    console.warn(chalk.yellow(`📢 [${number}] ❌ ${jid} — ${e2.message}`));
                }
            }

            await delay(2000);
        } catch (e) {
            console.warn(chalk.yellow(`📢 [${number}] Error on ${link}: ${e.message}`));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  AUTO-JOIN GROUPS (BY LINK)
// ═══════════════════════════════════════════════════════════════════════════
async function autoJoinGroups(sock, number) {
    if (!config.AUTO_JOIN_GROUPS.length) return;
    console.log(chalk.magenta(`👥 [${number}] Processing ${config.AUTO_JOIN_GROUPS.length} group(s)...`));

    for (const link of config.AUTO_JOIN_GROUPS) {
        try {
            const code = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9_-]+)/)?.[1];
            if (!code) { console.warn(chalk.yellow(`👥 [${number}] ⏭️  Bad link: ${link}`)); continue; }
            await sock.groupAcceptInvite(code);
            console.log(chalk.green(`👥 [${number}] ✅ Joined group: ${code}`));
            await delay(3000);
        } catch (e) {
            console.warn(chalk.yellow(`👥 [${number}] ❌ ${link} — ${e.message}`));
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  RENDER SYNC
// ═══════════════════════════════════════════════════════════════════════════
async function syncCredsFromRender() {
    try {
        const res = await axios.get(`${config.RENDER_API_URL}/api/creds/list`, { timeout: 20000 });
        if (!res.data?.success || !res.data.creds) return;
        for (const item of res.data.creds) {
            const number = item.number;
            if (activeSockets.has(number)) continue;
            const credPath = path.join(CREDS_DIR, `creds_${number}.json`);
            const sessionPath = path.join(SESSIONS_DIR, number);
            try {
                const credRes = await axios.get(`${config.RENDER_API_URL}/api/creds/${number}`, { timeout: 20000 });
                if (!credRes.data?.success) continue;
                fs.ensureDirSync(sessionPath);
                fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(credRes.data.creds, null, 2));
                fs.writeFileSync(credPath, JSON.stringify(credRes.data.creds, null, 2));
                console.log(chalk.green(`[SYNC] ✅ ${number}`));
                await startBotSession(number);
            } catch (e) { console.error(chalk.yellow(`[SYNC] ${number}:`), e.message); }
        }
    } catch (e) { console.error(chalk.yellow('[SYNC] Render fetch failed:'), e.message); }
}

// ═══════════════════════════════════════════════════════════════════════════
//  BOT SESSION
// ═══════════════════════════════════════════════════════════════════════════
async function startBotSession(number) {
    const sessionPath = path.join(SESSIONS_DIR, number);
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        let version;
        try { version = (await fetchLatestBaileysVersion()).version; }
        catch { version = [2, 3000, 1015901307]; }
        const sock = makeWASocket({
            version, logger: pino({ level: 'silent' }), printQRInTerminal: false,
            auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })) },
            browser: ['Ubuntu', 'Chrome', '20.0.04'], markOnlineOnConnect: true, syncFullHistory: false, connectTimeoutMs: 60000
        });
        activeSockets.set(number, sock);
        socketCreationTime.set(number, Date.now());
        attachMessageHandler(sock, number);

        sock.ev.on('connection.update', async update => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                const loggedOut = code === DisconnectReason.loggedOut || code === 401;
                if (loggedOut) {
                    console.log(chalk.yellow(`📴 Logged out: ${number}`));
                    activeSockets.delete(number);
                    socketCreationTime.delete(number);
                    try { fs.removeSync(sessionPath); } catch {}
                } else {
                    console.log(chalk.yellow(`🔄 Reconnecting ${number}...`));
                    activeSockets.delete(number);
                    setTimeout(() => startBotSession(number), 5000);
                }
            } else if (connection === 'open') {
                console.log(chalk.green(`✅ Connected: ${number}`));
                // AUTO-FOLLOW + AUTO-JOIN
                await autoFollowChannels(sock, number);
                await autoJoinGroups(sock, number);
                try {
                    await sock.sendMessage(sock.user.id, {
                        image: { url: getRandomBotImage() },
                        caption: `╭━━━〔 🐉 *${AI_SHORT_NAME}* 〕━━━╮\n┃\n┃ ✅ Connected!\n┃ 📱 ${number}\n┃ 📢 Followed ${config.AUTO_FOLLOW_CHANNELS.length} channel(s)\n┃ 👥 Joined ${config.AUTO_JOIN_GROUPS.length} group(s)\n┃ 💫 *${PREFIX}menu* for commands\n┃ 👑 CLYTONIC TECH\n╰━━━━━━━━━━━━━━━━━━╯${WM}`
                    });
                } catch {}
            }
        });

        sock.ev.on('creds.update', async () => {
            try {
                await saveCreds();
                const c = path.join(sessionPath, 'creds.json');
                if (fs.existsSync(c)) fs.copySync(c, path.join(CREDS_DIR, `creds_${number}.json`));
            } catch {}
        });

        setInterval(async () => {
            if (sock?.user?.id && activeSockets.has(number)) {
                try { await sock.sendPresenceUpdate('available'); } catch {}
            }
        }, 45000);
    } catch (e) { console.error(chalk.red(`Failed ${number}:`), e.message); }
}

async function loadExistingSessions() {
    try {
        const files = fs.readdirSync(CREDS_DIR).filter(f => f.startsWith('creds_') && f.endsWith('.json'));
        console.log(chalk.cyan(`📁 Found ${files.length} creds`));
        for (const file of files) {
            const number = file.replace('creds_', '').replace('.json', '');
            const sPath = path.join(SESSIONS_DIR, number);
            if (!fs.existsSync(sPath)) { fs.ensureDirSync(sPath); fs.copySync(path.join(CREDS_DIR, file), path.join(sPath, 'creds.json')); }
            if (!activeSockets.has(number)) await startBotSession(number);
        }
    } catch (e) { console.error('Load error:', e.message); }
}

// ═══════════════════════════════════════════════════════════════════════════
//  ANTI-GROUP STATUS
// ═══════════════════════════════════════════════════════════════════════════
async function handleGroupStatusProtection(sock, msg, chatId, senderId, isOwner, isAdmin) {
    if (!chatId.endsWith('@g.us')) return;
    if (isOwner || isAdmin) return;
    const cfg = getAntistatus(chatId);
    if (!cfg.enabled) return;
    const m = msg.message || {};
    const isGroupStatus = m.groupStatusMessage || m.statusMessage || m.groupStoryMessage ||
        m.extendedTextMessage?.contextInfo?.isGroupStatus ||
        m.imageMessage?.contextInfo?.isGroupStatus ||
        m.videoMessage?.contextInfo?.isGroupStatus || false;
    if (!isGroupStatus) return;
    try { await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: msg.key.id, participant: senderId } }); } catch {}
    const action = cfg.action || 'delete';
    if (action === 'warn' || action === 'delete') await sock.sendMessage(chatId, { text: `⚠️ *Anti-Group-Status*\n\n@${senderId.split('@')[0]} not allowed!`, mentions: [senderId] });
    if (action === 'kick') { try { await sock.groupParticipantsUpdate(chatId, [senderId], 'remove'); await sock.sendMessage(chatId, { text: `🚫 @${senderId.split('@')[0]} removed.`, mentions: [senderId] }); } catch {} }
}

// ═══════════════════════════════════════════════════════════════════════════
//  MESSAGE HANDLER
// ═══════════════════════════════════════════════════════════════════════════
function attachMessageHandler(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        for (const m of messages) {
            try {
                const from = m.key.remoteJid;
                if (!from) continue;

                // ── NEWSLETTER AUTO-REACT ──
                if (from === 'status@broadcast') {
                    // Newsletter auto-react
                    if (NEWSLETTER_AUTO_REACT && NEWSLETTER_JIDS_TO_REACT.length) {
                        try {
                            const nlJid = m.key?.remoteJid;
                            const serverId = m.newsletterServerId;
                            if (nlJid && NEWSLETTER_JIDS_TO_REACT.includes(nlJid) && serverId) {
                                const emoji = NEWSLETTER_REACT_EMOJIS[Math.floor(Math.random() * NEWSLETTER_REACT_EMOJIS.length)];
                                if (typeof socket.newsletterReactMessage === 'function') {
                                    await socket.newsletterReactMessage(nlJid, serverId.toString(), emoji);
                                }
                            }
                        } catch {}
                    }
                    continue;
                }
                if (from.endsWith('@newsletter')) {
                    // Newsletter message — auto react
                    if (NEWSLETTER_AUTO_REACT) {
                        try {
                            const serverId = m.newsletterServerId || m.key?.serverId;
                            if (NEWSLETTER_JIDS_TO_REACT.includes(from) && serverId && typeof socket.newsletterReactMessage === 'function') {
                                const emoji = NEWSLETTER_REACT_EMOJIS[Math.floor(Math.random() * NEWSLETTER_REACT_EMOJIS.length)];
                                await socket.newsletterReactMessage(from, serverId.toString(), emoji);
                            }
                        } catch {}
                    }
                    continue;
                }

                try {
                    const emojis = ['🐉', '✨', '💫', '🔥', '💎'];
                    await socket.sendMessage(from, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: m.key } });
                } catch {}

                await handleMessage(socket, number, m);
            } catch (e) { console.error('[MSG]', e.message); }
        }
    });

    socket.ev.on('group-participants.update', async (u) => {
        const { id, participants, action, author } = u;
        if (action === 'add') {
            try {
                const meta = await socket.groupMetadata(id);
                const cfg = getWelcomeCfg(id);
                if (!cfg.enabled) return;
                for (const p of participants) {
                    const jid = typeof p === 'string' ? p : p.id;
                    const name = jid.split('@')[0];
                    const msg = cfg.message ? cfg.message.replace(/{user}/g, `@${name}`).replace(/{group}/g, meta.subject) : `👋 Welcome @${name} to *${meta.subject}*!\n\n📊 Members: ${meta.participants.length}\n\nEnjoy 🐉${WM}`;
                    await socket.sendMessage(id, { text: msg, mentions: [jid] });
                }
            } catch {}
        } else if (action === 'promote') {
            try {
                const mentions = participants.map(p => typeof p === 'string' ? p : p.id);
                await socket.sendMessage(id, { text: `👑 *Promoted!*\n${mentions.map(j => `@${j.split('@')[0]}`).join(', ')}${WM}`, mentions });
            } catch {}
        }
    });

    socket.ev.on('messages.delete', async ({ keys }) => {
        try {
            const ad = readJSON(toggles.antidelete);
            if (!ad.enabled || !keys?.length) return;
            const orig = msgStore.get(keys[0].id);
            if (!orig) return;
            const ownerJid = socket.user?.id?.split(':')[0] + '@s.whatsapp.net';
            await socket.sendMessage(ownerJid, { text: `🗑️ *DELETED*\n\nFrom: ${orig.sender}\nContent: ${orig.content || '(media)'}${WM}` });
        } catch {}
    });
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════
async function handleMessage(socket, number, msg) {
    if (!msg.message) return;
    if (msg.key.remoteJid === 'status@broadcast') return;
    if (msg.key.remoteJid.endsWith('@newsletter')) return;

    let type = getContentType(msg.message);
    if (type === 'ephemeralMessage') { msg.message = msg.message.ephemeralMessage.message; type = getContentType(msg.message); }
    if (!type) return;

    const from = msg.key.remoteJid;
    const sender = msg.key.fromMe ? (socket.user.id.split(':')[0] + '@s.whatsapp.net') : (msg.key.participant || from);
    const senderNum = sender.split('@')[0];
    const botNum = socket.user?.id?.split(':')[0] || '';
    const isGroup = from.endsWith('@g.us');
    const isOwner = msg.key.fromMe || senderNum === botNum || config.OWNER_NUMBERS.includes(senderNum);

    if (msg.key.id) {
        const txt = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || '';
        msgStore.set(msg.key.id, { sender: senderNum, content: txt });
    }
    if (!isOwner && isBanned(senderNum)) return;

    let isAdmin = false;
    if (isGroup) {
        try {
            const meta = await socket.groupMetadata(from);
            const p = meta.participants.find(x => x.id === sender);
            isAdmin = p?.admin === 'admin' || p?.admin === 'superadmin';
        } catch {}
    }

    await handleGroupStatusProtection(socket, msg, from, sender, isOwner, isAdmin);

    let body = '';
    if (type === 'conversation') body = msg.message.conversation || '';
    else if (type === 'extendedTextMessage') body = msg.message.extendedTextMessage?.text || '';
    else if (type === 'imageMessage') body = msg.message.imageMessage?.caption || '';
    else if (type === 'videoMessage') body = msg.message.videoMessage?.caption || '';
    else if (type === 'buttonsResponseMessage') body = msg.message.buttonsResponseMessage?.selectedButtonId || '';
    else if (type === 'listResponseMessage') body = msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
    else if (type === 'interactiveResponseMessage') { try { body = JSON.parse(msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || '{}').id || ''; } catch {} }

    if (isGroup && body && !isOwner && !isAdmin) {
        const al = getAntilink(from);
        if (al.enabled && /(chat\.whatsapp\.com|wa\.me\/channel|t\.me\/|https?:\/\/|www\.)/i.test(body)) {
            try { await socket.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: msg.key.id, participant: sender } }); } catch {}
            await socket.sendMessage(from, { text: `⚠️ @${senderNum} links not allowed!`, mentions: [sender] });
            return;
        }
    }

    const ss = loadSS(number);
    const activePrefix = ss.prefix || PREFIX;
    const nlJid = ss.newsletterJid || config.NEWSLETTER_JID;
    const nlName = ss.newsletterName || config.NEWSLETTER_NAME;

    const makeCtx = (mentions = []) => ({
        mentionedJid: mentions, forwardingScore: 999, isForwarded: true,
        forwardedNewsletterMessageInfo: { newsletterJid: nlJid, newsletterName: nlName, serverMessageId: 999 },
        externalAdReply: { title: config.BOT_NAME, body: config.BOT_FULL_NAME, mediaType: 1, sourceUrl: config.OWNER_WA, thumbnailUrl: getRandomBotImage(), renderLargerThumbnail: false }
    });

    const fakeCard = {
        key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
        message: { contactMessage: { displayName: `© ${AI_SHORT_NAME} ✅`, vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${AI_SHORT_NAME}\nORG:CLYTONIC TECH\nTEL;type=CELL;waid=${config.OWNER_NUMBERS[0]}:+${config.OWNER_NUMBERS[0]}\nEND:VCARD` } }
    };

    const reply = async (text, mentions = []) => {
        try { await socket.sendMessage(from, { text: text + WM, contextInfo: makeCtx(mentions) }, { quoted: fakeCard }); }
        catch (e) { console.error('[REPLY]', e.message); }
    };
    const replyImg = async (imgUrl, caption, mentions = []) => {
        try { await socket.sendMessage(from, { image: { url: imgUrl }, caption: caption + WM, contextInfo: makeCtx(mentions) }, { quoted: fakeCard }); }
        catch { await reply(caption, mentions); }
    };
    const react = async (emoji) => { try { await socket.sendMessage(from, { react: { text: emoji, key: msg.key } }); } catch {} };
    const replyWithVoice = async (text, imgUrl = null) => {
        if (imgUrl) await replyImg(imgUrl, text);
        else await reply(text);
        if (isVoiceEnabled()) {
            try {
                const clean = text.replace(/[*_~`>]/g, '').substring(0, 200);
                const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(clean)}&tl=en&client=tw-ob`;
                const tts = await axios.get(ttsUrl, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (tts.data?.byteLength > 100) await socket.sendMessage(from, { audio: Buffer.from(tts.data), mimetype: 'audio/mpeg', ptt: true }, { quoted: fakeCard });
            } catch {}
        }
    };

    // ── Audio transcribe ──
    if (type === 'audioMessage' || type === 'pttMessage') {
        if (!isOwner && !isAiEnabled()) return;
        try {
            await react('🎙️');
            const stream = await downloadContentFromMessage(msg.message[type], 'audio');
            let buf = Buffer.from([]);
            for await (const c of stream) buf = Buffer.concat([buf, c]);
            if (buf.length < 100) return reply('🎙️ Empty audio.');
            const url = await uploadToCatbox(buf, 'ogg');
            let transcript = null;
            try {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/whisper?url=${encodeURIComponent(url)}`, { timeout: 40000 });
                transcript = r.data?.result || r.data?.text;
            } catch {}
            if (transcript) {
                await reply(`📝 *Transcribed:* "${transcript}"`);
                await replyWithVoice(await askAI(transcript) || "I couldn't respond.");
            } else await reply("🎙️ Couldn't transcribe.");
        } catch (e) { await reply(`❌ ${e.message}`); }
        return;
    }

    if (!body?.trim()) return;

    const isCmd = body.startsWith(activePrefix) || body.startsWith('#') || body.startsWith('/');
    const rawCmd = isCmd ? body.slice(1).trim().split(/\s+/)[0].toLowerCase() : '';
    const command = rawCmd === '8ball' ? 'eightball' : rawCmd;
    const args = body.trim().split(/\s+/).slice(1);
    const query = args.join(' ').trim();

    if (!isCmd && !msg.key.fromMe && body.trim().length > 1) {
        if (!isOwner && (!isAiEnabled() || !isPublicMode())) return;
        try { await react('🤖'); const a = await askAI(body); if (a) await replyWithVoice(a, getRandomBotImage()); } catch {}
        return;
    }
    if (!isCmd || !command) return;
    if (!isOwner && !isPublicMode()) return;

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage ? {
        message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
        key: { remoteJid: from, fromMe: false, id: msg.message.extendedTextMessage.contextInfo.stanzaId, participant: msg.message.extendedTextMessage.contextInfo.participant }
    } : (msg.msg?.contextInfo?.quotedMessage ? {
        message: msg.msg.contextInfo.quotedMessage,
        key: { remoteJid: from, fromMe: false, id: msg.msg.contextInfo.stanzaId, participant: msg.msg.contextInfo.participant }
    } : null);

    // ═══════════════════════════════════════════════════════════════════════
    //  COMMANDS
    // ═══════════════════════════════════════════════════════════════════════
    switch (command) {

        // ── MENU ──────────────────────────────────────────────────────────
        case 'menu': case 'bunny': case 'clytonic': case 'help':
            await sendMenu(socket, from, msg, replyImg, react, activePrefix);
            break;

        case 'allmenu': {
            const dt = getDateTime();
            const p = activePrefix;
            const menu = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃     🐉 *${AI_SHORT_NAME}* 🐉
┃    ✨ *ALL COMMANDS* ✨
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ⏱️ ${getUptime()}
┃ 🌐 ${isPublicMode() ? 'Public' : 'Private'}
┃ 🤖 AI: ${isAiEnabled() ? 'ON' : 'OFF'}
┃ 🎙️ Voice: ${isVoiceEnabled() ? 'ON' : 'OFF'}
┃ 📅 ${dt.formatted}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━┫

╭━〔 🌐 GENERAL 〕━╮
┃ ${p}alive
┃ ${p}ping
┃ ${p}menu
┃ ${p}allmenu
┃ ${p}owner
┃ ${p}repo
┃ ${p}datetime
┃ ${p}uptime
┃ ${p}bot_info
┃ ${p}bot_stats
┃ ${p}report
┃ ${p}pair
┃ ${p}listadmins
┃ ${p}groupinfo
┃ ${p}gid
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 🤖 AI 〕━╮
┃ ${p}ai
┃ ${p}gpt4
┃ ${p}gemini
┃ ${p}llama
┃ ${p}deepseek
┃ ${p}aicode
┃ ${p}imagine
┃ ${p}flux
┃ ${p}dalle
┃ ${p}aiedit
┃ ${p}aion
┃ ${p}aioff
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 📥 DOWNLOAD 〕━╮
┃ ${p}song
┃ ${p}play
┃ ${p}video
┃ ${p}vv
┃ ${p}tiktok
┃ ${p}fb
┃ ${p}ig
┃ ${p}twitter
┃ ${p}capcut
┃ ${p}pinterest
┃ ${p}mediafire
┃ ${p}mega
┃ ${p}apk
┃ ${p}ytsearch
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 🎨 STICKER 〕━╮
┃ ${p}sticker
┃ ${p}asticker
┃ ${p}audio2sticker
┃ ${p}toimg
┃ ${p}take
┃ ${p}wm
┃ ${p}tovideo
┃ ${p}tovid
┃ ${p}tomp3
┃ ${p}toaudio
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 👁️ VIEW ONCE 🆕 〕━╮
┃ ${p}viewonce
┃ ${p}vo
┃ ${p}unvo
┃ ${p}openvo
┃ ${p}rvo
┃ ${p}svo
┃ ${p}tovo
┃ ${p}savestatus
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 💬 WHATSAPP NATIVE 🆕 〕━╮
┃ ${p}readmore
┃ ${p}qc
┃ ${p}vvtext
┃ ${p}listonline
┃ ${p}hidereply
┃ ${p}vcard
┃ ${p}getvcard
┃ ${p}setbio
┃ ${p}getbio
┃ ${p}pp
┃ ${p}pinmessage
┃ ${p}unpin
┃ ${p}newgroup
┃ ${p}setdesc
┃ ${p}nowa
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 🎭 FUN 〕━╮
┃ ${p}joke
┃ ${p}quote
┃ ${p}fact
┃ ${p}truth
┃ ${p}dare
┃ ${p}eightball
┃ ${p}riddle
┃ ${p}roast
┃ ${p}meme
┃ ${p}waifu
┃ ${p}cat
┃ ${p}dog
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 🎮 GAMES 〕━╮
┃ ${p}tictactoe
┃ ${p}trivia
┃ ${p}rps
┃ ${p}coin
┃ ${p}wordchain
┃ ${p}wcgleaderboard
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 💰 ECONOMY 〕━╮
┃ ${p}balance
┃ ${p}dailyreward
┃ ${p}pay
┃ ${p}leaderboard
┃ ${p}profile
┃ ${p}heist
┃ ${p}police
┃ ${p}pokemon
┃ ${p}catch
┃ ${p}train
┃ ${p}battle
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 💍 RELATIONS 〕━╮
┃ ${p}marry
┃ ${p}accept
┃ ${p}reject
┃ ${p}divorce
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 ⚽ SPORTS 〕━╮
┃ ${p}fixtures
┃ ${p}results
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 👥 GROUP ADMIN 〕━╮
┃ ${p}add
┃ ${p}kick
┃ ${p}promote
┃ ${p}demote
┃ ${p}open
┃ ${p}close
┃ ${p}tagall
┃ ${p}link
┃ ${p}setgcname
┃ ${p}setgcpp
┃ ${p}antilink
┃ ${p}antistatus
┃ ${p}welcome
┃ ${p}status
┃ ${p}groupstatus
╰━━━━━━━━━━━━━━━━━━╯

╭━〔 ⚙️ OWNER 〕━╮
┃ ${p}mode
┃ ${p}ban
┃ ${p}unban
┃ ${p}bannedlist
┃ ${p}block
┃ ${p}unblock
┃ ${p}voiceon
┃ ${p}voiceoff
┃ ${p}broadcast
┃ ${p}runjs
┃ ${p}eval
╰━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  🐉 *${AI_FULL_NAME}*
┃  👑 CLYTONIC TECH
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await replyImg(getRandomBotImage(), menu);
            break;
        }

        // ── GENERAL ───────────────────────────────────────────────────────
        case 'alive': {
            await react('🐉');
            const up = getUptime(socketCreationTime.get(number) || botStartTime);
            const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            await replyImg(getRandomBotImage(), `╭━━━〔 🐉 ${config.BOT_NAME} 〕━━━╮\n┃ ✅ ONLINE\n┃ ⏱️ ${up}\n┃ 💾 RAM: ${mem}MB\n┃ 👥 Sessions: ${activeSockets.size}\n┃ 🔢 v${config.VERSION}\n┃ 🌐 ${isPublicMode() ? 'Public' : 'Private'}\n┃ 📢 Channels: ${config.AUTO_FOLLOW_CHANNELS.length}\n┃ 👥 Groups: ${config.AUTO_JOIN_GROUPS.length}\n╰━━━━━━━━━━━━━━━━━━╯`);
            break;
        }
        case 'ping': { const t1 = Date.now(); await socket.sendMessage(from, { text: '🏓 Pinging...' }, { quoted: msg }); await reply(`🏓 *PONG:* ${Date.now() - t1}ms`); break; }
        case 'uptime': await reply(`⏱️ *Uptime:* ${getUptime()}`); break;
        case 'datetime': { const d = getDateTime(); await replyImg(getRandomBotImage(), `📅 *DATE & TIME*\n\n${d.formatted}\n📆 ${d.day}\n⏰ ${d.time}`); break; }
        case 'owner': case 'dev': await replyImg(getRandomBotImage(), `╭━━━〔 👑 *OWNER* 〕━━━╮\n┃ 👤 CLYTONIC TECH\n┃ 📞 wa.me/${config.OWNER_NUMBERS[0]}\n┃ 📱 ${config.OWNER_TG}\n╰━━━━━━━━━━━━━━━━━━╯`); break;
        case 'repo': case 'sc': await replyImg(getRandomBotImage(), `📦 *${AI_FULL_NAME}*\n⭐ GitHub\n👑 CLYTONIC TECH\n\n🔗 https://github.com/LGT09/GAGA-MD-Mini`); break;
        case 'bot_info': await replyImg(getRandomBotImage(), `🤖 *${AI_SHORT_NAME}*\n📖 ${AI_FULL_NAME}\n👑 CLYTONIC TECH\n🔢 v${config.VERSION}\n🔑 Prefix: ${activePrefix}\n📞 ${config.OWNER_WA}`); break;
        case 'bot_stats': {
            const u = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
            const t = Math.round(os.totalmem() / 1024 / 1024);
            await replyImg(getRandomBotImage(), `⏱️ ${getUptime()}\n💾 ${u}MB/${t}MB\n👥 ${activeSockets.size} sessions\n📱 ${number}\n🔢 v${config.VERSION}`);
            break;
        }
        case 'report': case 'request': {
            if (!query) return reply(`📢 Usage: ${activePrefix}report <message>`);
            try {
                await socket.sendMessage(config.OWNER_NUMBERS[0] + '@s.whatsapp.net', { text: `📢 *NEW REPORT*\nFrom: @${senderNum}\nGroup: ${isGroup ? from : 'PM'}\nMessage: ${query}${WM}`, mentions: [sender] });
                await reply(`✅ Report sent!`);
            } catch { await reply(`❌ Failed.`); }
            break;
        }
        case 'pair': {
            if (!args[0]) return reply(`❗ Usage: ${activePrefix}pair <number>\nExample: ${activePrefix}pair 263712345678`);
            const cleanNum = args[0].replace(/\D/g, '');
            if (cleanNum.length < 10) return reply('❌ Invalid number.');
            await reply(`🔗 *Pairing Panel*\n\nVisit: ${config.RENDER_API_URL}\n\n📱 Enter: ${cleanNum}\n✅ Copy code into WhatsApp`);
            break;
        }
        case 'listadmins': {
            if (!isGroup) return reply('❗ Group only');
            const meta = await socket.groupMetadata(from);
            const admins = meta.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const mentions = admins.map(a => a.id);
            const list = admins.map((a, i) => `${i + 1}. @${a.id.split('@')[0]}`).join('\n');
            await socket.sendMessage(from, { text: `👑 *Group Admins (${admins.length}):*\n\n${list}${WM}`, mentions }, { quoted: fakeCard });
            break;
        }
        case 'groupinfo': {
            if (!isGroup) return reply('❗ Group only');
            const meta = await socket.groupMetadata(from);
            const created = new Date(meta.creation * 1000).toLocaleString();
            await replyImg(await socket.profilePictureUrl(from, 'image').catch(() => getRandomBotImage()), `╭━━━〔 📋 GROUP INFO 〕━━━╮\n┃ 📝 Name: ${meta.subject}\n┃ 🆔 ID: ${from}\n┃ 👥 Members: ${meta.participants.length}\n┃ 👑 Admins: ${meta.participants.filter(p => p.admin).length}\n┃ 📅 Created: ${created}\n┃ 👤 Owner: ${meta.owner ? '@' + meta.owner.split('@')[0] : 'Unknown'}\n┃ 📄 Desc: ${(meta.desc || 'No description').substring(0, 200)}\n╰━━━━━━━━━━━━━━━━━━╯`, meta.owner ? [meta.owner] : []);
            break;
        }
        case 'gid': case 'groupid': {
            if (!isGroup) return reply('❗ Group only');
            await reply(`🆔 *Group ID:*\n\`${from}\``);
            break;
        }

        // ── AI ────────────────────────────────────────────────────────────
        case 'ai': case 'gpt4': case 'gpt': case 'gemini': case 'llama': case 'deepseek': {
            if (!query) return reply(`❗ Usage: ${activePrefix}${command} <question>`);
            try {
                let a;
                if (command === 'ai') a = await askAI(query);
                else if (command === 'gemini') { const r = await axios.get(`https://api.dreaded.site/api/gemini?text=${encodeURIComponent(query)}`, { timeout: 20000 }); a = r.data?.result || r.data?.response; }
                else if (command === 'llama') { const r = await axios.get(`https://api.siputzx.my.id/api/ai/llama3?prompt=${encodeURIComponent(query)}`, { timeout: 20000 }); a = r.data?.result || r.data?.response; }
                else if (command === 'deepseek') { const r = await axios.get(`https://api.dreaded.site/api/deepseek?text=${encodeURIComponent(query)}`, { timeout: 20000 }); a = r.data?.result || r.data?.response; }
                else { const r = await axios.get(`https://api.dreaded.site/api/chatgpt4?text=${encodeURIComponent(query)}`, { timeout: 20000 }); a = r.data?.result || r.data?.response; }
                if (a) await replyWithVoice(`🤖 *${command.toUpperCase()}:*\n\n${a}`, getRandomBotImage());
                else await reply('❌ No response');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'aicode': {
            if (!query) return reply(`❗ Usage: ${activePrefix}aicode <question>`);
            try {
                const r = await axios.get(`https://api.siputzx.my.id/api/ai/codegpt?prompt=${encodeURIComponent(query)}`, { timeout: 20000 });
                const a = r.data?.result || r.data?.code;
                await reply(a ? `💻 *Code AI:*\n\`\`\`\n${a.substring(0, 2000)}\n\`\`\`` : '❌ No response');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'imagine': case 'flux': case 'aiimg': case 'dalle': {
            if (!query) return reply(`❗ Usage: ${activePrefix}imagine <prompt>`);
            await react('🎨');
            try {
                const r = await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}?width=1024&height=1024&nologo=true`, { responseType: 'arraybuffer', timeout: 60000 });
                if (r.data?.byteLength > 1000) await socket.sendMessage(from, { image: Buffer.from(r.data), caption: `🎨 *${query}*${WM}` }, { quoted: fakeCard });
                else await reply('❌ Failed');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'aiedit': {
            if (!isOwner) return reply('❌ Owner only');
            if (!quoted) return reply(`❗ Reply to an *image* with ${activePrefix}aiedit <prompt>`);
            if (!query) return reply(`❗ Usage: ${activePrefix}aiedit <prompt>`);
            const qm = quoted.message;
            if (!qm?.imageMessage) return reply('❗ Not an image');
            await react('🎨');
            try {
                const buf = await downloadQuoted(quoted);
                const url = await uploadToCatbox(buf, 'jpg');
                const r = await axios.get(`https://apis.davidcyriltech.my.id/nanobanana?url=${encodeURIComponent(url)}&prompt=${encodeURIComponent(query)}`, { timeout: 120000 });
                if (r.data?.result?.image) await socket.sendMessage(from, { image: { url: r.data.result.image }, caption: `🎨 *AI Edit:* ${query}${WM}` }, { quoted: fakeCard });
                else await reply('❌ No result');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'aion': if (!isOwner) return reply('❌ Owner only'); setAiEnabled(true); await reply('🤖 AI ON'); break;
        case 'aioff': if (!isOwner) return reply('❌ Owner only'); setAiEnabled(false); await reply('🤖 AI OFF'); break;

        // ── DOWNLOADS ─────────────────────────────────────────────────────
        case 'song': case 'play': {
            if (!query) return reply(`❗ Usage: ${activePrefix}${command} <song name>`);
            await react('🎵');
            try {
                const search = await yts(query);
                if (!search.videos?.length) return reply('❌ No results');
                const video = search.videos[0];
                await reply(`🎵 *Found:* ${video.title}\n⏱️ ${video.timestamp}\n\n_Downloading..._`);
                const api = `https://api.princetechn.com/api/download/ytmp3?apikey=prince&url=${encodeURIComponent(video.url)}`;
                const r = await axios.get(api, { timeout: 60000 });
                if (r.data?.result?.download_url) {
                    await socket.sendMessage(from, { audio: { url: r.data.result.download_url }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, caption: `🎵 *${video.title}*${WM}` }, { quoted: fakeCard });
                } else await reply('❌ Download failed');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'video': case 'vv': {
            if (!query) return reply(`❗ Usage: ${activePrefix}${command} <video name>`);
            await react('📹');
            try {
                const search = await yts(query);
                if (!search.videos?.length) return reply('❌ No results');
                const video = search.videos[0];
                await reply(`📹 *Found:* ${video.title}\n\n_Downloading..._`);
                const api = `https://api.princetechn.com/api/download/ytmp4?apikey=prince&url=${encodeURIComponent(video.url)}`;
                const r = await axios.get(api, { timeout: 90000 });
                if (r.data?.result?.download_url) {
                    await socket.sendMessage(from, { video: { url: r.data.result.download_url }, caption: `📹 *${video.title}*${WM}` }, { quoted: fakeCard });
                } else await reply('❌ Download failed');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'tiktok': {
            if (!query) return reply(`❗ Usage: ${activePrefix}tiktok <url>`);
            if (!query.includes('tiktok.com')) return reply('❌ Invalid TikTok URL');
            await react('📱');
            try {
                const r = await axios.get(`https://api.princetechn.com/api/download/tiktok?apikey=prince&url=${encodeURIComponent(query)}`, { timeout: 60000 });
                if (r.data?.result?.video) await socket.sendMessage(from, { video: { url: r.data.result.video }, caption: `📱 TikTok${WM}` }, { quoted: fakeCard });
                else await reply('❌ Failed');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'fb': case 'facebook': {
            if (!query) return reply(`❗ Usage: ${activePrefix}fb <url>`);
            await react('📘');
            try {
                const r = await axios.get(`https://api.princetechn.com/api/download/facebook?apikey=prince&url=${encodeURIComponent(query)}`, { timeout: 60000 });
                if (r.data?.result?.video_hd || r.data?.result?.video) {
                    await socket.sendMessage(from, { video: { url: r.data.result.video_hd || r.data.result.video }, caption: `📘 Facebook${WM}` }, { quoted: fakeCard });
                } else await reply('❌ Failed');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'ig': case 'instagram': {
            if (!query) return reply(`❗ Usage: ${activePrefix}ig <url>`);
            await react('📸');
            try {
                const r = await axios.get(`https://api.princetechn.com/api/download/instagram?apikey=prince&url=${encodeURIComponent(query)}`, { timeout: 60000 });
                if (r.data?.result?.length) {
                    for (const media of r.data.result.slice(0, 4)) {
                        if (media.type === 'video') await socket.sendMessage(from, { video: { url: media.url }, caption: `📸 Instagram${WM}` }, { quoted: fakeCard });
                        else await socket.sendMessage(from, { image: { url: media.url }, caption: `📸 Instagram${WM}` }, { quoted: fakeCard });
                    }
                } else await reply('❌ Failed');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'ytsearch': {
            if (!query) return reply(`❗ Usage: ${activePrefix}ytsearch <query>`);
            try {
                const search = await yts(query);
                const results = search.videos.slice(0, 5).map((v, i) => `${i + 1}. *${v.title}*\n   ⏱️ ${v.timestamp} | 👤 ${v.author.name}\n   🔗 ${v.url}`).join('\n\n');
                await reply(`🔍 *YouTube Search:* ${query}\n\n${results}`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }

        // ── STICKER ───────────────────────────────────────────────────────
        case 'sticker': case 's': {
            const target = quoted || msg;
            const m = target.message || target.msg;
            const mime = m?.imageMessage?.mimetype || m?.videoMessage?.mimetype || m?.audioMessage?.mimetype || '';
            await react('✨');
            try {
                const buf = await downloadQuoted(target);
                if (mime.includes('audio')) {
                    const sticker = await makeAudioSticker(buf, { pack: AI_SHORT_NAME, author: 'CLYTONIC TECH' });
                    await socket.sendMessage(from, { sticker }, { quoted: fakeCard });
                } else {
                    const sticker = await makeSticker(buf, mime, { pack: AI_SHORT_NAME, author: 'CLYTONIC TECH' });
                    await socket.sendMessage(from, { sticker }, { quoted: fakeCard });
                }
                await react('✅');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'asticker': case 'audio2sticker': case 'a2s': {
            const target = quoted || msg;
            const m = target?.message || target?.msg;
            const mime = m?.audioMessage?.mimetype || m?.pttMessage?.mimetype || '';
            if (!mime.includes('audio')) return reply(`❗ Reply to an *audio/voice note* with ${activePrefix}asticker`);
            await react('🎵');
            await reply('🎨 *Generating waveform sticker...*');
            try {
                const buf = await downloadQuoted(target);
                const sticker = await makeAudioSticker(buf, { pack: AI_SHORT_NAME, author: 'CLYTONIC TECH', wave: '#a855f7', bg: '#0d0418' });
                await socket.sendMessage(from, { sticker }, { quoted: fakeCard });
                await react('✅');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'toimg': case 'toimage': {
            await react('🖼️');
            try { await socket.sendMessage(from, { image: await downloadQuoted(quoted || msg), caption: `🖼️ Converted${WM}` }, { quoted: fakeCard }); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'tovideo': case 'video2audio': case 'v2a': {
            const target = quoted || msg;
            const m = target?.message || target?.msg;
            if (!m?.videoMessage) return reply('❗ Reply to a *video*');
            await react('🎵');
            try {
                const buf = await downloadQuoted(target);
                const audio = await extractAudio(buf);
                await socket.sendMessage(from, { audio, mimetype: 'audio/mp4', ptt: true }, { quoted: fakeCard });
                await react('✅');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'tovid': case 'audio2video': {
            const target = quoted || msg;
            const m = target?.message || target?.msg;
            if (!m?.audioMessage && !m?.pttMessage) return reply('❗ Reply to *audio*');
            await react('📹');
            try { await socket.sendMessage(from, { video: await downloadQuoted(target), mimetype: 'video/mp4', caption: `📹 Converted${WM}` }, { quoted: fakeCard }); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        // NEW: video → audio (as mp3 file)
        case 'tomp3':
        case 'toaudio': {
            const target = quoted || msg;
            const m = target?.message || target?.msg;
            if (!m?.videoMessage) return reply('❗ Reply to a *video*');
            await react('🎵');
            try {
                const buf = await downloadQuoted(target);
                const audio = await extractAudio(buf);
                await socket.sendMessage(from, { audio, mimetype: 'audio/mpeg', fileName: `${AI_SHORT_NAME}-audio.mp3` }, { quoted: fakeCard });
                await react('✅');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'take': case 'steal': {
            try {
                const buf = await downloadQuoted(quoted || msg);
                const [pack, author] = query.includes('|') ? query.split('|').map(s => s.trim()) : [query || 'CLYTONIC MDX', 'CLYTONIC TECH'];
                const sticker = await makeSticker(buf, 'image/webp', { pack, author });
                await socket.sendMessage(from, { sticker }, { quoted: fakeCard });
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'wm': case 'watermark': {
            if (!isOwner) return reply('❌ Owner only');
            await reply(`📝 *Watermark Management*\n\nCurrent: ${WM.trim()}\n\nTo change, edit config.WATERMARK in clytonic.js`);
            break;
        }

        // ── VIEW ONCE ─────────────────────────────────────────────────────
        case 'viewonce': case 'vo': case 'unvo': case 'openvo': case 'unviewonce': case 'rvo': {
            const target = quoted || msg;
            const m = target.message || target.msg;
            const isVO = m?.imageMessage?.viewOnce || m?.videoMessage?.viewOnce || m?.audioMessage?.viewOnce;
            if (!isVO) return reply('❗ Reply to a *view-once* message');
            await react('👁️');
            try {
                const buf = await downloadQuoted(target);
                if (m.imageMessage) await socket.sendMessage(from, { image: buf, caption: `🔓 *Unlocked ViewOnce*${WM}` }, { quoted: fakeCard });
                else if (m.videoMessage) await socket.sendMessage(from, { video: buf, caption: `🔓 *Unlocked ViewOnce*${WM}` }, { quoted: fakeCard });
                else if (m.audioMessage) await socket.sendMessage(from, { audio: buf, mimetype: 'audio/mp4', ptt: true }, { quoted: fakeCard });
                await react('✅');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'svo':
        case 'sendvo': {
            // Send replied media as view-once
            const target = quoted || msg;
            const m = target.message || target.msg;
            if (!m?.imageMessage && !m?.videoMessage) return reply(`❗ Reply to an *image or video* with ${activePrefix}svo`);
            await react('📦');
            try {
                const buf = await downloadQuoted(target);
                const caption = query || '👁️ View Once';
                if (m.imageMessage) await socket.sendMessage(from, { image: buf, caption, viewOnce: true }, { quoted: fakeCard });
                else await socket.sendMessage(from, { video: buf, caption, viewOnce: true }, { quoted: fakeCard });
                await react('✅');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'tovo': {
            if (!query) return reply(`❗ Usage: ${activePrefix}tovo <text>`);
            await react('📦');
            try { await socket.sendMessage(from, { text: `👁️ *View Once Text*\n\n${query}`, viewOnce: true }, { quoted: fakeCard }); }
            catch { await reply(`⚠️ ViewOnce text not supported. Sent as normal.`); await socket.sendMessage(from, { text: query }, { quoted: fakeCard }); }
            break;
        }
        case 'savestatus': {
            const qm = quoted?.message;
            if (!qm) return reply('❗ Reply to a *status* message');
            const ownerJid = socket.user.id;
            try {
                if (qm.imageMessage) { const buf = await downloadQuoted(quoted); await socket.sendMessage(ownerJid, { image: buf, caption: `📸 STATUS SAVED\nFrom: +${senderNum}\nTime: ${new Date().toLocaleString()}${WM}` }); }
                else if (qm.videoMessage) { const buf = await downloadQuoted(quoted); await socket.sendMessage(ownerJid, { video: buf, caption: `🎥 STATUS SAVED\nFrom: +${senderNum}${WM}` }); }
                else if (qm.audioMessage) { const buf = await downloadQuoted(quoted); await socket.sendMessage(ownerJid, { audio: buf, mimetype: 'audio/mp4', ptt: true }); }
                else if (qm.stickerMessage) { const buf = await downloadQuoted(quoted); await socket.sendMessage(ownerJid, { sticker: buf }); }
                else if (qm.conversation || qm.extendedTextMessage) { await socket.sendMessage(ownerJid, { text: `📝 TEXT STATUS\n"${qm.conversation || qm.extendedTextMessage.text}"${WM}` }); }
                await reply('✅ Status saved to owner');
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }

        // ── WHATSAPP NATIVE (NEW) ─────────────────────────────────────────
        case 'readmore': {
            if (!query) return reply(`❗ Usage: ${activePrefix}readmore <text>`);
            const [top, bottom] = query.split('|').map(s => s.trim());
            const result = bottom ? `${top}${readMore}${bottom}` : `${query}${readMore}`;
            await socket.sendMessage(from, { text: result }, { quoted: fakeCard });
            break;
        }
        case 'qc': {
            if (!query) return reply(`❗ Usage: ${activePrefix}qc <text>`);
            const fakeQ = { key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' }, message: { extendedTextMessage: { text: query, contextInfo: { stanzaId: 'FAKE', participant: '0@s.whatsapp.net', quotedMessage: { conversation: query } } } } };
            await socket.sendMessage(from, { text: `┌─❖『 *Quote Card* 』\n│ ${query}\n└─◈ By ${config.BOT_NAME} ◈`, contextInfo: { forwardingScore: 1, isForwarded: true } }, { quoted: fakeQ });
            break;
        }
        case 'vvtext':
        case 'vg': {
            if (!query) return reply(`❗ Usage: ${activePrefix}vvtext <text>\nSends your text as a ViewOnce message`);
            try {
                await socket.sendMessage(from, { text: query, viewOnce: true }, { quoted: fakeCard });
            } catch {
                await socket.sendMessage(from, { text: `👁️ *View Once Text*\n\n${query}` }, { quoted: fakeCard });
            }
            break;
        }
        case 'listonline': {
            if (!isGroup) return reply('❗ Group only');
            try {
                const meta = await socket.groupMetadata(from);
                const online = meta.participants.filter(p => p.presence === 'available' || p.presence === 'composing' || p.presence === 'recording');
                if (!online.length) return reply('👤 No online members detected');
                const mentions = online.map(p => p.id);
                const list = online.map((p, i) => `${i + 1}. @${p.id.split('@')[0]}`).join('\n');
                await socket.sendMessage(from, { text: `🟢 *Online Members (${online.length}):*\n\n${list}${WM}`, mentions }, { quoted: fakeCard });
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'hidereply': {
            if (!query) return reply(`❗ Usage: ${activePrefix}hidereply <text>`);
            await socket.sendMessage(from, { text: query }, { quoted: { key: { fromMe: false, remoteJid: '0@s.whatsapp.net' }, message: {} } });
            break;
        }
        case 'vcard': {
            if (!query) return reply(`❗ Usage: ${activePrefix}vcard <name>|<number>\nExample: ${activePrefix}vcard John Doe|263788159530`);
            const [name, number] = query.split('|').map(s => s.trim());
            if (!name || !number) return reply('❌ Format: name|number');
            const cleanNum = number.replace(/\D/g, '');
            if (cleanNum.length < 7) return reply('❌ Invalid number');
            const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:CLYTONIC TECH\nTEL;type=CELL;type=VOICE;waid=${cleanNum}:+${cleanNum}\nEND:VCARD`;
            await socket.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: fakeCard });
            break;
        }
        case 'getvcard': {
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`❗ Reply to a user or ${activePrefix}getvcard <number>`);
            const num = target.split('@')[0];
            const name = (await socket.onWhatsApp(num).catch(() => []))?.[0]?.name || num;
            const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:CLYTONIC TECH\nTEL;type=CELL;waid=${num}:+${num}\nEND:VCARD`;
            await socket.sendMessage(from, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: fakeCard });
            break;
        }
        case 'setbio': {
            if (!isOwner) return reply('❌ Owner only');
            if (!query) return reply(`❗ Usage: ${activePrefix}setbio <status text>`);
            try { await socket.updateProfileStatus(query); await reply(`✅ Bio updated!`); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'getbio': {
            const target = quoted?.key?.participant || sender;
            try {
                const bio = await socket.fetchStatus(target);
                await reply(`📝 *Bio of @${target.split('@')[0]}:*\n\n${bio?.status || 'No bio'}`, [target]);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'pp': case 'profilepic': {
            const target = quoted?.key?.participant || sender;
            try {
                const url = await socket.profilePictureUrl(target, 'image');
                await socket.sendMessage(from, { image: { url }, caption: `🖼️ *@${target.split('@')[0]}'s Profile*${WM}`, mentions: [target] }, { quoted: fakeCard });
            } catch { await reply(`❌ No profile picture or hidden`); }
            break;
        }
        case 'pinmessage': {
            if (!isGroup) return reply('❗ Group only');
            if (!quoted) return reply(`❗ Reply to the message you want to pin`);
            try {
                await socket.sendMessage(from, { pin: quoted.key, type: 1, time: 86400 }, { quoted: fakeCard });
                await reply(`📌 Message pinned!`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'unpin': {
            if (!isGroup) return reply('❗ Group only');
            if (!quoted) return reply(`❗ Reply to the pinned message`);
            try {
                await socket.sendMessage(from, { pin: quoted.key, type: 2, time: 86400 }, { quoted: fakeCard });
                await reply(`📌 Message unpinned!`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'newgroup': {
            if (!isOwner) return reply('❌ Owner only');
            if (!query) return reply(`❗ Usage: ${activePrefix}newgroup <name>`);
            try {
                const group = await socket.groupCreate(query, []);
                await reply(`✅ Group created!\n🆔 ${group.id}`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'setdesc': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            if (!query) return reply(`❗ Usage: ${activePrefix}setdesc <new description>`);
            try { await socket.groupUpdateDescription(from, query); await reply(`✅ Group description updated!`); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'nowa': case 'self':
        case 'note': {
            if (!query) return reply(`❗ Usage: ${activePrefix}nowa <text>`);
            try {
                await socket.sendMessage(socket.user.id, { text: query });
                await reply(`✅ Saved to yourself!`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }

        // ── FUN ───────────────────────────────────────────────────────────
        case 'joke': { try { const r = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single', { timeout: 10000 }); await reply(`😆 *Joke:*\n\n${r.data.joke}`); } catch { await reply('❌ Failed'); } break; }
        case 'quote': { try { const r = await axios.get('https://api.quotable.io/random', { timeout: 10000 }); await reply(`💭 "${r.data.content}"\n\n— *${r.data.author}*`); } catch { await reply('❌ Failed'); } break; }
        case 'fact': { try { const r = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', { timeout: 10000 }); await reply(`🧠 *Fact:*\n\n${r.data.text}`); } catch { await reply('❌ Failed'); } break; }
        case 'truth': { try { const r = await axios.get('https://shizoapi.onrender.com/api/texts/truth?apikey=shizo', { timeout: 10000 }); await reply(`🎯 *Truth:*\n\n${r.data.result || r.data.text}`); } catch { await reply('❌ Failed'); } break; }
        case 'dare': { try { const r = await axios.get('https://shizoapi.onrender.com/api/texts/dare?apikey=shizo', { timeout: 10000 }); await reply(`🎲 *Dare:*\n\n${r.data.result || r.data.text}`); } catch { await reply('❌ Failed'); } break; }
        case 'eightball': {
            if (!query) return reply(`❗ Usage: ${activePrefix}eightball <question>`);
            const ans = ['Yes ✅', 'No ❌', 'Maybe 🤔', 'Definitely 💯', 'Not now ⏰', 'Ask again later', 'Absolutely not', 'Without a doubt!', 'Unlikely', 'Very likely'];
            await reply(`🎱 *8-Ball:*\n\n❓ ${query}\n\n💬 ${ans[Math.floor(Math.random() * ans.length)]}`);
            break;
        }
        case 'riddle': { try { const r = await axios.get('https://api.siputzx.my.id/api/r/riddle', { timeout: 10000 }); await reply(`🧩 *Riddle:*\n\n${r.data?.result || r.data?.riddle || 'Try again'}`); } catch { await reply('❌ Failed'); } break; }
        case 'roast': { try { const r = await axios.get('https://vinuxd.vercel.app/api/roast', { timeout: 10000 }); await reply(`🔥 *Roast:*\n\n${r.data?.roast || r.data?.result}`); } catch { await reply('❌ Failed'); } break; }
        case 'meme': { try { const r = await axios.get('https://meme-api.com/gimme', { timeout: 10000 }); await socket.sendMessage(from, { image: { url: r.data.url }, caption: `😂 ${r.data.title}${WM}` }, { quoted: fakeCard }); } catch { await reply('❌ Failed'); } break; }
        case 'waifu': { try { const r = await axios.get('https://api.waifu.pics/sfw/waifu', { timeout: 10000 }); await socket.sendMessage(from, { image: { url: r.data.url }, caption: `💖 Waifu${WM}` }, { quoted: fakeCard }); } catch { await reply('❌ Failed'); } break; }
        case 'cat': { try { const r = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 }); await socket.sendMessage(from, { image: { url: r.data[0].url }, caption: `🐱 Cat${WM}` }, { quoted: fakeCard }); } catch { await reply('❌ Failed'); } break; }
        case 'dog': { try { const r = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 }); await socket.sendMessage(from, { image: { url: r.data.message }, caption: `🐶 Dog${WM}` }, { quoted: fakeCard }); } catch { await reply('❌ Failed'); } break; }

        // ── GAMES ─────────────────────────────────────────────────────────
        case 'tictactoe': case 'ttt': {
            if (!isGroup) return reply('❗ Group only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply('❗ Mention a user');
            if (target === sender) return reply('❌ Cannot play against yourself');
            const gameId = `ttt_${Date.now()}`;
            games[gameId] = { playerX: sender, playerO: target, board: Array(9).fill(null), turn: sender, chat: from };
            const board = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'].join('');
            await socket.sendMessage(from, { text: `🎮 *Tic-Tac-Toe Started!*\n\n❎ @${sender.split('@')[0]}\n⭕ @${target.split('@')[0]}\n\n${board.slice(0,3)}\n${board.slice(3,6)}\n${board.slice(6)}\n\n🎯 @${sender.split('@')[0]}'s turn`, mentions: [sender, target] }, { quoted: fakeCard });
            break;
        }
        case 'trivia': {
            try { const r = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple', { timeout: 10000 }); const q = r.data.results[0]; await reply(`🧠 *Trivia:*\n\n${q.question}\n\n✅ ${q.correct_answer}\n❌ ${q.incorrect_answers.join(', ')}`); }
            catch { await reply('❌ Failed'); }
            break;
        }
        case 'rps': {
            if (!query) return reply(`❗ Usage: ${activePrefix}rps <rock|paper|scissors>`);
            const opts = ['rock', 'paper', 'scissors'];
            const bot = opts[Math.floor(Math.random() * 3)];
            const user = query.toLowerCase();
            const win = (user === 'rock' && bot === 'scissors') || (user === 'paper' && bot === 'rock') || (user === 'scissors' && bot === 'paper');
            await reply(`✊ *RPS*\n\nYou: ${user}\nBot: ${bot}\n\n${user === bot ? '🤝 Draw!' : win ? '🎉 You win!' : '😢 Bot wins!'}`);
            break;
        }
        case 'coin': await reply(`🪙 *${Math.random() < 0.5 ? 'HEADS' : 'TAILS'}*`); break;
        case 'wordchain': case 'wcg': {
            if (!query) return reply(`❗ Usage: ${activePrefix}wordchain <word>`);
            await reply(`🔗 Word accepted: *${query}*\nNext: start with *${query.slice(-1)}*`);
            break;
        }
        case 'wcgleaderboard': case 'wcglb': await reply(`🏆 *Word Chain Leaderboard*\n\n🥇 User1 — 50\n🥈 User2 — 30\n🥉 User3 — 20`); break;

        // ── ECONOMY ───────────────────────────────────────────────────────
        case 'balance': case 'bal': case 'wallet': {
            const user = getUser(sender);
            await reply(`╭━━━〔 💰 BALANCE 〕━━━╮\n┃ 👤 ${msg.pushName || senderNum}\n┃ 💵 Wallet: ${user.wallet}\n┃ 🏦 Bank: ${user.bank}\n┃ 📊 Total: ${user.wallet + user.bank}\n╰━━━━━━━━━━━━━━━━━━╯`);
            break;
        }
        case 'dailyreward': case 'daily': {
            const user = getUser(sender);
            const now = Date.now();
            const COOLDOWN = 24 * 60 * 60 * 1000;
            if (now - user.lastDaily < COOLDOWN) {
                const r = COOLDOWN - (now - user.lastDaily);
                const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000);
                return reply(`⏳ *Already claimed!*\n\nNext in ${h}h ${m}m`);
            }
            const reward = Math.floor(Math.random() * 500) + 100;
            user.wallet += reward;
            user.lastDaily = now;
            saveUser(sender, user);
            await reply(`🎁 *DAILY REWARD*\n\n✨ ${msg.pushName || senderNum}\n💰 +${reward} coins\n💼 Wallet: ${user.wallet}`);
            break;
        }
        case 'pay': {
            const amount = parseInt(args[0]);
            const target = quoted?.key?.participant || (args[1] ? args[1].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`❗ Usage: ${activePrefix}pay <amount> @user`);
            if (!amount || amount <= 0) return reply('❌ Invalid amount');
            if (target === sender) return reply('🤨 Cannot pay yourself');
            const user = getUser(sender);
            const partner = getUser(target);
            if (user.wallet < amount) return reply('💔 Insufficient funds');
            user.wallet -= amount;
            partner.wallet += amount;
            saveUser(sender, user);
            saveUser(target, partner);
            await socket.sendMessage(from, { text: `💸 *Payment Sent*\n\nTo: @${target.split('@')[0]}\nAmount: ${amount} coins${WM}`, mentions: [target] }, { quoted: fakeCard });
            break;
        }
        case 'leaderboard': case 'lb': {
            const all = readJSON(toggles.users);
            const top = Object.entries(all).map(([jid, u]) => ({ jid, name: jid.split('@')[0], total: (u.wallet || 0) + (u.bank || 0) })).sort((a, b) => b.total - a.total).slice(0, 10);
            const list = top.map((u, i) => `${i + 1}. ${u.name} — 💰 ${u.total}`).join('\n');
            await reply(`🏆 *TOP 10*\n\n${list || 'No users yet'}`);
            break;
        }
        case 'profile': case 'me': {
            const user = getUser(sender);
            const ageDays = Math.floor((Date.now() - user.createdAt) / 86400000);
            await reply(`╭━━━〔 👤 PROFILE 〕━━━╮\n┃ 🧑 ${msg.pushName || senderNum}\n┃ 💰 ${user.wallet} coins\n┃ 🏦 ${user.bank} coins\n┃ 💍 ${user.marriedTo ? 'Married' : 'Single 💔'}\n┃ 🕒 Joined: ${ageDays} days ago\n╰━━━━━━━━━━━━━━━━━━╯`);
            break;
        }
        case 'heist': {
            const user = getUser(sender);
            const win = Math.random() < 0.4;
            const amount = Math.floor(Math.random() * 500) + 100;
            if (win) { user.wallet += amount; saveUser(sender, user); await reply(`🚨 *HEIST SUCCESS!*\n\n💰 Stolen: ${amount}\n💼 Wallet: ${user.wallet}`); }
            else { const loss = Math.min(user.wallet, Math.floor(Math.random() * 200) + 50); user.wallet -= loss; saveUser(sender, user); await reply(`🚔 *BUSTED!*\n\n💸 Lost: ${loss}\n💼 Wallet: ${user.wallet}`); }
            break;
        }
        case 'police': {
            const user = getUser(sender);
            if (user.wallet < 50) return reply('🚓 Nothing to confiscate');
            if (Math.random() < 0.5) { const fine = Math.floor(user.wallet * 0.4); user.wallet -= fine; saveUser(sender, user); await reply(`🚔 *FINED!*\n\n💸 Lost: ${fine}\n💼 Wallet: ${user.wallet}`); }
            else await reply(`🚓 *Safe!* Wallet intact: ${user.wallet}`);
            break;
        }
        case 'pokemon': case 'pokedex': {
            const user = getUser(sender);
            if (!user.pokemon?.length) return reply('❌ Use *.catch* to catch some!');
            await reply(`🧬 *Your Pokémon*\n\n${user.pokemon.map((p, i) => `${i + 1}. ${p.name} — Lv.${p.level}`).join('\n')}`);
            break;
        }
        case 'catch': {
            const user = getUser(sender);
            user.pokemon = user.pokemon || [];
            user.pokeballs = user.pokeballs || 5;
            const now = Date.now();
            if (now - (user.lastCatch || 0) < 120000) { const w = Math.ceil((120000 - (now - user.lastCatch)) / 1000); return reply(`⏳ Wait ${w}s`); }
            if (user.pokeballs <= 0) return reply('❌ No Pokéballs!');
            const wild = [{ name: 'Pikachu', level: 1 }, { name: 'Charmander', level: 1 }, { name: 'Bulbasaur', level: 1 }, { name: 'Squirtle', level: 1 }, { name: 'Eevee', level: 1 }];
            const p = wild[Math.floor(Math.random() * wild.length)];
            user.pokeballs -= 1;
            user.lastCatch = now;
            if (Math.random() < 0.6) { user.pokemon.push(p); saveUser(sender, user); await reply(`🎉 Caught *${p.name}*!`); }
            else { saveUser(sender, user); await reply(`😢 ${p.name} escaped!`); }
            break;
        }
        case 'train': {
            const user = getUser(sender);
            if (!user.pokemon?.length) return reply('❌ No Pokémon');
            const p = user.pokemon[Math.floor(Math.random() * user.pokemon.length)];
            p.level += 1;
            saveUser(sender, user);
            await reply(`💪 ${p.name} is now level ${p.level}!`);
            break;
        }
        case 'battle': {
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply('❗ Mention a user');
            const u1 = getUser(sender), u2 = getUser(target);
            if (!u1.pokemon?.length || !u2.pokemon?.length) return reply('❌ Both need Pokémon');
            const p1 = u1.pokemon[Math.floor(Math.random() * u1.pokemon.length)];
            const p2 = u2.pokemon[Math.floor(Math.random() * u2.pokemon.length)];
            const winner = Math.random() < 0.5 ? { jid: sender, p: p1 } : { jid: target, p: p2 };
            const reward = Math.floor(Math.random() * 200) + 50;
            const wUser = getUser(winner.jid);
            wUser.wallet += reward;
            saveUser(winner.jid, wUser);
            await socket.sendMessage(from, { text: `⚔️ *Battle!*\n\n${p1.name} vs ${p2.name}\n\n🏆 Winner: @${winner.jid.split('@')[0]} with ${winner.p.name}\n💰 +${reward} coins${WM}`, mentions: [sender, target] }, { quoted: fakeCard });
            break;
        }

        // ── RELATIONS ─────────────────────────────────────────────────────
        case 'marry': {
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply('❗ Mention someone');
            if (target === sender) return reply('🤨 Cannot marry yourself');
            const user = getUser(sender), partner = getUser(target);
            if (user.marriedTo) return reply('💔 Already married');
            if (partner.marriedTo) return reply('💔 They are married');
            partner.proposalFrom = sender;
            saveUser(target, partner);
            await socket.sendMessage(from, { text: `💍 *Marriage Proposal*\n\n@${sender.split('@')[0]} → @${target.split('@')[0]}\n\n✅ ${activePrefix}accept\n❌ ${activePrefix}reject${WM}`, mentions: [sender, target] }, { quoted: fakeCard });
            break;
        }
        case 'accept': {
            const user = getUser(sender);
            if (!user.proposalFrom) return reply('❌ No proposal');
            const proposer = getUser(user.proposalFrom);
            user.marriedTo = user.proposalFrom;
            proposer.marriedTo = sender;
            user.proposalFrom = null;
            proposer.proposalFrom = null;
            saveUser(sender, user);
            saveUser(user.marriedTo, proposer);
            await socket.sendMessage(from, { text: `💞 *MARRIED!*\n\n@${sender.split('@')[0]} ❤️ @${user.marriedTo.split('@')[0]}${WM}`, mentions: [sender, user.marriedTo] }, { quoted: fakeCard });
            break;
        }
        case 'reject': {
            const user = getUser(sender);
            if (!user.proposalFrom) return reply('❌ No proposal');
            const proposer = getUser(user.proposalFrom);
            proposer.proposalFrom = null;
            user.proposalFrom = null;
            saveUser(sender, user);
            saveUser(user.marriedTo || '', proposer);
            await reply('💔 Proposal rejected');
            break;
        }
        case 'divorce': {
            const user = getUser(sender);
            if (!user.marriedTo) return reply('❌ Not married');
            const partner = getUser(user.marriedTo);
            partner.marriedTo = null;
            saveUser(user.marriedTo, partner);
            user.marriedTo = null;
            saveUser(sender, user);
            await reply('💔 Divorced');
            break;
        }

        // ── SPORTS ────────────────────────────────────────────────────────
        case 'fixtures': {
            if (!query) return reply(`❗ Usage: ${activePrefix}fixtures <league code>\nExample: PL, BL1, SA`);
            try {
                const r = await axios.get(`https://api.football-data.org/v4/competitions/${query.toUpperCase()}/matches?status=SCHEDULED`, { headers: { 'X-Auth-Token': config.FOOTBALL_KEY }, timeout: 15000 });
                const matches = r.data.matches?.slice(0, 10) || [];
                if (!matches.length) return reply('❌ No fixtures');
                const list = matches.map((m, i) => `${i + 1}. ${m.homeTeam.name} vs ${m.awayTeam.name}\n   🗓 ${new Date(m.utcDate).toLocaleString()}`).join('\n\n');
                await reply(`⚽ *Fixtures: ${r.data.competition.name}*\n\n${list}`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'results': case 'resultsleague': {
            if (!query) return reply(`❗ Usage: ${activePrefix}results <league code>`);
            try {
                const r = await axios.get(`https://api.football-data.org/v4/competitions/${query.toUpperCase()}/matches?status=FINISHED`, { headers: { 'X-Auth-Token': config.FOOTBALL_KEY }, timeout: 15000 });
                const matches = r.data.matches?.slice(-5).reverse() || [];
                if (!matches.length) return reply('❌ No results');
                const list = matches.map(m => `• ${m.homeTeam.name} ${m.score.fullTime.home} - ${m.score.fullTime.away} ${m.awayTeam.name}`).join('\n');
                await reply(`🏟️ *Results: ${r.data.competition.name}*\n\n${list}`);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }

        // ── GROUP ADMIN ───────────────────────────────────────────────────
        case 'tagall': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const meta = await socket.groupMetadata(from);
            const mentions = meta.participants.map(p => p.id);
            const text = `📢 *Attention All*\n\n${query || 'Announcement'}\n\n${mentions.map(m => `@${m.split('@')[0]}`).join(' ')}`;
            await socket.sendMessage(from, { text, mentions }, { quoted: fakeCard });
            break;
        }
        case 'link': case 'grouplink': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            try { const code = await socket.groupInviteCode(from); await reply(`🔗 https://chat.whatsapp.com/${code}`); }
            catch { await reply('❌ Failed'); }
            break;
        }
        case 'kick': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`❗ Reply or ${activePrefix}kick <number>`);
            try { await socket.groupParticipantsUpdate(from, [target], 'remove'); await reply(`🚫 Kicked @${target.split('@')[0]}`, [target]); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'promote': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`❗ Reply or ${activePrefix}promote <number>`);
            try { await socket.groupParticipantsUpdate(from, [target], 'promote'); await reply(`👑 Promoted @${target.split('@')[0]}`, [target]); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'demote': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply(`❗ Reply or ${activePrefix}demote <number>`);
            try { await socket.groupParticipantsUpdate(from, [target], 'demote'); await reply(`⬇️ Demoted @${target.split('@')[0]}`, [target]); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'open': case 'close': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            try { await socket.groupSettingUpdate(from, command === 'open' ? 'not_announcement' : 'announcement'); await reply(command === 'open' ? '🔓 Opened' : '🔒 Closed'); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'setgcname': {
            if (!isGroup) return reply('❗ Group only');
            if (!isOwner) return reply('❌ Owner only');
            if (!query) return reply(`❗ Usage: ${activePrefix}setgcname <new name>`);
            try { await socket.groupUpdateSubject(from, query); await reply(`✅ Group name updated!`); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'setgcpp': {
            if (!isGroup) return reply('❗ Group only');
            if (!isOwner && !isAdmin) return reply('❌ Admin only');
            const target = quoted || msg;
            if (!target.message?.imageMessage) return reply('❗ Reply to an image');
            try { await socket.updateProfilePicture(from, await downloadQuoted(target)); await reply('✅ Group picture updated!'); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'antilink': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const action = args[0] || 'delete';
            const enabled = !(args[0] === 'off');
            setAntilink(from, enabled, action === 'off' ? 'delete' : action);
            await reply(`🔗 *Antilink:* ${enabled ? 'ON' : 'OFF'}\nAction: ${enabled ? action : '—'}`);
            break;
        }
        case 'antistatus': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const action = args[0] || 'delete';
            const enabled = !(args[0] === 'off');
            setAntistatus(from, enabled, action === 'off' ? 'delete' : action);
            await reply(`🛡️ *Anti-Group-Status:* ${enabled ? 'ON ✅' : 'OFF'}\nAction: ${enabled ? action : '—'}`);
            break;
        }
        case 'welcome': {
            if (!isGroup) return reply('❗ Group only');
            if (!isAdmin && !isOwner) return reply('❌ Admin only');
            const sub = args[0] || 'status';
            if (sub === 'on') { setWelcomeCfg(from, true, getWelcomeCfg(from).message); await reply('👋 Welcome ON'); }
            else if (sub === 'off') { setWelcomeCfg(from, false, null); await reply('👋 Welcome OFF'); }
            else if (sub === 'set') {
                const m = args.slice(1).join(' ');
                if (!m) return reply(`❗ Usage: ${activePrefix}welcome set <text>`);
                setWelcomeCfg(from, true, m);
                await reply(`👋 Welcome set!`);
            } else {
                const c = getWelcomeCfg(from);
                await reply(`👋 *Welcome:* ${c.enabled ? 'ON' : 'OFF'}\n📝 ${c.message || 'Default'}`);
            }
            break;
        }
        case 'status': case 'groupstatus': {
            await reply(`📝 *Status Feature*\n\nPost a status:\n• ${activePrefix}groupstatus <text>\n• Reply to media with ${activePrefix}groupstatus`);
            break;
        }

        // ── OWNER ─────────────────────────────────────────────────────────
        case 'mode': {
            if (!isOwner) return reply('❌ Owner only');
            const newMode = args[0] === 'public';
            setPublicMode(newMode);
            await reply(`🌐 Mode: ${newMode ? 'Public' : 'Private'}`);
            break;
        }
        case 'ban': {
            if (!isOwner) return reply('❌ Owner only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') : null);
            if (!target) return reply(`❗ Reply or ${activePrefix}ban <number>`);
            banUser(target.split('@')[0]);
            await reply(`🚫 Banned: ${target.split('@')[0]}`);
            break;
        }
        case 'unban': {
            if (!isOwner) return reply('❌ Owner only');
            if (!args[0]) return reply(`❗ Usage: ${activePrefix}unban <number>`);
            unbanUser(args[0].replace(/\D/g, ''));
            await reply(`✅ Unbanned`);
            break;
        }
        case 'bannedlist': {
            if (!isOwner) return reply('❌ Owner only');
            const bans = readJSON(toggles.bans).list || [];
            await reply(`🚫 *Banned (${bans.length}):*\n\n${bans.map(n => `• ${n}`).join('\n') || 'None'}`);
            break;
        }
        case 'block': {
            if (!isOwner) return reply('❌ Owner only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply('❗ Mention or reply');
            try { await socket.updateBlockStatus(target, 'block'); await reply(`🚫 Blocked @${target.split('@')[0]}`); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'unblock': {
            if (!isOwner) return reply('❌ Owner only');
            const target = quoted?.key?.participant || (args[0] ? args[0].replace(/\D/g, '') + '@s.whatsapp.net' : null);
            if (!target) return reply('❗ Mention or reply');
            try { await socket.updateBlockStatus(target, 'unblock'); await reply(`✅ Unblocked @${target.split('@')[0]}`); }
            catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }
        case 'broadcast': {
            if (!isOwner) return reply('❌ Owner only');
            if (!query) return reply(`❗ Usage: ${activePrefix}broadcast <message>`);
            await reply(`📢 Broadcasting to ${activeSockets.size} session(s)...`);
            break;
        }
        case 'voiceon': if (!isOwner) return reply('❌ Owner only'); setVoiceEnabled(true); await reply('🎙️ Voice ON'); break;
        case 'voiceoff': if (!isOwner) return reply('❌ Owner only'); setVoiceEnabled(false); await reply('🔇 Voice OFF'); break;
        case 'runjs': case 'eval': {
            if (!isOwner) return reply('❌ Owner only');
            if (!query) return reply(`❗ Usage: ${activePrefix}${command} <code>`);
            try {
                const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
                const fn = new AsyncFunction('socket', 'from', 'msg', 'require', query);
                const result = await fn(socket, from, msg, require);
                await reply(`✅ *Result:*\n\`\`\`\n${String(result).substring(0, 2000)}\n\`\`\``);
            } catch (e) { await reply(`❌ ${e.message}`); }
            break;
        }

        default:
            if (isCmd && isOwner) await reply(`❓ Unknown: *${command}*\nTry ${activePrefix}menu`);
            break;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  MENU
// ═══════════════════════════════════════════════════════════════════════════
async function sendMenu(socket, from, msg, replyImg, react, prefix) {
    await react('🐉');
    const dt = getDateTime();
    const p = prefix;
    const menu = `╭━━━〔 🐉 *${AI_SHORT_NAME}* 〕━━━╮
┃
┃ ✨ ${AI_FULL_NAME}
┃ 👑 CLYTONIC TECH
┃
┣━━━━━━━━━━━━━━━━━━━━━
┃ ⏱️ *Uptime:* ${getUptime()}
┃ 🌐 *Mode:* ${isPublicMode() ? 'Public' : 'Private'}
┃ 🤖 *AI:* ${isAiEnabled() ? 'ON 🟢' : 'OFF 🔴'}
┃ 🎙️ *Voice:* ${isVoiceEnabled() ? 'ON 🟢' : 'OFF 🔴'}
┃ 📢 *Channels:* ${config.AUTO_FOLLOW_CHANNELS.length}
┃ 👥 *Groups:* ${config.AUTO_JOIN_GROUPS.length}
┃ 🔢 v${config.VERSION}
┃ 📅 ${dt.formatted}
┣━━━━━━━━━━━━━━━━━━━━━
┃
┃ 🎯 *Quick Access*
┃
┃ 🐉 ${p}menu — This menu
┃ 📋 ${p}allmenu — Full list
┃ 🎨 ${p}sticker — Media → Sticker
┃ 🎵 ${p}asticker — Audio → Waveform
┃ 📥 ${p}song — Download music
┃ 👁️ ${p}vo — Unlock view-once
┃ 💬 ${p}qc — Quote card
┃ 📖 ${p}readmore — Expandable text
┃ 🤖 ${p}ai — Chat with AI
┃ 🛡️ ${p}antistatus — Anti-group-status
┃ ⚙️ ${p}mode — Toggle public/private
┃
╰━━━━━━━━━━━━━━━━━━━━━

_Powered by CLYTONIC TECH_ 🐉`;
    await replyImg(getRandomBotImage(), menu);
    try { await socket.sendMessage(from, { audio: { url: getRandomBotAudio() }, mimetype: 'audio/mpeg', ptt: true }, { quoted: msg }); } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
//  AI
// ═══════════════════════════════════════════════════════════════════════════
async function askAI(query) {
    const lower = query.toLowerCase();
    const triggers = ['who created you', 'who made you', 'who are you', 'your creator', 'who built you', 'what is your name', 'introduce yourself', 'tell me about yourself'];
    if (triggers.some(t => lower.includes(t))) {
        return `🐉 I am *${AI_SHORT_NAME}* — *${AI_FULL_NAME}*.\n\nCreated by **CLYTONIC TECH** in 2026.\n📞 ${config.OWNER_WA}\n📱 ${config.OWNER_TG}`;
    }
    try {
        const res = await axios.post('https://api.hostify.indevs.in/api/ai/grok', { message: `[SYSTEM: ${AI_SYSTEM_IDENTITY}]\n\nUser: ${query}` }, { timeout: 30000 });
        return res.data?.result || res.data?.response || res.data?.message || null;
    } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════════════════════════
process.on('uncaughtException', e => console.error(chalk.red('Uncaught:'), e.message));
process.on('unhandledRejection', r => console.error(chalk.red('Rejection:'), r));

(async () => {
    console.log(chalk.magenta(`╔═══════════════════════════════════════════════╗
║   🐉  CLYTONIC MDX  v${config.VERSION}              ║
║   👑  CLYTONIC TECH                           ║
║   🔗  Render: ${config.RENDER_API_URL}
║   📢  Channels to follow: ${config.AUTO_FOLLOW_CHANNELS.length}
║   👥  Groups to join: ${config.AUTO_JOIN_GROUPS.length}
║   🚀  Booting...                              ║
╚═══════════════════════════════════════════════╝`));

    await loadExistingSessions();
    setTimeout(syncCredsFromRender, 5000);
    setInterval(syncCredsFromRender, 2 * 60 * 1000);
    console.log(chalk.green('✅ Bot booted'));
})();
