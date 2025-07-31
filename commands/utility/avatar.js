'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../plugins/createEmbed');

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

        const successEmbed = createEmbed({
            title: 'Podgląd avataru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${user.displayAvatarURL({ size: 2048 })})`,
            image: user.displayAvatarURL({ size: 2048 })
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};