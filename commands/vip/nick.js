'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const { roles } = require('../../config/default.json');
const reply = require('../../lib/utils/responder');

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
        if (!interaction.member.roles.cache.has(roles.admin) && !interaction.member.roles.cache.has(roles.changeNickname) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await reply.error(interaction, 'MISSING_ROLE');
        }

        const oldNick = interaction.member.nickname;

        const newNick = interaction.options.getString('nowy');

        if (!newNick && !oldNick) {
            return await reply.error(interaction, 'NICKNAME_NOT_SET');
        }

        if (oldNick === newNick) {
            return await reply.error(interaction, 'SAME_NICKNAME_ERROR');
        }

        try {
            await interaction.member.setNickname(newNick);

            const successEmbed = createEmbed({
                title: 'Zmiana udana',
                description: `\`✏️\` **Stary pseudonim:** ${oldNick ?? interaction.user.username}\n\`⭐\` **Nowy pseudonim:** ${newNick ?? interaction.user.username}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Nick] ${err}`);
            await reply.error(interaction, 'NICKNAME_ERROR');
        }
    },
};