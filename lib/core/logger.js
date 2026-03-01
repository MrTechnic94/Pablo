'use strict';

const pino = require('pino');

const options = {
    level: global.isDev ? 'debug' : 'info',
    base: null
};

try {
    require.resolve('pino-pretty');

    options.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss'
        }
    };
} catch {
    // Opcje zostaja domyslne jezeli nie ma 'pino-pretty'
}

const logger = pino(options);

if (!options.transport) {
    logger.warn('[Logger] To achieve better formatting, install \'pino-pretty\' module.');
}

module.exports = logger;