'use strict';

const { getFiles } = require('./explorer');
const { existsSync } = require('node:fs');

function loadInteractions(client, path, typeLabel, logger, publicCommands, ownerCommands) {
    if (!existsSync(path)) return;

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

    for (const item of files) {
        const componentName = item.fileName.slice(0, item.fileName.lastIndexOf('.'));

        try {
            const component = require(item.fullPath);

            if (component?.customId) {
                collection.set(component.customId, component);
            } else {
                logger.warn(`[${label} ▸ ${componentName}] Missing 'customId'.`);
            }
        } catch (err) {
            logger.error(`[${label} ▸ ${componentName}] Error loading file:\n${err}`);
        }
    }
}

module.exports = { loadInteractions, loadComponents };