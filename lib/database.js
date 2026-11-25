const fs = require('fs');
const path = require('path');
const config = require('../config');

const DEFAULT_SETTINGS = {
  mode: config.defaultMode,
  serverOnline: config.serverOnline,
  owners: [config.ownerNumber],
  premiumUsers: [],
  bannedUsers: [],
  groups: {},
  stats: {
    totalCommands: 0,
    totalMessages: 0,
    startTime: Date.now()
  },
  customSettings: {}
};

let db = { ...DEFAULT_SETTINGS };

function ensureDirectory() {
  const dir = path.dirname(config.dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadDatabase() {
  try {
    ensureDirectory();
    if (fs.existsSync(config.dbPath)) {
      const data = fs.readFileSync(config.dbPath, 'utf-8');
      const loaded = JSON.parse(data);
      db = { ...DEFAULT_SETTINGS, ...loaded };
      console.log('✅ Database loaded');
    } else {
      saveDatabase();
      console.log('✅ Database created');
    }
  } catch (err) {
    console.error('❌ Database load error:', err.message);
    db = { ...DEFAULT_SETTINGS };
  }
  return db;
}

function saveDatabase() {
  try {
    ensureDirectory();
    fs.writeFileSync(config.dbPath, JSON.stringify(db, null, 2));
    return true;
  } catch (err) {
    console.error('❌ Database save error:', err.message);
    return false;
  }
}

function getDB() { return db; }

function setMode(mode) { db.mode = mode; return saveDatabase(); }

function setServerStatus(status) { db.serverOnline = status; return saveDatabase(); }

function isOwner(jid) {
  const number = jid.split('@')[0].split(':')[0];
  return db.owners.includes(number);
}

function isPremium(jid) {
  const number = jid.split('@')[0].split(':')[0];
  return db.premiumUsers.includes(number);
}

function isBanned(jid) {
  const number = jid.split('@')[0].split(':')[0];
  return db.bannedUsers.includes(number);
}

function addOwner(number) {
  if (!db.owners.includes(number)) { db.owners.push(number); saveDatabase(); return true; }
  return false;
}

function removeOwner(number) {
  const idx = db.owners.indexOf(number);
  if (idx > -1 && db.owners.length > 1) { db.owners.splice(idx, 1); saveDatabase(); return true; }
  return false;
}

function addPremium(number) {
  if (!db.premiumUsers.includes(number)) { db.premiumUsers.push(number); saveDatabase(); return true; }
  return false;
}

function removePremium(number) {
  const idx = db.premiumUsers.indexOf(number);
  if (idx > -1) { db.premiumUsers.splice(idx, 1); saveDatabase(); return true; }
  return false;
}

function banUser(number) {
  if (!db.bannedUsers.includes(number)) { db.bannedUsers.push(number); saveDatabase(); return true; }
  return false;
}

function unbanUser(number) {
  const idx = db.bannedUsers.indexOf(number);
  if (idx > -1) { db.bannedUsers.splice(idx, 1); saveDatabase(); return true; }
  return false;
}

function incrementCommands() { db.stats.totalCommands++; saveDatabase(); }

module.exports = {
  loadDatabase, saveDatabase, getDB,
  setMode, setServerStatus,
  isOwner, isPremium, isBanned,
  addOwner, removeOwner,
  addPremium, removePremium,
  banUser, unbanUser,
  incrementCommands
};
