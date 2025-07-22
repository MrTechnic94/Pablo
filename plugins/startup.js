'use strict';

const { PabloClient } = require('./pabloClient');
const { engines } = require('../package.json');
const logger = require('./logger');

// Sprawdza obecnosc parametrow w pliku .env
function checkEnvVariables(variables) {
    for (const variable of variables) {
        if (!process.env[variable]) {
            logger.error(`[Startup] Missing ${variable} in .env file.`);
            process.exit(1);
        }
    }
}

// Sprawdza czy wersja Node.js jest aktualna
function checkNodeVersion() {
    const version = process.versions.node;
    const currentVersion = engines.node.match(/\d+\.\d+\.\d+/)[0];

    if (version < currentVersion) {
        logger.error(`[Startup] Outdated Node.js version. Required ${engines.node}.`);
        process.exit(1);
    }
}

// Inicjuje klienta discordjs oraz loguje bota do discord
function connectClient() {
    const client = new PabloClient();

    client.login(global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);
}

function startup() {
    checkEnvVariables(['BOT_TOKEN', 'BOT_ID', 'BOT_OWNER_ID']);

    // Sprawdza czy tryb developera jest odpowiednio skonfigurowany
    if (global.isDev) checkEnvVariables(['DEV_BOT_TOKEN', 'DEV_BOT_ID']);

    checkNodeVersion();

    connectClient();
}

module.exports = { startup };