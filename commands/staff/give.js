'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

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
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, logger) {
        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await reply.error(interaction, 'BOT_ROLE_PERMISSION_DENY');
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await reply.error(interaction, 'ROLE_HIGHER_THAN_BOT');
        }

        if (targetUser.roles.cache.has(role.id)) {
            return await reply.error(interaction, 'USER_ALREADY_HAS_ROLE', role.id);
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
            await reply.error(interaction, 'ROLE_GIVE_ERROR');
        }
    },
};