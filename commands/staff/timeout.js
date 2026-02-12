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
                        .setDescription('Czas trwania. Przykład: 1d, 1h, 30m.')
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

            switch (subcommand) {
                case 'add': {
                    if (targetUser.id === interaction.user.id) {
                        return await utils.reply.error(interaction, 'CANT_TIMEOUT_SELF');
                    }

                    const rawTime = interaction.options.getString('czas');
                    const timeInfo = utils.parseTimeString(rawTime);

                    if (!timeInfo) {
                        return await utils.reply.error(interaction, 'INVALID_TIME_FORMAT');
                    }

                    if (interaction.member.roles.highest.position <= member.roles.highest.position) {
                        return await utils.reply.error(interaction, 'ROLE_TOO_HIGH');
                    }

                    if (!member.moderatable) {
                        return await utils.reply.error(interaction, 'USER_NOT_PUNISHABLE');
                    }

                    if (member.isCommunicationDisabled()) {
                        return await utils.reply.error(interaction, 'USER_IS_TIMED_OUT');
                    }

                    const embedDM = utils.createEmbed({
                        title: 'Zostałeś wyciszony',
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🕒\` **Czas:** ${timeInfo.formatted}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
                    });

                    await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Timeout] Failed DM to '${targetUser.tag}'.`));

                    await member.timeout(timeInfo.seconds * 1000, { reason: reason });

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik wyciszony',
                        description: `\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🕒\` **Czas:** ${timeInfo.formatted}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
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
                        description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
                    });

                    await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Timeout] Failed DM to '${targetUser.tag}'.`));

                    await member.timeout(null, { reason: reason });

                    const successEmbed = utils.createEmbed({
                        title: 'Użytkownik odciszony',
                        description: `\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
                    });

                    return await interaction.reply({ embeds: [successEmbed] });
                }
            }
        } catch (err) {
            logger.error(`[Slash ▸ Timeout] An error occurred for '${interaction.guild.id}':\n${err}`);
            const errorKey = subcommand === 'add' ? 'TIMEOUT_ERROR' : 'TIMEOUT_REMOVE_ERROR';
            await utils.reply.error(interaction, errorKey);
        }
    },
};