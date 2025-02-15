'use strict';

const logger = require('../../plugins/logger');
const { resolve } = require('node:path');

module.exports = {
    name: 'change',
    execute(filePath) {
        const resolvedPath = resolve(filePath);

        try {
            delete require.cache[require.resolve(resolvedPath)];
            require(resolvedPath);
            logger.info(`[Chokidar] The ${filePath} has been reloaded.`);
        } catch (err) {
            logger.error(`[Chokidar] Error while reloading ${resolvedPath}:\n${err}`);
        }
    },
};