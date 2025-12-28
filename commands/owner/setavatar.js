'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { getConfig, syncConfig } = require('../../lib/core/configManipulator');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    index: false,
    data: new SlashCommandBuilder()
        .setName('setavatar')
        .setDescription('Ustawia nowy avatar bota.')
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Nowy avatar. Zalecane 1024x1024.')
                .setRequired(true)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, logger) {
        if (interaction.user.id !== process.env.BOT_OWNER_ID) {
            return await interaction.reply({ content: '`❌` Nie masz permisji.', flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply();

        const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        const attachment = interaction.options.getAttachment('obraz');
        const extension = attachment.url.split('.').pop().toLowerCase().split('?')[0];

        if (!allowedExtensions.includes(extension)) {
            return await interaction.editReply({ content: '`❌` Możesz wgrać tylko pliki: png, jpg, jpeg, gif lub webp.' });
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

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Setavatar] ${err}`);
            await interaction.editReply({ content: '`❌` Wystąpił problem podczas ustawiania avatara.' });
        }
    },
};