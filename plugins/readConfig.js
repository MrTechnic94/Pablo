'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const configPath = resolve(__dirname, '../config/default.json');

function getConfig() {
    return JSON.parse(readFileSync(configPath));
}

function syncConfig(value) {
    return writeFileSync(configPath, JSON.stringify(value, null, 4));
}

module.exports = { getConfig, syncConfig };