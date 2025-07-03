'use strict';

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
    const version = Number(process.versions.node.split('.')[0]);

    if (version < engines.node) {
        logger.error(`[Startup] Outdated Node.js version. Required ${engines.node}.`);
        process.exit(1);
    }
}

function startup() {
    checkEnvVariables(['BOT_TOKEN', 'BOT_ID', 'BOT_OWNER_ID']);

    // Sprawdza czy tryb developera jest odpowiednio skonfigurowany
    if (global.isDev) checkEnvVariables(['DEV_BOT_TOKEN']);

    checkNodeVersion();
}

module.exports = { startup };