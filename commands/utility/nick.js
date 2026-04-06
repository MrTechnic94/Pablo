'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    botPermissions: [PermissionFlagsBits.ManageNicknames],
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Zmiana pseudonimu na serwerze.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(option => option
            .setName('nowy')
            .setDescription('Nowy pseudonim.')
            .setMaxLength(32)
            .setRequired(false)
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        try {
            const requiredRole = await utils.db.hGet(`guilds:${interaction.guild.id}:settings`, 'changeNicknameRoleId');

            if (!requiredRole) {
                return await utils.interface.sendError(interaction, 'RECORD_NOT_FOUND');
            }

            if (!interaction.member.roles.cache.has(requiredRole) || !interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                return await utils.interface.sendError(interaction, 'MISSING_ROLE');
            }

            const oldNick = interaction.member.nickname;

            const newNick = interaction.options.getString('nowy');

            if (!newNick && !oldNick) {
                return await utils.interface.sendError(interaction, 'NICKNAME_NOT_SET');
            }

            if (oldNick === newNick) {
                return await utils.interface.sendError(interaction, 'SAME_NICKNAME_ERROR');
            }

            await interaction.member.setNickname(newNick);

            const successEmbed = utils.interface.createEmbed({
                title: 'Pseudonim zmieniony',
                description: `\`✏️\` **Wcześniejszy:** ${oldNick ?? interaction.user.username}\n\`🌟\` **Nowy:** ${newNick ?? interaction.user.username}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Nick] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.interface.sendError(interaction, 'NICKNAME_ERROR');
        }
    },
};