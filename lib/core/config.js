'use strict';

const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

const configPath = resolve(__dirname, '../../config/default.json');
let cache = null;

function get(force) {
    if (cache !== null && !force) return cache;

    try {
        cache = JSON.parse(readFileSync(configPath));
    } catch {
        cache = cache || {};
    }

    return cache;
}

function sync(value) {
    writeFileSync(configPath, JSON.stringify(value), 'utf8');
    cache = value;

    return cache;
}

module.exports = { get, sync };