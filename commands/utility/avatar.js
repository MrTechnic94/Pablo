'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Wyświetla avatar użytkownika.')
        .addUserOption(option =>
            option.setName('użytkownik')
                .setDescription('Wybierz użytkownika, którego avatar chcesz zobaczyć.')
                .setRequired(false)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('użytkownik') || interaction.user;

        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ size: 256 }) })
            .setTitle('❯ Avatar')
            .setImage(user.displayAvatarURL({ size: 2048, dynamic: true }))
            .setColor(embedOptions.defaultColor);

        return await interaction.reply({ embeds: [embed] });
    }
};