'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    index: false,
    data: new ContextMenuCommandBuilder()
        .setName('Pokaż avatar')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const user = interaction.targetUser;

        const successEmbed = createEmbed({
            title: 'Podgląd avataru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${user.displayAvatarURL({ size: 256 })})`,
            image: user.displayAvatarURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};