'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, EmbedBuilder, MessageFlags } = require('discord.js');
const { guildRoles, embedOptions } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Zabierz wybraną rolę użytkownikowi.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, któremu chcesz zabrać rolę.')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('rola')
                .setDescription('Rola, którą chcesz zabrać użytkownikowi.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        // Sprawdza czy uzytkownik posiada role administratora lub wlasciciela
        if (!interaction.member.roles.cache.has(guildRoles.admin) && !interaction.member.roles.cache.has(guildRoles.owner) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz wymaganej roli.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        // Sprawdzenie, czy bot ma uprawnienia do zabrania roli
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do zarządzania rolami.', flags: MessageFlags.Ephemeral });
        }

        // Sprawdzenie, czy bot moze zabrac te role. Czy nie jest wyzej w hierarchii
        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await interaction.reply({ content: '❌ Rola, którą chcesz zabrać, znajduje się wyżej niż moja najwyższa rola.', flags: MessageFlags.Ephemeral });
        }

        // Sprawdzenie, czy uzytkownik juz ma te role
        if (!targetUser.roles.cache.has(role.id)) {
            return await interaction.reply({ content: `❌ Użytkownik ${targetUser} nie posiada roli ${role}.`, flags: MessageFlags.Ephemeral });
        }

        try {
            await targetUser.roles.remove(role);

            const successEmbed = new EmbedBuilder()
                .setTitle('Rola zabrana')
                .setDescription(`\`🎭\` **Zabrałeś rolę:** ${role}\n\`👤\` **Użytkownikowi:** ${targetUser}\n\`📛\` **Polecenia użył:** ${interaction.user}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - remove] ${err}`);
            return await interaction.reply({ content: '❌ Nie udało się zabrać roli.', flags: MessageFlags.Ephemeral });
        }
    },
};