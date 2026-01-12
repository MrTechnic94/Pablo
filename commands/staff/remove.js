'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageRoles],
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
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, logger) {
        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!targetUser) {
            return await reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await reply.error(interaction, 'BOT_HIERARCHY_TOO_LOW');
        }

        if (!targetUser.roles.cache.has(role.id)) {
            return await reply.error(interaction, 'USER_NOT_HAS_ROLE', role.id);
        }

        try {
            await targetUser.roles.remove(role);

            const successEmbed = createEmbed({
                title: 'Rola zabrana',
                description: `\`🎭\` **Usunięto rolę:** ${role}\n\`👤\` **Użytkownikowi:** ${targetUser}\n\`📛\` **Polecenia użył:** ${interaction.user}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Remove] ${err}`);
            await reply.error(interaction, 'ROLE_REMOVE_ERROR');
        }
    },
};