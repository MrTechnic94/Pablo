'use strict';

const packageUpdater = require('../services/packageUpdater');
const PabloClient = require('./pabloClient');
const { engines } = require('../../package.json');

// Utworzenie zmiennej globalnej do sprawdzania czy tryb developera jest wlaczony
global.isDev = process.env.DEV_MODE === 'true';

// Sprawdza obecnosc parametrow w pliku .env
function checkEnvVariables(variables, logger) {
    const missing = variables.find(v => !process.env[v]);

    if (missing) {
        logger.error(`[Startup] Missing '${missing}' in .env file.`);
        process.exit(1);
    }
}

// Sprawdza czy wersja Node.js jest aktualna
function checkNodeVersion(logger) {
    const version = process.versions.node;
    const currentVersion = engines.node.match(/\d+\.\d+\.\d+/)[0];

    if (version < currentVersion) {
        logger.error(`[Startup] Outdated Node.js version. Required ${engines.node}.`);
        process.exit(1);
    }
}

// Inicjuje klienta discord.js oraz loguje bota do discord
function connectClient(logger) {
    const client = new PabloClient(logger);

    client.login(global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);
}

async function startup(logger) {
    // Automatyczna aktualizacja pakietow
    await packageUpdater(logger);

    checkEnvVariables(['BOT_TOKEN', 'BOT_ID', 'BOT_OWNER_ID', 'SNITCH_CHANNEL_ID', 'BIBLE_API_KEY'], logger);

    // Sprawdza czy tryb developera jest odpowiednio skonfigurowany
    if (global.isDev) checkEnvVariables(['DB_HOST', 'DB_PORT', 'DB_PASSWORD', 'DB_CONNECT_TIMEOUT', 'DEV_BOT_TOKEN', 'DEV_BOT_ID'], logger);

    checkNodeVersion(logger);

    connectClient(logger);
}

module.exports = { startup };