'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription('Ustawia nowy baner bota.')
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Nowy baner.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const attachment = interaction.options.getAttachment('obraz');

        try {
            await interaction.client.user.setBanner(attachment.url);

            await interaction.reply({ content: 'Baner bota został pomyślnie zmieniony.', flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[Cmd - setbanner] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas ustawiania baneru.', flags: MessageFlags.Ephemeral });
        }
    },
};