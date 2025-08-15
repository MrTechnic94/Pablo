'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { getConfig, syncConfig } = require('../../plugins/configManipulator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setavatar')
        .setDescription('Ustawia nowy avatar bota.')
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Nowy avatar.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '❌ Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        try {
            const config = getConfig();
            config.botOptions.changedAvatar = true;

            syncConfig(config);

            const attachment = interaction.options.getAttachment('obraz');

            await interaction.client.user.setAvatar(attachment.url);

            await interaction.reply({ content: 'Avatar bota został pomyślnie zmieniony.', flags: MessageFlags.Ephemeral });
        } catch (err) {
            logger.error(`[Cmd - setavatar] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas ustawiania avatara.', flags: MessageFlags.Ephemeral });
        }
    },
};