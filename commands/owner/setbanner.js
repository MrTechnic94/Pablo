'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    index: false,
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription('Ustawia nowy baner bota.')
        .setContexts(InteractionContextType.Guild)
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Nowy baner. Zalecane 680x240.')
                .setRequired(true)
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        const attachment = interaction.options.getAttachment('obraz');
        const extension = attachment.url.split('.').pop().toLowerCase().split('?')[0];

        if (!allowedExtensions.includes(extension)) {
            return await utils.reply.error(interaction, 'INVALID_EXTENSION');
        }

        await interaction.deferReply();

        try {
            await interaction.client.user.fetch().catch(() => null);

            const oldBanner = interaction.client.user.bannerURL({ size: 256 })

            await interaction.client.user.setBanner(attachment.url);

            const newBanner = interaction.client.user.bannerURL({ size: 256 });

            const successEmbed = utils.createEmbed({
                title: 'Baner ustawiony',
                description: `\`🖼️\` **Wcześniejszy:** [KLIKNIJ🡭](${oldBanner})\n\`🌟\` **Nowy:** [KLIKNIJ🡭](${newBanner})`,
                image: newBanner
            });

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (err) {
            if (err.code === 50035) {
                return await utils.reply.error(interaction, 'RATE_LIMIT');
            }

            logger.error(`[Slash ▸ Setbanner] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'BANNER_ERROR');
        }
    },
};