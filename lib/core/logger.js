'use strict';

const pino = require('pino');

let isPinoPretty;

try {
    require.resolve('pino-pretty');
    isPinoPretty = true;
} catch {
    isPinoPretty = false;
}

const options = {
    level: global.isDev ? 'debug' : 'info',
    base: null
};

if (isPinoPretty) {
    options.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss'
        }
    };
}

const logger = pino(options);

if (!isPinoPretty) {
    logger.warn('[Logger] To achieve better formatting, install \'pino-pretty\' module.');
}

module.exports = logger;