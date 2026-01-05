'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    index: false,
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription('Ustawia nowy baner bota.')
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Nowy baner. Zalecane 680x240.')
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
            await interaction.client.user.fetch();

            const oldBanner = interaction.client.user.bannerURL({ size: 256 })

            await interaction.client.user.setBanner(attachment.url);

            const newBanner = interaction.client.user.bannerURL({ size: 256 });

            const successEmbed = createEmbed({
                title: 'Baner ustawiony',
                description: `\`🖼️\` **Wcześniejszy:** [KLIKNIJ🡭](${oldBanner})\n\`🌟\` **Nowy:** [KLIKNIJ🡭](${newBanner})`,
                image: newBanner
            });

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (err) {
            if (err.message.includes('BANNER_RATE_LIMIT') || err.code === 50035) {
                return await reply.error(interaction, 'RATE_LIMIT');
            }

            logger.error(`[Slash ▸ Setbanner] ${err}`);
            await reply.error(interaction, 'BANNER_ERROR');
        }
    },
};