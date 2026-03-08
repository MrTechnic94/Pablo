'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Zarządzanie wyciszeniami użytkowników.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Nakłada wyciszenie na użytkownika.')
                .addUserOption(option =>
                    option.setName('użytkownik')
                        .setDescription('Użytkownik do wyciszenia.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('czas')
                        .setDescription('Czas trwania. Przykład: 1d 1h 30m.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('powód')
                        .setDescription('Powód wyciszenia.')
                        .setRequired(false)
                        .setMaxLength(500)
                )
        )
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Zmienia czas trwania aktywnego wyciszenia.')
                .addUserOption(option =>
                    option.setName('użytkownik')
                        .setDescription('Użytkownik, którego wyciszenie chcesz edytować.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('czas')
                        .setDescription('Nowy czas trwania. Przykład: 1d 1h 30m.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('powód')
                        .setDescription('Powód zmiany czasu.')
                        .setRequired(false)
                        .setMaxLength(500)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Odcisza użytkownika przed czasem.')
                .addUserOption(option =>
                    option.setName('użytkownik')
                        .setDescription('Użytkownik do odciszenia.')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName('powód')
                        .setDescription('Powód odciszenia.')
                        .setRequired(false)
                        .setMaxLength(500)
                )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;
        const subcommand = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('użytkownik');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

            if (!member) {
                return await utils.reply.error(interaction, 'USER_NOT_FOUND');
            }

            if (subcommand === 'add' || subcommand === 'edit') {
                if (targetUser.id === interaction.user.id) {
                    return await utils.reply.error(interaction, 'CANT_TIMEOUT_SELF');
                }

                if (interaction.member.roles.highest.position <= member.roles.highest.position) {
                    return await utils.reply.error(interaction, 'ROLE_TOO_HIGH');
                }

                if (!member.moderatable) {
                    return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
                }
            }

            switch (subcommand) {
                case 'add': {
                    const rawTime = interaction.options.getString('czas');
                    const timeInfo = utils.parseTimeString(rawTime);

                    if (!timeInfo) {
                        return await utils.reply.error(interaction, 'INVALID_TIME_FORMAT');
                    }

                    if (member.isCommunicationDisabled()) {
                        return await utils.reply.error(interaction, 'USER_IS_TIMED_OUT');
                    }

                    const embedDM = utils.createEmbed({
                        title: 'Zostałeś wyciszony',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`🕒\` **Czas:** ${timeInfo.formatted}\n\`💬\` **Powód:** ${reason}`
                    });

                    await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Timeout] Failed to send DM to '${targetUser.id}'.`));

                    await member.timeout(timeInfo.seconds * 1000, { reason: reason });

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik wyciszony',
                        description: `\`👤\` **Użytkownik:** <@${targetUser.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`🕒\` **Czas:** ${timeInfo.formatted}\n\`💬\` **Powód:** ${reason}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'edit': {
                    if (!member.isCommunicationDisabled()) {
                        return await utils.reply.error(interaction, 'USER_IS_NOT_TIMED_OUT');
                    }

                    const rawTime = interaction.options.getString('czas');
                    const timeInfo = utils.parseTimeString(rawTime);

                    const now = Date.now();
                    const currentTimeoutEnd = member.communicationDisabledUntilTimestamp;
                    const newTimeoutEnd = now + (timeInfo.seconds * 1000);

                    const diff = Math.abs(newTimeoutEnd - currentTimeoutEnd);

                    if (diff < 10000) {
                        return await utils.reply.error(interaction, 'USER_TIMEOUT_SAME_TIME');
                    }

                    if (!timeInfo) {
                        return await utils.reply.error(interaction, 'INVALID_TIME_FORMAT');
                    }

                    const embedDM = utils.createEmbed({
                        title: 'Czas wyciszenia został zmieniony',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`🕒\` **Nowy czas:** ${timeInfo.formatted}\n\`💬\` **Powód:** ${reason}`
                    });

                    await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Timeout] Failed to send DM to '${targetUser.id}'.`));

                    await member.timeout(timeInfo.seconds * 1000, { reason: reason });

                    const successEmbed = utils.createEmbed({
                        title: 'Zaktualizowano czas wyciszenia',
                        description: `\`👤\` **Użytkownik:** <@${targetUser.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`🕒\` **Nowy czas:** ${timeInfo.formatted}\n\`💬\` **Powód:** ${reason}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove': {
                    if (!member.isCommunicationDisabled()) {
                        return await utils.reply.error(interaction, 'USER_IS_NOT_TIMED_OUT');
                    }

                    const embedDM = utils.createEmbed({
                        title: 'Zostałeś odciszony',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
                    });

                    await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Timeout] Failed to send DM to '${targetUser.id}'.`));

                    await member.timeout(null, { reason: reason });

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik odciszony',
                        description: `\`👤\` **Użytkownik:** <@${targetUser.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
                    });

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                default:
                    await utils.reply.error(interaction, 'PARAMETER_NOT_FOUND');
            }
        } catch (err) {
            logger.error(`[Slash ▸ Timeout] An error occurred for '${interaction.guild.id}':\n${err}`);
            let errorKey = 'TIMEOUT_ERROR';

            if (subcommand === 'remove') errorKey = 'TIMEOUT_REMOVE_ERROR';

            await utils.reply.error(interaction, errorKey);
        }
    },
};