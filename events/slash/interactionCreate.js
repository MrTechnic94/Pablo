'use strict';

const checkBotPermissions = require('../../lib/utils/permissionChecker');
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
                const commandName = command.__fileName || command.data?.name || interaction.commandName;
                const commandNameBig = commandName.charAt(0).toUpperCase() + commandName.slice(1);

                return await utils.handleError(err, commandType, commandNameBig, interaction, logger, utils);
            }
        } else if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId) || interaction.client.buttons.find(b => b.isPrefix && interaction.customId.startsWith(b.customId));

            if (!button || !(await checkBotPermissions(interaction, button.botPermissions))) return;

            try {
                return await button.execute(interaction, logger);
            } catch (err) {
                const buttonName = interaction.client.buttons.get(interaction.customId) || interaction.nt.buttons.find(btn => btn.isPrefix && interaction.custclieomId.startsWith(btn.customId));
                const buttonNameBig = buttonName.charAt(0).toUpperCase() + buttonName.slice(1);

                return await utils.handleError(err, 'Button', buttonNameBig, interaction, logger, utils);
            }
        } else if (interaction.isStringSelectMenu()) {
            const menu = interaction.client.selectMenus.get(interaction.customId);

            if (!menu || !(await checkBotPermissions(interaction, menu.botPermissions))) return;

            try {
                return await menu.execute(interaction, logger);
            } catch (err) {
                const menuName = menu.__fileName || menu.data?.name || (interaction.isCommand?.() ? interaction.commandName : interaction.customId);
                const menuNameBig = menuName.charAt(0).toUpperCase() + menuName.slice(1);

                return await utils.handleError(err, 'SelectMenu', menuNameBig, interaction, logger, utils);
            }
        }
    },
};