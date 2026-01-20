'use strict';

const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits } = require('discord.js');
const { roles } = require('../../config/default.json');

module.exports = {
    category: '`⭐` V.I.P',
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Zmiana pseudonimu na serwerze.')
        .addStringOption(option =>
            option.setName('nowy')
                .setDescription('Nowy pseudonim.')
                .setMaxLength(32)
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        if (!interaction.member.roles.cache.has(roles.changeNickname) || !interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await utils.reply.error(interaction, 'MISSING_ROLE');
        }

        const oldNick = interaction.member.nickname;

        const newNick = interaction.options.getString('nowy');

        if (!newNick && !oldNick) {
            return await utils.reply.error(interaction, 'NICKNAME_NOT_SET');
        }

        if (oldNick === newNick) {
            return await utils.reply.error(interaction, 'SAME_NICKNAME_ERROR');
        }

        try {
            await interaction.member.setNickname(newNick);

            const successEmbed = utils.createEmbed({
                title: 'Pseudonim zmieniony',
                description: `\`✏️\` **Wcześniejszy:** ${oldNick ?? interaction.user.username}\n\`🌟\` **Nowy:** ${newNick ?? interaction.user.username}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Nick] ${err}`);
            await utils.reply.error(interaction, 'NICKNAME_ERROR');
        }
    },
};