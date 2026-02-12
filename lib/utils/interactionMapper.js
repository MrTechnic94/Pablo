'use strict';

const { getFiles } = require('./explorer');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

function loadInteractions(client, path, typeLabel, logger, publicCommands, ownerCommands) {
    const files = getFiles(path);

    for (const item of files) {
        const commandNameBig = item.fileName.charAt(0).toUpperCase() + item.fileName.slice(1, item.fileName.lastIndexOf('.'));

        try {
            const command = require(item.fullPath);

            if (command?.data && typeof command.execute === 'function') {
                command.__fileName = item.fileName.slice(0, item.fileName.lastIndexOf('.'));

                client.commands.set(command.data.name, command);

                const commandJSON = command.data.toJSON();

                if (command.ownerOnly) {
                    ownerCommands.push(commandJSON);
                } else {
                    publicCommands.push(commandJSON);
                }
            } else {
                logger.error(`[${typeLabel} ▸ ${commandNameBig}] Command is missing 'data' or 'execute'.`);
                process.exit(1);
            }
        } catch (err) {
            logger.error(`[${typeLabel} ▸ ${commandNameBig}] ${err}`);
            process.exit(1);
        }
    }
}

function loadComponents(path, collection, label, logger) {
    if (!existsSync(path)) return;

    const files = getFiles(path);

    for (const file of files) {
        try {
            const component = require(resolve(path, file));
            if (component.customId) collection.set(component.customId, component);
        } catch (err) {
            logger.error(`[${label} ▸ ${file}] ${err}`);
        }
    }
}

module.exports = { loadInteractions, loadComponents };