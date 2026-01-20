'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageRoles],
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
        const { utils } = interaction.client;

        const targetUser = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!targetUser) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await utils.reply.error(interaction, 'ROLE_HIGHER_THAN_BOT');
        }

        if (targetUser.roles.cache.has(role.id)) {
            return await utils.reply.error(interaction, 'USER_ALREADY_HAS_ROLE', role.id);
        }

        try {
            await targetUser.roles.add(role);

            const successEmbed = utils.createEmbed({
                title: 'Rola nadana',
                description: `\`🎭\` **Nadano rolę:** ${role}\n\`👤\` **Użytkownikowi:** ${targetUser}\n\`📛\` **Polecenia użył:** ${interaction.user}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Give] ${err}`);
            await utils.reply.error(interaction, 'ROLE_GIVE_ERROR');
        }
    },
};