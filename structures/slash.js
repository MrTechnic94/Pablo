'use strict';

const logger = require('../plugins/logger');
const { REST, Routes } = require('discord.js');
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

module.exports = async (client) => {
    const commandsPath = join(__dirname, '../commands');
    const commandCategories = readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const commands = [];

    for (const category of commandCategories) {
        const categoryPath = join(commandsPath, category);
        const commandFiles = readdirSync(categoryPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = join(categoryPath, file);
            try {
                const command = require(filePath);

                if (command?.data && typeof command.execute === 'function') {
                    commands.push(command.data.toJSON());
                    client.commands.set(command.data.name, command);
                } else {
                    logger.warn(`[Slash] Command at ${filePath} is missing "data" or "execute".`);
                    process.exit(1);
                }
            } catch (err) {
                logger.error(`[Slash] Error loading command at ${filePath}:\n${err}`);
                process.exit(1);
            }
        }
    }

    const rest = new REST().setToken(global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);

    try {
        logger.info(`[Slash] Registering ${commands.length} slash commands...`);
        await rest.put(
            Routes.applicationCommands(global.isDev ? process.env.DEV_BOT_ID : process.env.BOT_ID),
            { body: commands }
        );
        logger.info('[Slash] Successfully registered slash commands.');
    } catch (err) {
        logger.error(`[Slash] Error during command registration:\n${err}`);
    }
};