'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.BanMembers],
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Odbanuj użytkownika.')
        .addStringOption(option =>
            option.setName('id_użytkownika')
                .setDescription('Użytkownik do odbanowania.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód odbanowania.')
                .setRequired(false)
                .setMaxLength(450)
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction, logger) {
        const userId = interaction.options.getString('id_użytkownika');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!banInfo) {
                return await reply.error(interaction, 'USER_NOT_BANNED');
            }

            await interaction.guild.bans.remove(userId, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik odbanowany',
                description: `\`👤\` **Odbanowano:** ${banInfo.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`,
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Unban] ${err}`);
            await reply.error(interaction, 'UNBAN_ERROR');
        }
    },
};