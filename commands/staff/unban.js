'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.BanMembers],
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Odbanuj użytkownika.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('id_użytkownika')
                .setDescription('Użytkownik do odbanowania.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('powód')
                .setDescription('Powód odbanowania.')
                .setRequired(false)
                .setMaxLength(500)
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const userId = interaction.options.getString('id_użytkownika');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const userInfo = await interaction.guild.bans.fetch(userId).catch(() => null);

            if (!userInfo) {
                return await utils.reply.error(interaction, 'USER_NOT_BANNED');
            }

            await interaction.guild.bans.remove(userId, { reason: reason });

            const successEmbed = utils.createEmbed({
                title: 'Użytkownik odbanowany',
                description: `\`👤\` **Odbanowano:** <@${userInfo.user.id}>\n\`🔨\` **Moderator:** <@${interaction.user.id}>\n\`💬\` **Powód:** ${reason}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Unban] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'UNBAN_ERROR');
        }
    },
};