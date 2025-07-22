'use strict';

const { Events, MessageFlags } = require('discord.js');
const { toggleRoles } = require('../../plugins/toggleRoles');
const { guildRoles } = require('../../config/default.json');

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
                    await interaction.followUp({ content: '❌ Wystąpił błąd podczas wykonywania komendy.', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: '❌ Wystąpił błąd podczas wykonywania komendy.', flags: MessageFlags.Ephemeral });
                }
            }
        } else if (interaction.isButton()) {
            try {
                switch (interaction.customId) {
                    // Weryfikacja
                    case 'accept_rules': {
                        if (interaction.member.roles.cache.has(guildRoles.user)) {
                            return await interaction.reply({
                                content: '❌ Już zaakceptowałeś regulamin.',
                                flags: MessageFlags.Ephemeral,
                            });
                        }
                        await interaction.member.roles.add(guildRoles.user);
                        await interaction.reply({
                            content: 'Dziękujemy za akceptację regulaminu!',
                            flags: MessageFlags.Ephemeral,
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
                            additional_gamer: guildRoles.gamer,
                            additional_xbox: guildRoles.xbox,
                            additional_playstation: guildRoles.playstation,
                            additional_pc: guildRoles.pc,
                            additional_phone: guildRoles.phone,
                        };
                        const roleId = roleMapping[interaction.customId];
                        await toggleRoles(interaction, roleId);
                        break;
                    }

                    // Auto role kolorow
                    case 'colors_black':
                    case 'colors_red':
                    case 'colors_blue':
                    case 'colors_magenta':
                    case 'colors_green': {
                        const roleMap = {
                            'colors_black': guildRoles.black,
                            'colors_red': guildRoles.red,
                            'colors_blue': guildRoles.blue,
                            'colors_magenta': guildRoles.magenta,
                            'colors_green': guildRoles.green
                        };

                        const roleId = roleMap[interaction.customId];
                        if (!roleId) break;

                        const member = interaction.member;
                        const alreadyHadRole = member.roles.cache.has(roleId);

                        for (const id of Object.values(roleMap)) {
                            if (member.roles.cache.has(id)) {
                                await member.roles.remove(id);
                            }
                        }

                        if (alreadyHadRole) {
                            await interaction.reply({
                                content: `Rola <@&${roleId}> została usunięta.`,
                                flags: MessageFlags.Ephemeral
                            });
                        } else {
                            await member.roles.add(roleId);
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
                    content: '❌ Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    },
};