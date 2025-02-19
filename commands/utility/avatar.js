'use strict';

const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default');

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

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle('❯ Avatar')
            .setImage(user.displayAvatarURL({ size: 2048 }))
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [embed] });
    },
};