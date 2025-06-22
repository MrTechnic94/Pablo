'use strict';

const { SlashCommandBuilder, InteractionContextType, MessageFlags, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default.json');

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

        const successEmbed = new EmbedBuilder()
            .setTitle('Podgląd baneru')
            .setDescription(`\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 2048 })})`)
            .setImage(userData.bannerURL({ size: 2048 }))
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [successEmbed] });
    },
};