'use strict';

const { Events, MessageFlags } = require('discord.js');
const { roles } = require('../../config/default.json');

// Role - Kolory
const roleMap = {
    'colors_black': roles.black,
    'colors_red': roles.red,
    'colors_blue': roles.blue,
    'colors_magenta': roles.magenta,
    'colors_green': roles.green
};

const colorRoleIds = Object.values(roleMap);

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
            const commandType = interaction.isChatInputCommand() ? 'Slash' : 'Context';

            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`[${commandType}] Command '${interaction.commandName}' not found.`);
                return await interaction.reply({ content: '`❌` Polecenie które próbujesz wykonwać nie istnieje.', flags: MessageFlags.Ephemeral });
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                const commandName = command.__fileName || command.data?.name || interaction.commandName;

                const commandNameBig = commandName.charAt(0).toUpperCase() + commandName.slice(1);

                logger.error(`[${commandType} ▸ ${commandNameBig}] ${err}`);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: '`❌` Wystąpił problem podczas wykonywania polecenia.', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: '`❌` Wystąpił problem podczas wykonywania polecenia.', flags: MessageFlags.Ephemeral });
                }
            }
        } else if (interaction.isButton()) {
            try {
                switch (interaction.customId) {
                    // Weryfikacja
                    case 'accept_rules': {
                        if (interaction.member.roles.cache.has(roles.user)) {
                            return await interaction.reply({
                                content: '`❌` Już zaakceptowałeś regulamin.',
                                flags: MessageFlags.Ephemeral
                            });
                        }

                        await interaction.member.roles.add(roles.user);
                        await interaction.reply({
                            content: '`🔹` Dziękujemy za akceptację regulaminu.',
                            flags: MessageFlags.Ephemeral
                        });
                        break;
                    }
                }
            } catch (err) {
                logger.error(`[Slash] Error while adding role:\n${err}`);
                await interaction.reply({
                    content: '`❌` Wystąpił nieoczekiwany problem. Spróbuj ponownie później.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } else if (interaction.isStringSelectMenu()) {
            try {
                switch (interaction.customId) {
                    // Auto role - kolorow
                    case 'colors_menu': {
                        const roleId = roleMap[interaction.values[0]];

                        if (interaction.member.roles.cache.has(roleId)) {
                            return await interaction.reply({
                                content: '`❌` Posiadasz już taką rolę.',
                                flags: MessageFlags.Ephemeral
                            });
                        }

                        const currentRoles = Array.from(interaction.member.roles.cache.keys());

                        const newRoles = currentRoles
                            .filter(id => !colorRoleIds.includes(id))
                            .concat(roleId);

                        await interaction.member.roles.set(newRoles);
                        await interaction.reply({
                            content: `\`➕\` Twój nowy kolor to <@&${roleId}>.`,
                            flags: MessageFlags.Ephemeral
                        });
                        break;
                    }
                }
            } catch (err) {
                logger.error(`[Slash] Error in select menu:\n${err}`);
                await interaction.reply({
                    content: '`❌` Wystąpił nieoczekiwany problem. Spróbuj ponownie później.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};