'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageRoles],
    data: new SlashCommandBuilder()
        .setName('give')
        .setDescription('Nadaje wybraną rolę użytkownikowi.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
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
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const targetMember = interaction.options.getMember('użytkownik');
        const role = interaction.options.getRole('rola');

        if (!targetMember) {
            return await utils.reply.error(interaction, 'USER_NOT_FOUND');
        }

        if (interaction.guild.members.me.roles.highest.position <= role.position) {
            return await utils.reply.error(interaction, 'ROLE_HIGHER_THAN_BOT');
        }

        if (targetMember.roles.cache.has(role.id)) {
            return await utils.reply.error(interaction, 'USER_ALREADY_HAS_ROLE', role.id);
        }

        try {
            await targetMember.roles.add(role);

            const successEmbed = utils.createEmbed({
                title: 'Rola nadana',
                description: `\`🎭\` **Nadano rolę:** <@&${role.id}>\n\`👤\` **Użytkownikowi:** <@${targetMember.id}>\n\`📛\` **Polecenia użył:** <@${interaction.user.id}>`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Give] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'ROLE_GIVE_ERROR');
        }
    },
};