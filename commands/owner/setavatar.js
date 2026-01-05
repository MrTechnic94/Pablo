'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { getConfig, syncConfig } = require('../../lib/core/configManipulator');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    index: false,
    ownerOnly: true,
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
        const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        const attachment = interaction.options.getAttachment('obraz');
        const extension = attachment.url.split('.').pop().toLowerCase().split('?')[0];

        if (!allowedExtensions.includes(extension)) {
            return await reply.error(interaction, 'INVALID_EXTENSION');
        }

        await interaction.deferReply();

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
            if (err.message.includes('AVATAR_RATE_LIMIT') || err.code === 50035) {
                return await reply.error(interaction, 'RATE_LIMIT');
            }

            logger.error(`[Slash ▸ Setavatar] ${err}`);
            await reply.error(interaction, 'AVATAR_ERROR');
        }
    },
};