'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Wyświetla lub edytuj ustawienia bota.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('Wyświetla aktywne ustawienia.')
        )
        .addSubcommand(sub =>
            sub.setName('nickname')
                .setDescription('Ustawia lub usuwa rolę zmiany pseudonimu.')
                .addRoleOption(option =>
                    option.setName('rola')
                        .setDescription('Rola zmiany pseudonimu.')
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub.setName('snitch')
                .setDescription('Ustawia lub usuwa kanał systemu zgłoszeń.')
                .addChannelOption(option =>
                    option.setName('kanał')
                        .setDescription('Kanał zgłoszeń.')
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread)
                )
        )
        .addSubcommand(sub =>
            sub.setName('memes')
                .setDescription('Ustawia lub usuwa kanał z memami (automatyczne reakcje).')
                .addChannelOption(option =>
                    option.setName('kanał')
                        .setDescription('Kanał memy.')
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread)
                )
        )
        .addSubcommand(sub =>
            sub.setName('statistics')
                .setDescription('Ustawia lub usuwa kanał do wyświetlania statystyk.')
                .addChannelOption(option =>
                    option.setName('kanał')
                        .setDescription('Kanał statystyk.')
                        .setRequired(false)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.AnnouncementThread)
                )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;
        const subcommand = interaction.options.getSubcommand();

        try {
            const dbKey = `guild:${interaction.guild.id}`;

            switch (subcommand) {
                case 'view': {
                    const settings = await utils.db.hGetAll(dbKey);

                    const successEmbed = utils.createEmbed({
                        title: 'Ustawienia serwera',
                        fields: [
                            {
                                name: '`✏️` Rola zmiany pseudonium',
                                value: settings.changeNicknameRole ? `**•** <@&${settings.changeNicknameRole}>` : '**•** Nie ustawiono.',
                                inline: false
                            },
                            {
                                name: '`🔎` Kanał zgłoszeń',
                                value: settings.snitchChannel ? `**•** <#${settings.snitchChannel}>` : '**•** Nie ustawiono.',
                                inline: false
                            },
                            {
                                name: '`😎` Kanał memów',
                                value: settings.memesChannel ? `**•** <#${settings.memesChannel}>` : '**•** Nie ustawiono.',
                                inline: false
                            },
                            {
                                name: '`📈` Kanał statystyk',
                                value: settings.statisticsEmbed ? `**•** <#${settings.statisticsEmbed}>` : '**•** Nie ustawiono.',
                                inline: false
                            }
                        ],
                    });
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'nickname': {
                    const role = interaction.options.getRole('rola');
                    const currentRole = await utils.db.hGet(dbKey, 'changeNicknameRole');

                    if (!role) {
                        if (currentRole) {
                            await utils.db.hDel(dbKey, 'changeNicknameRole');

                            logger.info(`[Slash ▸ Settings] Nickname role removed for '${interaction.guild.id}'.`);
                            return await utils.reply.success(interaction, 'ROLE_REMOVED');
                        } else {
                            return await utils.reply.error(interaction, 'ROLE_NOT_SET');
                        }
                    }

                    if (role.id === currentRole) {
                        return await utils.reply.error(interaction, 'SAME_RECORD');
                    }

                    await utils.db.hSet(dbKey, 'changeNicknameRole', role.id);

                    const successEmbed = utils.createEmbed({
                        title: 'Akcja wykonana',
                        description: `\`✅\` Pomyślnie ustawiono rolę <@&${role.id}> jako wymaganą do zmiany pseudonimu.`,
                    });

                    logger.info(`[Slash ▸ Settings] Nickname role set to '${role.id}' for '${interaction.guild.id}'.`);
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'snitch': {
                    const channel = interaction.options.getChannel('kanał');
                    const currentChannel = await utils.db.hGet(dbKey, 'snitchChannel');

                    if (!channel) {
                        if (currentChannel) {
                            await utils.db.hDel(dbKey, 'snitchChannel');

                            logger.info(`[Slash ▸ Settings] Snitch channel removed for '${interaction.guild.id}'.`);
                            return await utils.reply.success(interaction, 'CHANNEL_REMOVED');
                        } else {
                            return await utils.reply.error(interaction, 'CHANNE_NOT_SET');
                        }
                    }

                    if (channel.id === currentChannel) {
                        return await utils.reply.error(interaction, 'SAME_RECORD');
                    }

                    await utils.db.hSet(dbKey, 'snitchChannel', channel.id);

                    const successEmbed = utils.createEmbed({
                        title: 'Akcja wykonana',
                        description: `\`✅\` Pomyślnie ustawiono kanał systemu zgłoszeń na <#${channel.id}>.`,
                    });

                    logger.info(`[Slash ▸ Settings] Snitch channel set to '${channel.id}' for '${interaction.guild.id}'.`);
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'memes': {
                    const channel = interaction.options.getChannel('kanał');
                    const currentChannel = await utils.db.hGet(dbKey, 'memesChannel');

                    if (!channel) {
                        if (currentChannel) {
                            await utils.db.hDel(dbKey, 'memesChannel');

                            logger.info(`[Slash ▸ Settings] Memes channel removed for '${interaction.guild.id}'.`);
                            return await utils.reply.success(interaction, 'CHANNEL_REMOVED');
                        } else {
                            return await utils.reply.error(interaction, 'CHANNE_NOT_SET');

                        }
                    }

                    if (channel.id === currentChannel) {
                        return await utils.reply.error(interaction, 'SAME_RECORD');
                    }

                    await utils.db.hSet(dbKey, 'memesChannel', channel.id);

                    const successEmbed = utils.createEmbed({
                        title: 'Akcja wykonana',
                        description: `\`✅\` Pomyślnie ustawiono kanał memów na <#${channel.id}>.`,
                    });

                    logger.info(`[Slash ▸ Settings] Memes channel set to '${channel.id}' for '${interaction.guild.id}'.`);
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'statistics': {
                    const channel = interaction.options.getChannel('kanał');
                    const currentChannel = await utils.db.hGet(dbKey, 'statisticsChannel');

                    if (!channel) {
                        if (currentChannel) {
                            await utils.db.hDel(dbKey, 'statisticsChannel');
                            await utils.db.sRem('statistics:activeGuilds', interaction.guild.id);

                            logger.info(`[Slash ▸ Settings] Statistics channel removed for '${interaction.guild.id}'.`);
                            return await utils.reply.success(interaction, 'CHANNEL_REMOVED');

                        } else {
                            return await utils.reply.error(interaction, 'CHANNE_NOT_SET');
                        }
                    }

                    if (channel.id === currentChannel) {
                        return await utils.reply.error(interaction, 'SAME_RECORD');
                    }

                    await utils.db.hSet(dbKey, 'statisticsChannel', channel.id);

                    await utils.db.sAdd('statistics:activeGuilds', interaction.guild.id);

                    const successEmbed = utils.createEmbed({
                        title: 'Akcja wykonana',
                        description: `\`✅\`Statystyki będą od teraz aktualizowane na ${channel}.\n\`🕒\` Aktualizacja co \`5 minuty\`.`
                    });

                    logger.info(`[Slash ▸ Settings] Statistics channel set to '${channel.id}' for '${interaction.guild.id}'.`);
                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }
            }
        } catch (err) {
            logger.error(`[Slash ▸ Settings] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'SETTINGS_ERROR');
        }
    },
};