'use strict';

const pino = require('pino');

let isPinoPretty;

try {
    require.resolve('pino-pretty');
    isPinoPretty = true;
} catch {
    isPinoPretty = false;
}

let logger;

if (isPinoPretty) {
    logger = pino({
        level: 'debug',
        base: { pid: undefined },
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss'
            }
        }
    });
} else {
    logger = pino({
        level: 'debug'
    });
}

if (!isPinoPretty) {
    logger.warn('[Logger] To achieve better formatting, install the pino-pretty module.');
}

module.exports = logger;