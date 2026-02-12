'use strict';

const { getFiles } = require('../lib/utils/explorer');
const { resolve } = require('node:path');
const db = require('../lib/core/database');

module.exports = (client, logger) => {
    const eventsDir = resolve(__dirname, '../events');
    const eventFiles = getFiles(eventsDir);

    for (const item of eventFiles) {
        const eventName = item.fileName.slice(0, item.fileName.lastIndexOf('.'));
        const eventNameBig = eventName.charAt(0).toUpperCase() + eventName.slice(1);

        try {
            const event = require(item.fullPath);

            if (typeof event.execute !== 'function') {
                logger.error(`[Event ▸ ${eventNameBig}] Event is missing 'execute'.`);
                process.exit(1);
            }

            const emitter = {
                process: process,
                database: db
            }[item.category] || client;

            emitter[event.once ? 'once' : 'on'](eventName, (...args) => event.execute(logger, ...args));

            logger.info(`[Event] Event ${eventName} has been loaded.`);
        } catch (err) {
            logger.error(`[Event ▸ ${eventNameBig}] ${err}`);
            process.exit(1);
        }
    }

    db.connect();
};