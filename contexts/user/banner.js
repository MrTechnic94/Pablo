'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    index: false,
    data: new ContextMenuCommandBuilder()
        .setName('Pokaż baner')
        .setType(ApplicationCommandType.User)
        .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
        .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel]),
    async execute(interaction) {
        const { utils } = interaction.client;

        const user = interaction.targetUser;

        const userData = await user.fetch().catch(() => null);

        if (!userData.bannerURL()) {
            return await utils.interafce.sendError(interaction, 'USER_NO_BANNER');
        }

        const successEmbed = utils.interface.createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};