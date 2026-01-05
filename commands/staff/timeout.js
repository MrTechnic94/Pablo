'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { parseTimeString } = require('../../lib/utils/parseTime');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Nałóż wyciszenie na użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik do wyciszenia.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('czas')
                .setDescription('Czas trwania wyciszenia (np. 1d, 1h, 30m).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód wyciszenia.')
                .setRequired(false)
                .setMaxLength(450)
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    async execute(interaction, logger) {
        const targetUser = interaction.options.getUser('użytkownik');
        const rawTime = interaction.options.getString('czas');
        const reason = interaction.options.getString('powód') || 'Brak.';

        const timeInfo = parseTimeString(rawTime);

        if (!timeInfo) {
            return await reply.error(interaction, 'INVALID_TIME_FORMAT');
        }

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);

            if (member.isCommunicationDisabled()) {
                return await reply.error(interaction, 'USER_IS_TIMED_OUT');
            }

            const embedDM = createEmbed({
                title: 'Zostałeś wyciszony',
                description: `\`👤\` **Serwer:** ${interaction.guild.name}\n\`🕒\` **Czas wyciszenia:** ${timeInfo.formatted}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await targetUser.send({ embeds: [embedDM] }).catch(() => logger.warn(`[Slash ▸ Timeout] Failed to send DM to '${targetUser.tag}'.`));

            await member.timeout(timeInfo.seconds * 1000, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik wyciszony',
                description: `\`👤\` **Użytkownik:** ${targetUser.tag}\n\`🕒\` **Czas wyciszenia:** ${timeInfo.formatted}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Timeout] ${err}`);
            await reply.error(interaction, 'TIMEOUT_ERROR');
        }
    },
};