'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, InteractionContextType, MessageFlags } = require('discord.js');

module.exports = {
    index: false,
    data: new ContextMenuCommandBuilder()
        .setName('Pokaż avatar')
        .setType(ApplicationCommandType.User)
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const { utils } = interaction.client;

        const user = interaction.targetUser;

        const successEmbed = utils.createEmbed({
            title: 'Podgląd avataru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${user.displayAvatarURL({ size: 256 })})`,
            image: user.displayAvatarURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};