'use strict';

const logger = require('./logger');

// Sprawdza obecnosc parametrow w pliku .env
function checkEnvVariables(variables) {
    for (const variable of variables) {
        if (!process.env[variable]) {
            logger.error(`Missing ${variable} in .env file.`);
            process.exit(1);
        }
    }
}

// Sprawdza czy wersja Node.js jest aktualna
function checkNodeVersion() {
    const version = Number(process.versions.node.split('.')[0]);

    if (version < 22.12) {
        logger.error('Outdated Node.js version. Update to a newer version.');
        process.exit(1);
    }
}

function startup() {
    checkEnvVariables(['BOT_TOKEN', 'BOT_ID', 'BOT_OWNER_ID', 'DB_HOST', 'DB_PORT', 'DB_PASSWORD']);

    // Sprawdza czy tryb developera jest odpowiednio skonfigurowany
    if (global.isDev) checkEnvVariables(['BOT_TOKEN_DEV']);

    checkNodeVersion();
}

module.exports = { startup };