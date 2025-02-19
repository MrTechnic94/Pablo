'use strict';

const logger = require('../../plugins/logger');
const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription('Ustawia nowy baner bota.')
        .addAttachmentOption(option =>
            option.setName('plik')
                .setDescription('Obraz, który ma zostać ustawiony jako baner bota.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        // Sprawdza czy uzytkownik ktory wykonal komende, jest wlascicielem bota
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const attachment = interaction.options.getAttachment('plik');

        try {
            // Ustawienie baneru bota z pliku
            await interaction.client.user.setBanner(attachment.url);

            return await interaction.reply({ content: 'Baner bota został pomyślnie zmieniony!', flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[Cmd - setbanner] ${err}`);
            return await interaction.reply({ content: 'Wystąpił błąd podczas ustawiania baneru.', flags: MessageFlags.Ephemeral });
        }
    },
};