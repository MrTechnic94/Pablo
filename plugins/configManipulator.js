'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

let cache = null;
const configPath = resolve(__dirname, '../config/default.json');

function getConfig(force = false) {
    if (cache && !force) return cache;
    const data = readFileSync(configPath, 'utf8');
    cache = JSON.parse(data);
    return cache;
}

function syncConfig(value) {
    writeFileSync(configPath, JSON.stringify(value, null, 4), 'utf8');
    cache = value;
    return cache;
}

// Ustawienie, aby config sie odwiezal co 2h bez cache
setInterval(() => {
    const data = readFileSync(configPath, 'utf8');
    cache = JSON.parse(data);
}, 7_200_000);

module.exports = { getConfig, syncConfig };