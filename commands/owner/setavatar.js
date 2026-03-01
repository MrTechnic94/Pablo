'use strict';

const { SlashCommandBuilder, InteractionContextType, RESTJSONErrorCodes } = require('discord.js');

module.exports = {
    index: false,
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('setavatar')
        .setDescription('Ustawia nowy avatar bota.')
        .setContexts(InteractionContextType.Guild)
        .addAttachmentOption(option =>
            option.setName('obraz')
                .setDescription('Nowy avatar. Zalecane 1024x1024.')
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
            const config = utils.getConfig();

            config.botOptions.changedAvatar = true;

            utils.syncConfig(config);

            const oldAvatar = interaction.client.user.displayAvatarURL({ size: 256 });

            await interaction.client.user.setAvatar(attachment.url);

            const newAvatar = interaction.client.user.displayAvatarURL({ size: 256 });

            const successEmbed = utils.createEmbed({
                title: 'Avatar ustawiony',
                description: `\`📷\` **Wcześniejszy:** [KLIKNIJ🡭](${oldAvatar})\n\`🌟\` **Nowy:** [KLIKNIJ🡭](${newAvatar})`,
                image: newAvatar
            });

            await interaction.editReply({ embeds: [successEmbed] });
        } catch (err) {
            if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType || err.message.includes('AVATAR_RATE_LIMIT')) {
                return await utils.reply.error(interaction, 'RATE_LIMIT');
            }

            logger.error(`[Slash ▸ Setavatar] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'AVATAR_ERROR');
        }
    },
};