'use strict';

const { loadInteractions, loadComponents } = require('../lib/utils/interactionMapper');
const { REST, ApplicationCommandType, Routes } = require('discord.js');
const { resolve } = require('node:path');

module.exports = async (client, logger) => {
    const publicCommands = [];
    const ownerCommands = [];

    // Slash i context
    loadInteractions(client, resolve(__dirname, '../commands'), 'Slash', logger, publicCommands, ownerCommands);
    loadInteractions(client, resolve(__dirname, '../contexts'), 'Context', logger, publicCommands, ownerCommands);

    // Buttony i menu
    loadComponents(resolve(__dirname, '../interactions/buttons'), client.buttons, 'Button', logger);
    loadComponents(resolve(__dirname, '../interactions/selectmenus'), client.selectMenus, 'SelectMenu', logger);

    const rest = new REST().setToken(global.isDev ? process.env.DEV_BOT_TOKEN : process.env.BOT_TOKEN);

    try {
        const slashCount = publicCommands.filter(c => !c.type || c.type === ApplicationCommandType.ChatInput).length;
        const contextCount = publicCommands.length - slashCount;

        logger.info(`[Slash] Registering ${slashCount} slash commands...`);
        logger.info(`[Context] Registering ${contextCount} context commands...`);

        await rest.put(
            Routes.applicationCommands(global.isDev ? process.env.DEV_BOT_ID : process.env.BOT_ID),
            { body: publicCommands }
        );

        if (global.isDev && ownerCommands.length > 0) {
            try {
                await rest.put(
                    Routes.applicationGuildCommands(process.env.DEV_BOT_ID, process.env.DEV_GUILD_ID),
                    { body: ownerCommands }
                );
            } catch (err) {
                logger.warn(`[Handler] Error while registering owner commands:\n${err}`);
            }
        }

        logger.info('[Slash] Successfully registered slash commands.');
        logger.info('[Context] Successfully registered context commands.');
        logger.info('[Interaction] Successfully registered interaction.');
    } catch (err) {
        logger.error(`[Handler] Error during registration:\n${err}`);
        process.exit(1);
    }
};