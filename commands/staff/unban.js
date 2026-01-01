'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
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
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await reply.error(interaction, 'BAN_MEMBERS_PERMISSION_DENY');
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await reply.error(interaction, 'BOT_BAN_MEMBERS_PERMISSION_DENY');
        }

        const userId = interaction.options.getString('id_użytkownika');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return await reply.error(interaction, 'USER_NOT_BANNED');
            }

            await interaction.guild.bans.remove(userId, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik odbanowany',
                description: `\`👤\` **Odbanowano:** ${bannedUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${reason}`,
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Unban] ${err}`);
            await reply.error(interaction, 'UNBAN_ERROR');
        }
    },
};