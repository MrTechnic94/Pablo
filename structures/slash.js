'use strict';

const { REST, Routes, ApplicationCommandType } = require('discord.js');
const { readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const logger = require('../lib/core/logger');

module.exports = async (client) => {
    const commandsPath = resolve(__dirname, '../commands');
    const commandCategories = readdirSync(commandsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const commands = [];

    for (const category of commandCategories) {
        const categoryPath = resolve(commandsPath, category);
        const commandFiles = readdirSync(categoryPath)
            .filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = resolve(categoryPath, file);
            const commandNameBig = file.charAt(0).toUpperCase() + file.slice(1, file.lastIndexOf('.'));

            try {
                const command = require(filePath);

                if (command?.data && typeof command.execute === 'function') {
                    command.__fileName = file.slice(0, file.lastIndexOf('.'));
                    commands.push(command.data.toJSON());
                    client.commands.set(command.data.name, command);
                } else {
                    logger.error(`[Slash ▸ ${commandNameBig}] Command is missing 'data' or 'execute'.`);
                    process.exit(1);
                }
            } catch (err) {
                logger.error(`[Slash ▸ ${commandNameBig}] ${err}`);
                process.exit(1);
            }
        }
    }

    const contextsPath = resolve(__dirname, '../contexts');
    const contextCategories = readdirSync(contextsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const category of contextCategories) {
        const categoryPath = resolve(contextsPath, category);
        const contextFiles = readdirSync(categoryPath)
            .filter(file => file.endsWith('.js'));

        for (const file of contextFiles) {
            const filePath = resolve(categoryPath, file);
            const commandNameBig = file.charAt(0).toUpperCase() + file.slice(1, file.lastIndexOf('.'));

            try {
                const command = require(filePath);

                if (command?.data && typeof command.execute === 'function') {
                    command.__fileName = file.slice(0, file.lastIndexOf('.'));
                    commands.push(command.data.toJSON());
                    client.commands.set(command.data.name, command);
                } else {
                    logger.error(`[Context ▸ ${commandNameBig}] Command is missing 'data' or 'execute'.`);
                    process.exit(1);
                }
            } catch (err) {
                logger.error(`[Context ▸ ${commandNameBig}] ${err}`);
                process.exit(1);
            }
        }
    }

    const rest = new REST().setToken(global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);

    try {
        const slashCommands = commands.filter(
            cmd => !cmd.type || cmd.type === ApplicationCommandType.ChatInput
        );
        const contextCommands = commands.filter(
            cmd => cmd.type && (cmd.type === ApplicationCommandType.User || cmd.type === ApplicationCommandType.Message)
        );

        logger.info(`[Slash] Registering ${slashCommands.length} slash commands...`);
        logger.info(`[Context] Registering ${contextCommands.length} context commands...`);

        const allCommands = [...slashCommands, ...contextCommands];

        if (allCommands.length > 0) {
            await rest.put(
                Routes.applicationCommands(global.isDev ? process.env.DEV_BOT_ID : process.env.BOT_ID),
                { body: allCommands }
            );
        }

        logger.info('[Slash] Successfully registered slash commands.');
        logger.info('[Context] Successfully registered context commands.');
    } catch (err) {
        logger.error(`[Handler] Error during command registration:\n${err}`);
        process.exit(1);
    }
};