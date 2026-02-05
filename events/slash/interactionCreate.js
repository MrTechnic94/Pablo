'use strict';

const { defaultPermissions } = require('../../config/default.json');
const { permissions } = require('../../locales/pl_PL');
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        const { utils } = interaction.client;

        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            const commandType = interaction.isChatInputCommand() ? 'Slash' : 'Context';

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`[${commandType}] Trying to execute '${interaction.commandName}' which is not found for '${interaction.guild.id}'.`);
                return await utils.reply.error(interaction, 'COMMAND_NOT_FOUND');
            }

            // Sprawdzanie permisji bota
            const requiredPermissions = command.botPermissions
                ? defaultPermissions.concat(command.botPermissions)
                : defaultPermissions;

            const botPermissions = interaction.channel.permissionsFor(interaction.guild.members.me);

            if (!botPermissions.has(requiredPermissions)) {
                const missing = botPermissions.missing(requiredPermissions);

                const missingPol = missing.map(p => `\`${permissions[p] || p}\``);

                return await utils.reply.error(
                    interaction,
                    missing.length === 1 ? 'BOT_MISSING_PERMISSION' : 'BOT_MISSING_PERMISSIONS',
                    missingPol.join(' ')
                );
            }

            // Sprawdzanie czy komenda jest tylko dla wlasciciela bota
            if (command.ownerOnly && interaction.user.id !== process.env.BOT_OWNER_ID) {
                return await utils.reply.error(interaction, 'ACCESS_DENIED');
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                const commandName = command.__fileName || command.data?.name || interaction.commandName;

                const commandNameBig = commandName.charAt(0).toUpperCase() + commandName.slice(1);

                logger.error(`[${commandType} ▸ ${commandNameBig}] An error occurred for '${interaction.guild.id}':\n${err}`);

                await utils.reply.error(interaction, 'COMMAND_ERROR');
            }
        } else if (interaction.isButton()) {
            // Buttons
            const { buttons } = interaction.client;

            const button = buttons.get(interaction.customId) || buttons.find(b => b.isPrefix && interaction.customId.startsWith(b.customId));

            if (!button) return;

            try {
                await button.execute(interaction, logger);
            } catch (err) {
                logger.error(`[Button ▸ ${interaction.customId}] An error occurred for '${interaction.guild.id}':\n${err}`);
                await utils.reply.error(interaction, 'COMMAND_ERROR');
            }
        } else if (interaction.isStringSelectMenu()) {
            // Select Menus
            const menu = interaction.client.selectMenus.get(interaction.customId);

            if (!menu) return;

            try {
                await menu.execute(interaction, logger);
            } catch (err) {
                logger.error(`[Selectmenu ▸ ${interaction.customId}] An error occurred for '${interaction.guild.id}':\n${err}`);
                await utils.reply.error(interaction, 'COMMAND_ERROR');
            }
        }
    }
};