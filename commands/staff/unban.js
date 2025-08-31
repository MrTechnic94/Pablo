'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');

module.exports = {
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
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz uprawnień do odbanowywania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do odbanowywania użytkowników.', flags: MessageFlags.Ephemeral });
        }

        const userId = interaction.options.getString('id_użytkownika');
        const reason = interaction.options.getString('powód') || 'Brak.';

        try {
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.get(userId);

            if (!bannedUser) {
                return await interaction.reply({ content: '❌ Ten użytkownik nie jest zbanowany.', flags: MessageFlags.Ephemeral });
            }

            await interaction.guild.bans.remove(userId, reason);

            const successEmbed = createEmbed({
                title: 'Użytkownik odbanowany',
                description: `\`👤\` **Odbanowano:** ${bannedUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`,
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Unban] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas odbanowywania użytkownika.', flags: MessageFlags.Ephemeral });
        }
    },
};