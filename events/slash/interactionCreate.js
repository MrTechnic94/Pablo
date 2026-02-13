'use strict';

const checkBotPermissions = require('../../lib/utils/permissionChecker');
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        const { utils } = interaction.client;

        const handleError = utils.handleError;

        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            const commandType = interaction.isChatInputCommand() ? 'Slash' : 'Context';
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`[${commandType}] Command '${interaction.commandName}' not found for '${interaction.guild.id}'.`);
                return await utils.reply.error(interaction, 'COMMAND_NOT_FOUND');
            }

            // Permisje bota
            if (!(await checkBotPermissions(interaction, command.botPermissions))) return;

            if (command.ownerOnly && interaction.user.id !== process.env.BOT_OWNER_ID) {
                return await utils.reply.error(interaction, 'ACCESS_DENIED');
            }

            try {
                return await command.execute(interaction, logger);
            } catch (err) {
                return await handleError(err, commandType, command.data?.name || interaction.commandName, interaction, logger, utils);
            }
        } else if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId) || interaction.client.buttons.find(b => b.isPrefix && interaction.customId.startsWith(b.customId));

            if (!button) return;
            if (!(await checkBotPermissions(interaction, button.botPermissions))) return;

            try {
                return await button.execute(interaction, logger);
            } catch (err) {
                return await handleError(err, 'Button', interaction.customId, interaction, logger, utils);
            }
        } else if (interaction.isStringSelectMenu()) {
            const menu = interaction.client.selectMenus.get(interaction.customId);

            if (!menu) return;
            if (!(await checkBotPermissions(interaction, menu.botPermissions))) return;

            try {
                return await menu.execute(interaction, logger);
            } catch (err) {
                return await handleError(err, 'SelectMenu', interaction.customId, interaction, logger, utils);
            }
        }
    },
};