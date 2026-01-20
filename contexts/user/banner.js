'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    index: false,
    data: new ContextMenuCommandBuilder()
        .setName('Pokaż baner')
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        const user = interaction.targetUser;

        const userData = await user.fetch().catch(() => null);

        if (!userData.bannerURL()) {
            return await utils.reply.error(interaction, 'USER_NO_BANNER');
        }

        const successEmbed = utils.createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};