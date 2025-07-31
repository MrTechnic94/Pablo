'use strict';

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
    async execute(interaction, logger) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        const attachment = interaction.options.getAttachment('plik');

        try {
            await interaction.client.user.setBanner(attachment.url);

            await interaction.reply({ content: 'Baner bota został pomyślnie zmieniony.', flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[Cmd - setbanner] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił błąd podczas ustawiania baneru.', flags: MessageFlags.Ephemeral });
        }
    },
};