'use strict';

const db = require('../lib/core/database');
const logger = require('../lib/core/logger');
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
            const eventNameBig = eventName.charAt(0).toUpperCase() + eventName.slice(1);

            try {
                const event = require(resolve(eventsDir, directory.name, file));

                if (typeof event.execute !== 'function') {
                    logger.error(`[Event ▸ ${eventNameBig}] Event is missing 'execute'.`);
                    process.exit(1);
                }

                logger.info(`[Event] Event ${eventName} has been loaded.`);

                const eventHandler = (...args) => event.execute(logger, ...args);

                switch (directory.name) {
                    case 'process':
                        process[event.once ? 'once' : 'on'](eventName, eventHandler);
                        break;

                    case 'database':
                        if (!global.isDev) return;
                        db[event.once ? 'once' : 'on'](eventName, eventHandler);
                        break;

                    default:
                        client[event.once ? 'once' : 'on'](eventName, eventHandler);
                }
            } catch (err) {
                logger.error(`[Event ▸ ${eventNameBig}] ${err}`);
                process.exit(1);
            }
        }
    });
};