const { getDB, isOwner, isPremium } = require('./database');
const config = require('../config');

function getRole(jid) {
  if (isOwner(jid)) return config.roles.OWNER;
  if (isPremium(jid)) return config.roles.PREMIUM;
  return config.roles.USER;
}

function canUseCommand(jid, command) {
  const role = getRole(jid);
  const db = getDB();

  if (role === config.roles.OWNER) return { allowed: true };

  if (!db.serverOnline) {
    return { allowed: false, reason: config.messages.serverOffline };
  }

  if (db.bannedUsers.some(n => jid.includes(n))) {
    return { allowed: false, reason: '⛔ You have been banned from using this bot.' };
  }

  const requiredRole = command.role || 'user';

  if (requiredRole === 'owner') {
    return { allowed: false, reason: config.messages.ownerOnly };
  }

  if (requiredRole === 'premium') {
    if (role === config.roles.PREMIUM) return { allowed: true };
    return { allowed: false, reason: config.messages.premiumOnly };
  }

  return { allowed: true };
}

function isGroupAdmin(participant, groupMetadata) {
  if (!groupMetadata) return false;
  const admin = groupMetadata.participants.find(
    p => p.id === participant && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  return !!admin;
}

module.exports = { getRole, canUseCommand, isGroupAdmin };
