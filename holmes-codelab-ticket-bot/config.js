const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'guilds.json');

function loadAll() {
  if (!fs.existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getGuildConfig(guildId) {
  const all = loadAll();
  return all[guildId] || null;
}

function setGuildConfig(guildId, config) {
  const all = loadAll();
  all[guildId] = { ...(all[guildId] || {}), ...config };
  saveAll(all);
  return all[guildId];
}

// Ticket counter per guild (for channel numbering)
function nextTicketNumber(guildId) {
  const all = loadAll();
  if (!all[guildId]) all[guildId] = {};
  const current = all[guildId].ticketCount || 0;
  all[guildId].ticketCount = current + 1;
  saveAll(all);
  return all[guildId].ticketCount;
}

module.exports = { getGuildConfig, setGuildConfig, nextTicketNumber, loadAll, saveAll };
