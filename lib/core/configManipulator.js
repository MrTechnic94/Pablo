'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

let cache = null;
const configPath = resolve(__dirname, '../../config/default.json');

function getConfig({ force = false } = {}) {
    if (cache !== null && !force) return cache;

    const data = readFileSync(configPath, 'utf8');
    cache = JSON.parse(data);

    return cache;
}

function syncConfig(value) {
    const data = JSON.stringify(value, null, 4);
    writeFileSync(configPath, data, 'utf8');
    cache = value;

    return cache;
}

setInterval(() => {
    try {
        const data = readFileSync(configPath, 'utf8');
        cache = JSON.parse(data);
    } catch {
        cache = cache || {};
    }
}, 7_200_000).unref();

module.exports = { getConfig, syncConfig };