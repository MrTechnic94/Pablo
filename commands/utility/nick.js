'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');
const { roles } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Zamiana pseudonimu na serwerze.')
        .addStringOption(option =>
            option.setName('nowy')
                .setDescription('Nowy pseudonim. Maksymalnie 32 znaki.')
                .setMaxLength(32)
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (!interaction.member.roles.cache.has(roles.admin) && !interaction.member.roles.cache.has(roles.changeNickname) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz wymaganej roli.', flags: MessageFlags.Ephemeral });
        }

        const oldNick = interaction.member.nickname;

        const newNick = interaction.options.getString('nowy');

        if (newNick === null && !oldNick) {
            return await interaction.reply({ content: '❌ Nie masz ustawionego pseudonimu.', flags: MessageFlags.Ephemeral });
        }

        if (oldNick === newNick) {
            return await interaction.reply({ content: '❌ Nie możesz ustawić takiego samego pseudonimu.', flags: MessageFlags.Ephemeral });
        }

        try {
            await interaction.member.setNickname(newNick);

            const successEmbed = createEmbed({
                title: 'Zmiana udana',
                description: `\`✏️\` **Stary pseudonim:** ${oldNick ?? interaction.user.username}\n\`⭐\` **Nowy pseudonim:** ${newNick ?? interaction.user.username}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - nick] ${err}`);
            await interaction.reply({ content: '❌ Nie udało się zmienić Twojego pseudonimu.', flags: MessageFlags.Ephemeral });
        }
    },
};