'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const configPath = resolve(__dirname, '../config/default.json');

function getConfig() {
    return JSON.parse(readFileSync(configPath, 'utf8'));
}

function syncConfig(value) {
    return writeFileSync(configPath, JSON.stringify(value, null, 4), 'utf8');
}

module.exports = { getConfig, syncConfig };