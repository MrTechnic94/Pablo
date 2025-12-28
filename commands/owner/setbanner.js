'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    index: false,
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
            logger.error(`[Slash ▸ Setbanner] ${err}`);
            await interaction.editReply({ content: '`❌` Wystąpił problem podczas ustawiania baneru.' });
        }
    },
};