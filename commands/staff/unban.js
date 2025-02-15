'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { embedOptions } = require('../../config/default');

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
        ),
    async execute(interaction) {
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

            const successEmbed = new EmbedBuilder()
                .setTitle('Użytkownik odbanowany')
                .setDescription(`\`👤\` **Odbanowano:** ${bannedUser.user.tag}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`🚨\` **Powód:** ${reason}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - unban] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas odbanowywania użytkownika.', flags: MessageFlags.Ephemeral });
        }
    }
};