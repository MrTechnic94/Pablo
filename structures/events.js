'use strict';

// const chokidar = require('chokidar');
const logger = require('../plugins/logger');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

module.exports = (client) => {
    const eventsDir = join(__dirname, '../events');

    // const watcher = chokidar.watch('./', {
    //     ignored: /node_modules|\.git|structures|package\.json|pnpm-lock\.yaml|\.gitignore|\.pm2|config/,
    //     persistent: true
    // });

    readdirSync(eventsDir, { withFileTypes: true }).forEach((directory) => {
        if (!directory.isDirectory()) return;

        const eventFiles = readdirSync(join(eventsDir, directory.name))
            .filter((file) => file.endsWith('.js'));

        for (const file of eventFiles) {
            const eventName = file.slice(0, file.lastIndexOf('.'));
            const event = require(join(eventsDir, directory.name, file));
            logger.info(`[Event] Event ${eventName} has been loaded.`);

            const eventHandler = (...args) => event.execute(...args, logger);

            switch (directory.name) {
                case 'process':
                    process.on(eventName, eventHandler);
                    break;

                // case 'chokidar':
                //     watcher.on(eventName, eventHandler);
                //     break;

                default:
                    client[event.once ? 'once' : 'on'](eventName, eventHandler);
            }
        }
    });
};