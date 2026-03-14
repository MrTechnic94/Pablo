'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Wyświetla avatar użytkownika.')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Wybierz użytkownika, którego avatar chcesz zobaczyć.')
            .setRequired(false)
        ),
    async execute(interaction) {
        const { utils } = interaction.client;

        const user = interaction.options.getUser('użytkownik') || interaction.user;

        const successEmbed = utils.createEmbed({
            title: 'Podgląd avataru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${user.displayAvatarURL({ size: 256 })})`,
            image: user.displayAvatarURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};