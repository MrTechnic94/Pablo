'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Wyświetla avatar użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Wybierz użytkownika, którego avatar chcesz zobaczyć.')
                .setRequired(false)
        )
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const user = interaction.options.getUser('użytkownik') || interaction.user;

        const successEmbed = new EmbedBuilder()
            .setTitle('Podgląd avataru')
            .setDescription(`\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${user.displayAvatarURL()})`)
            .setImage(user.displayAvatarURL({ size: 2048 }))
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [successEmbed] });
    },
};