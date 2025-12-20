'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const { roles } = require('../../config/default.json');

module.exports = {
    category: '`📛` Administracja',
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
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.roles.cache.has(roles.admin) && !interaction.member.roles.cache.has(roles.owner) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '`❌` Nie masz wymaganej roli.', flags: MessageFlags.Ephemeral });
        }

        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.reply({ content: '`❌` Nie mam uprawnień do zarządzania rolami.', flags: MessageFlags.Ephemeral });
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await interaction.reply({ content: '`❌` Rola, którą chcesz nadać, znajduje się wyżej niż moja najwyższa rola.', flags: MessageFlags.Ephemeral });
        }

        if (targetUser.roles.cache.has(role.id)) {
            return await interaction.reply({ content: `\`❌\` Użytkownik ${targetUser} już posiada rolę ${role}.`, flags: MessageFlags.Ephemeral });
        }

        try {
            await targetUser.roles.add(role);

            const successEmbed = createEmbed({
                title: 'Rola nadana',
                description: `\`🎭\` **Nadano rolę:** ${role}\n\`👤\` **Użytkownikowi:** ${targetUser}\n\`📛\` **Polecenia użył:** ${interaction.user}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Give] ${err}`);
            await interaction.reply({ content: '`❌` Nie udało się nadać roli.', flags: MessageFlags.Ephemeral });
        }
    },
};