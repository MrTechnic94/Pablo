'use strict';

const { Events, MessageFlags } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(logger, interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                return logger.error(`[InteractionCreate] Command ${interaction.commandName} not found.`);
            }

            try {
                await command.execute(interaction, logger);
            } catch (err) {
                logger.error(`[InteractionCreate] Error while executing ${interaction.commandName} command:\n${err}`);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: '❌ Wystąpił problem podczas wykonywania komendy.', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: '❌ Wystąpił problem podczas wykonywania komendy.', flags: MessageFlags.Ephemeral });
                }
            }
        } else if (interaction.isButton()) {
            const { roles } = require('../../config/default.json');

            try {
                switch (interaction.customId) {
                    // Weryfikacja
                    case 'accept_rules': {
                        if (interaction.member.roles.cache.has(roles.user)) {
                            return await interaction.reply({
                                content: '❌ Już zaakceptowałeś regulamin.',
                                flags: MessageFlags.Ephemeral
                            });
                        }
                        await interaction.member.roles.add(roles.user);
                        await interaction.reply({
                            content: 'Dziękujemy za akceptację regulaminu!',
                            flags: MessageFlags.Ephemeral
                        });
                        break;
                    }

                    // Auto role dodatkowe
                    case 'additional_gamer':
                    case 'additional_xbox':
                    case 'additional_playstation':
                    case 'additional_pc':
                    case 'additional_phone': {
                        const roleMapping = {
                            additional_gamer: roles.gamer,
                            additional_xbox: roles.xbox,
                            additional_playstation: roles.playstation,
                            additional_pc: roles.pc,
                            additional_phone: roles.phone
                        };

                        const roleId = roleMapping[interaction.customId];

                        if (interaction.member.roles.cache.has(roleId)) {
                            await interaction.member.roles.remove(roleId);
                            await interaction.reply({
                                content: `Rola <@&${roleId}> została usunięta.`,
                                flags: MessageFlags.Ephemeral
                            });
                        } else {
                            await interaction.member.roles.add(roleId);
                            await interaction.reply({
                                content: `Rola <@&${roleId}> została dodana.`,
                                flags: MessageFlags.Ephemeral
                            });
                        }
                        break;
                    }

                    // Auto role kolorow
                    case 'colors_black':
                    case 'colors_red':
                    case 'colors_blue':
                    case 'colors_magenta':
                    case 'colors_green': {
                        const roleMap = {
                            'colors_black': roles.black,
                            'colors_red': roles.red,
                            'colors_blue': roles.blue,
                            'colors_magenta': roles.magenta,
                            'colors_green': roles.green
                        };

                        const roleId = roleMap[interaction.customId];
                        if (!roleId) break;

                        for (const id of Object.values(roleMap)) {
                            if (interaction.member.roles.cache.has(id)) {
                                await interaction.member.roles.remove(id);
                            }
                        }

                        if (interaction.member.roles.cache.has(roleId)) {
                            await interaction.reply({
                                content: `Rola <@&${roleId}> została usunięta.`,
                                flags: MessageFlags.Ephemeral
                            });
                        } else {
                            await interaction.member.roles.add(roleId);
                            await interaction.reply({
                                content: `Rola <@&${roleId}> została dodana.`,
                                flags: MessageFlags.Ephemeral
                            });
                        }
                    }
                }
            } catch (err) {
                logger.error(`[InteractionCreate] Error while adding role:\n${err}`);
                await interaction.reply({
                    content: '❌ Wystąpił nieoczekiwany problem. Spróbuj ponownie później.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};