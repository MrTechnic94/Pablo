'use strict';

const { ContextMenuCommandBuilder, ApplicationCommandType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Pokaż baner')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const user = interaction.targetUser;

        const userData = await user.fetch();

        if (!userData.bannerURL()) {
            return await interaction.reply({ content: '❌ Użytkownik nie ma ustawionego baneru.', flags: MessageFlags.Ephemeral });
        }

        const successEmbed = createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
    },
};