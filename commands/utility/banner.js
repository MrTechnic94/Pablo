'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Wyświetla baner użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Wybierz użytkownika, którego baner chcesz zobaczyć.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const user = interaction.options.getUser('użytkownik') || interaction.user;

        const userData = await user.fetch();

        if (!userData.bannerURL()) {
            return await interaction.reply({ content: '❌ Użytkownik nie ma ustawionego baneru.', flags: MessageFlags.Ephemeral });
        }

        const successEmbed = createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};