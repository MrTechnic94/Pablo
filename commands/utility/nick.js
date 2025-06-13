'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } = require('discord.js');
const { guildRoles, embedOptions } = require('../../config/default');

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
        if (!interaction.member.roles.cache.has(guildRoles.admin) && !interaction.member.roles.cache.has(guildRoles.changeNickname) && interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz wymaganej roli.', flags: MessageFlags.Ephemeral });
        }

        const newNick = interaction.options.getString('nowy') || '';

        try {
            await interaction.member.setNickname(newNick);

            const embed = new EmbedBuilder()
                .setTitle('Zmiana udana')
                .setDescription(newNick ? `Twój nick został zmieniony na: **${newNick}**` : 'Twój nick został usunięty.')
                .setColor(embedOptions.defaultColor);

            return await interaction.reply({ embeds: [embed] });
        } catch (err) {
            logger.error(`[Cmd - nick] ${err}`);
            return await interaction.reply({ content: '❌ Nie udało się zmienić Twojego nicku.', flags: MessageFlags.Ephemeral });
        }
    },
};