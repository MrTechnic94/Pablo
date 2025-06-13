'use strict';

const logger = require('../../plugins/logger');
const { resolve } = require('node:path');

module.exports = {
    name: 'change',
    execute(filePath) {
        const resolvedPath = resolve(filePath);

        try {
            delete require.cache[require.resolve(resolvedPath)];
            const updatedModule = require(resolvedPath);

            // Hot reload komend
            if (filePath.includes('/commands/')) {
                const name = updatedModule?.data?.name;
                if (name && client.commands?.has(name)) {
                    client.commands.set(name, updatedModule);
                    logger.info(`[HotReload] Slash command '${name}' reloaded.`);
                }
            }

            // Hot reload eventów
            if (filePath.includes('/events/')) {
                const eventName = filePath.split('/').pop().split('.')[0];

                // Usuwanie poprzedniego listenera — UWAGA: musisz trzymać referencję (więcej poniżej)
                // Tymczasowo nie usuwamy, ale sygnalizujemy reload
                logger.info(`[HotReload] Event '${eventName}' reloaded (duplikaty nieusuwane).`);
            }

            logger.info(`[HotReload] ${filePath} reloaded successfully.`);
        } catch (err) {
            logger.error(`[HotReload] Failed to reload ${filePath}:\n${err}`);
        }
    },
};
