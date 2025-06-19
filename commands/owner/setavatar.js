'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { writeFileSync, readFileSync } = require('fs');
const { resolve } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setavatar')
        .setDescription('Ustawia nowy avatar bota.')
        .addAttachmentOption(option =>
            option.setName('plik')
                .setDescription('Obraz, który ma zostać ustawiony jako avatar bota.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        // Sprawdza czy uzytkownik ktory wykonal komende, jest wlascicielem bota
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        try {
            const configPath = resolve(__dirname, '../../config/default.json');
            const config = JSON.parse(readFileSync(configPath, 'utf8'));
            config.botOptions.changedAvatar = true;

            writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');

            const attachment = interaction.options.getAttachment('plik');

            // Ustawienie avatara bota z pliku
            await interaction.client.user.setAvatar(attachment.url);

            return await interaction.reply({ content: 'Avatar bota został pomyślnie zmieniony.', flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[Cmd - setavatar] ${err}`);
            return await interaction.reply({ content: '❌ Wystąpił błąd podczas ustawiania avatara.', flags: MessageFlags.Ephemeral });
        }
    },
};