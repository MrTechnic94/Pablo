'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { guildRoles, embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Nadaje wybraną rolę użytkownikowi.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, któremu chcesz nadać rolę.')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('rola')
                .setDescription('Rola, którą chcesz nadać użytkownikowi.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Sprawdza czy uzytkownik posiada role administratora lub wlasciciela
        if (!interaction.member.roles.cache.has(guildRoles.admin) && !interaction.member.roles.cache.has(guildRoles.owner) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz wymaganej roli.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        // Sprawdzenie, czy bot ma uprawnienia do nadania roli
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({ content: '❌ Nie mam uprawnień do zarządzania rolami.', flags: MessageFlags.Ephemeral });
        }

        // Sprawdzenie, czy bot moze nadac te role. Czy nie jest wyzej w hierarchii
        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await interaction.reply({ content: '❌ Rola, którą chcesz nadać, znajduje się wyżej niż moja najwyższa rola.', flags: MessageFlags.Ephemeral });
        }

        // Sprawdzenie, czy uzytkownik juz ma te role
        if (targetUser.roles.cache.has(role.id)) {
            return await interaction.reply({ content: `❌ Użytkownik ${targetUser} już posiada rolę ${role}.`, flags: MessageFlags.Ephemeral });
        }

        try {
            await targetUser.roles.add(role);

            const successEmbed = new EmbedBuilder()
                .setTitle('Rola nadana')
                .setDescription(`**• Dodałeś rolę:** ${role}\n**• Użytkownikowi:** ${targetUser}\n**• Komendy użył:** ${interaction.user}`)
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - give] ${err}`);
            return await interaction.reply({ content: '❌ Nie udało się nadać roli.', flags: MessageFlags.Ephemeral });
        }
    }
};