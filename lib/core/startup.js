'use strict';

// Monitor lagow w czasie rzeczywistym
try {
    require('blocked-at')((ms, stack) => {
        logger.debug(`[PREFORMANCE] Event loop blocked for ${ms}ms:`);
        logger.debug(stack);
    }, { threshold: 50 });
} catch {
    // Bot dziala dalej jezeli nie ma 'blocked-at'
}

const NODE_REGEX = /\d+\.\d+\.\d+/;

const { isDev } = require('../utils/developer');
const logger = require('./logger');

// Sprawdza obecnosc parametrow w pliku .env
function checkEnvVariables(variables) {
    for (const v of variables) {
        if (!process.env[v]) {
            logger.error(`[Startup] Missing '${v}' in .env file.`);
            process.exit(1);
        }
    }
}

// Sprawdza czy wersja Node.js jest aktualna
function checkNodeVersion() {
    const { engines } = require('../../package.json');
    const required = engines.node.match(NODE_REGEX)?.[0];

    if (required && process.versions.node < required) {
        logger.error(`[Startup] Outdated Node.js version. Required ${required}.`);
        process.exit(1);
    }
}

// Inicjuje klienta discord.js oraz loguje bota do discord
function connectClient() {
    const PabloClient = require('./client');

    const client = new PabloClient(logger);

    client.login(isDev() ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);
}

async function startup() {
    checkNodeVersion(logger);

    const requiredVars = ['BOT_TOKEN', 'BOT_ID', 'BOT_OWNER_ID', 'BIBLE_API_KEY', 'DB_HOST', 'DB_PORT'];

    if (isDev()) {
        requiredVars.push('DEV_BOT_TOKEN', 'DEV_BOT_ID', 'DEV_DB_HOST', 'DEV_DB_PORT');
    }

    checkEnvVariables(requiredVars);

    // Automatyczna aktualizacja pakietow
    await require('../services/updater').packageUpdater(logger);

    connectClient(logger);
}

module.exports = { startup };