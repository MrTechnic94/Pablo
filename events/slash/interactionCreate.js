'use strict';

const checkBotPermissions = require('../../lib/utils/permissions');
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        const { utils } = interaction.client;

        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            const commandType = interaction.isChatInputCommand() ? 'Slash' : 'Context';
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`[${commandType}] Command '${interaction.commandName}' not found for '${interaction.guild.id}'.`);
                return await utils.interface.sendError(interaction, 'COMMAND_NOT_FOUND');
            }

            // Permisje bota
            if (command.botPermissions && !(await checkBotPermissions(interaction, command.botPermissions))) return;

            if (command.ownerOnly && interaction.user.id !== process.env.BOT_OWNER_ID) {
                return await utils.interface.sendError(interaction, 'ACCESS_DENIED');
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                const commandName = command.__fileName || command.data?.name || interaction.commandName;
                const commandNameBig = commandName.charAt(0).toUpperCase() + commandName.slice(1);

                await utils.error(err, commandType, commandNameBig, interaction, logger, utils);
            }

            return;
        }

        if (interaction.isButton()) {
            const customId = interaction.customId;
            const button = interaction.client.buttons.get(customId) || interaction.client.buttons.find(b => b.isPrefix && customId.startsWith(b.customId));

            if (!button) return;
            if (button.botPermissions && !(await checkBotPermissions(interaction, button.botPermissions))) return;

            try {
                await button.execute(interaction, logger);
            } catch (err) {
                const buttonName = interaction.client.buttons.get(interaction.customId) || interaction.nt.buttons.find(btn => btn.isPrefix && interaction.custclieomId.startsWith(btn.customId));
                const buttonNameBig = buttonName.charAt(0).toUpperCase() + buttonName.slice(1);

                await utils.error(err, 'Button', buttonNameBig, interaction, logger, utils);
            }

            return;
        }

        if (interaction.isStringSelectMenu()) {
            const menu = interaction.client.selectMenus.get(interaction.customId);

            if (!menu) return;
            if (menu.botPermissions && !(await checkBotPermissions(interaction, menu.botPermissions))) return;

            try {
                await menu.execute(interaction, logger);
            } catch (err) {
                const menuName = menu.__fileName || menu.data?.name || (interaction.isCommand?.() ? interaction.commandName : interaction.customId);
                const menuNameBig = menuName.charAt(0).toUpperCase() + menuName.slice(1);

                await utils.error(err, 'SelectMenu', menuNameBig, interaction, logger, utils);
            }

            return;
        }
    },
};