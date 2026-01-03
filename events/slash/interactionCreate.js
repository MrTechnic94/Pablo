'use strict';

const { Events } = require('discord.js');
const reply = require('../../lib/utils/responder');

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            const commandType = interaction.isChatInputCommand() ? 'Slash' : 'Context';

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`[${commandType}] Command '${interaction.commandName}' not found.`);
                return await reply.error(interaction, 'COMMAND_NOT_FOUND');
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                const commandName = command.__fileName || command.data?.name || interaction.commandName;

                const commandNameBig = commandName.charAt(0).toUpperCase() + commandName.slice(1);

                logger.error(`[${commandType} ▸ ${commandNameBig}] ${err}`);
                if (interaction.replied || interaction.deferred) {
                    await reply.error(interaction, 'COMMAND_ERROR');
                } else {
                    await reply.error(interaction, 'COMMAND_ERROR');
                }
            }
        } else if (interaction.isButton()) {
            // Buttons
            const { buttons } = interaction.client;

            const button = buttons.get(interaction.customId) || buttons.find(b => b.isPrefix && interaction.customId.startsWith(b.customId));

            if (!button) return;

            try {
                await button.execute(interaction, logger);
            } catch (err) {
                logger.error(`[Button ▸ ${interaction.customId}] ${err}`);
                await reply.error(interaction, 'COMMAND_ERROR');
            }
        } else if (interaction.isStringSelectMenu()) {
            // Select Menus
            const menu = interaction.client.selectMenus.get(interaction.customId);

            if (!menu) return;

            try {
                await menu.execute(interaction, logger);
            } catch (err) {
                logger.error(`[SelectMenu ▸ ${interaction.customId}] ${err}`);
                await reply.error(interaction, 'COMMAND_ERROR');
            }
        }
    }
};