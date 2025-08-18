'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { getConfig, syncConfig } = require('../../plugins/configManipulator');
const { createEmbed } = require('../../plugins/createEmbed');

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

        const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        const attachment = interaction.options.getAttachment('obraz');
        const extension = attachment.url.split('.').pop().toLowerCase().split('?')[0];

        if (!allowedExtensions.includes(extension)) {
            return await interaction.reply({ content: '❌ Możesz wgrać tylko pliki: png, jpg, jpeg, gif lub webp.', flags: MessageFlags.Ephemeral });
        }

        try {
            const config = getConfig();

            config.botOptions.changedAvatar = true;

            syncConfig(config);

            const oldAvatar = interaction.client.user.displayAvatarURL({ size: 256 });

            await interaction.client.user.setAvatar(attachment.url);

            const newAvatar = interaction.client.user.displayAvatarURL({ size: 256 });

            const successEmbed = createEmbed({
                title: 'Avatar ustawiony',
                description: `\`📷\` **Wcześniejszy:** [KLIKNIJ🡭](${oldAvatar})\n\`🌟\` **Nowy:** [KLIKNIJ🡭](${newAvatar})`,
                image: newAvatar
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Cmd - setavatar] ${err}`);
            await interaction.reply({ content: '❌ Wystąpił problem podczas ustawiania avatara.', flags: MessageFlags.Ephemeral });
        }
    },
};