'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageRoles],
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Zabierz wybraną rolę użytkownikowi.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Użytkownik, któremu chcesz zabrać rolę.')
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName('rola')
                .setDescription('Rola, którą chcesz zabrać użytkownikowi.')
                .setRequired(true)
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!targetUser) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await utils.reply.error(interaction, 'BOT_HIERARCHY_TOO_LOW');
        }

        if (!targetUser.roles.cache.has(role.id)) {
            return await utils.reply.error(interaction, 'USER_NOT_HAS_ROLE', role.id);
        }

        try {
            await targetUser.roles.remove(role);

            const successEmbed = utils.createEmbed({
                title: 'Rola zabrana',
                description: `\`🎭\` **Usunięto rolę:** ${role}\n\`👤\` **Użytkownikowi:** ${targetUser}\n\`📛\` **Polecenia użył:** ${interaction.user}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Remove] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'ROLE_REMOVE_ERROR');
        }
    },
};