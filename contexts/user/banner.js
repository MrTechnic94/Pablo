'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    index: false,
    data: new ContextMenuCommandBuilder()
        .setName('Pokaż baner')
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const user = interaction.targetUser;

        const userData = await user.fetch();

        if (!userData.bannerURL()) {
            return await reply.error(interaction, 'USER_NO_BANNER');
        }

        const successEmbed = createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};