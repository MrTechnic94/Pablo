'use strict';

const logger = require('../plugins/logger');
const { readdirSync } = require('node:fs');
const { resolve } = require('node:path');

module.exports = (client) => {
    const eventsDir = resolve(__dirname, '../events');

    readdirSync(eventsDir, { withFileTypes: true }).forEach((directory) => {
        if (!directory.isDirectory()) return;

        const eventFiles = readdirSync(resolve(eventsDir, directory.name))
            .filter((file) => file.endsWith('.js'));

        for (const file of eventFiles) {
            const eventName = file.slice(0, file.lastIndexOf('.'));

            try {
                const event = require(resolve(eventsDir, directory.name, file));

                if (typeof event.execute !== 'function') {
                    logger.error(`[Event] Event '${eventName}' is missing 'execute'.`);
                    process.exit(1);
                }

                logger.info(`[Event] Event ${eventName} has been loaded.`);

                const eventHandler = (...args) => event.execute(logger, ...args);

                switch (directory.name) {
                    case 'process':
                        process[event.once ? 'once' : 'on'](eventName, eventHandler);
                        break;

                    default:
                        client[event.once ? 'once' : 'on'](eventName, eventHandler);
                }
            } catch (err) {
                logger.error(`[Event] Erorr while loading event '${eventName}':\n${err}`);
                process.exit(1);
            }
        }
    });
};