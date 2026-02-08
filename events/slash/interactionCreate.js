'use strict';

const { defaultPermissions } = require('../../config/default.json');
const { permissions } = require('../../locales/pl_PL');
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
            const requiredPermissions = command.botPermissions
                ? [...defaultPermissions, ...command.botPermissions]
                : defaultPermissions;

            const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);

            if (!botPermissions.has(requiredPermissions)) {
                const missing = botPermissions.missing(requiredPermissions).map(p => `\`${permissions[p] || p}\``);
                return await utils.reply.error(interaction, missing.length === 1 ? 'BOT_MISSING_PERMISSION' : 'BOT_MISSING_PERMISSIONS', missing.join(' '));
            }

            if (command.ownerOnly && interaction.user.id !== process.env.BOT_OWNER_ID) {
                return await utils.reply.error(interaction, 'ACCESS_DENIED');
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                await handleError(err, commandType, command.data?.name || interaction.commandName, interaction, logger, utils);
            }

        } else if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId) || interaction.client.buttons.find(b => b.isPrefix && interaction.customId.startsWith(b.customId));
            if (!button) return;

            try {
                await button.execute(interaction, logger);
            } catch (err) {
                await handleError(err, 'Button', interaction.customId, interaction, logger, utils);
            }

        } else if (interaction.isStringSelectMenu()) {
            const menu = interaction.client.selectMenus.get(interaction.customId);
            if (!menu) return;

            try {
                await menu.execute(interaction, logger);
            } catch (err) {
                await handleError(err, 'SelectMenu', interaction.customId, interaction, logger, utils);
            }
        }
    }
};