'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { createEmbed } = require('../../lib/utils/createEmbed');
const reply = require('../../lib/utils/responder');

module.exports = {
    category: '`ℹ️` Przydatne',
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
            return await reply.error(interaction, 'USER_NO_BANNER');
        }

        const successEmbed = createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};