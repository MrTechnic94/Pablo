'use strict';

const logger = require('./logger');

// Utworzenie zmiennej globalnej do sprawdzania czy tryb developera jest wlaczony
global.isDev = process.env.DEV_MODE === 'true';

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
    const { engines } = require('../package.json');

    const version = process.versions.node;
    const currentVersion = engines.node.match(/\d+\.\d+\.\d+/)[0];

    if (version < currentVersion) {
        logger.error(`[Startup] Outdated Node.js version. Required ${engines.node}.`);
        process.exit(1);
    }
}

// Inicjuje klienta discord.js oraz loguje bota do discord
function connectClient() {
    const { PabloClient } = require('./pabloClient');

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