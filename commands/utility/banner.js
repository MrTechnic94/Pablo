'use strict';

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`ℹ️` Przydatne',
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription('Wyświetla baner użytkownika.')
        .setContexts(InteractionContextType.Guild)
        .addUserOption(option => option
            .setName('użytkownik')
            .setDescription('Wybierz użytkownika, którego baner chcesz zobaczyć.')
            .setRequired(false)
        ),
    async execute(interaction) {
        const { utils } = interaction.client;

        const user = interaction.options.getUser('użytkownik') || interaction.user;

        const userData = await user.fetch().catch(() => null);

        if (!userData.bannerURL()) {
            return await utils.reply.error(interaction, 'USER_NO_BANNER');
        }

        const successEmbed = utils.createEmbed({
            title: 'Podgląd baneru',
            description: `\`👤\` **Użytkownik:** ${user}\n\`🖼️\` **Obraz:** [KLIKNIJ🡭](${userData.bannerURL({ size: 256 })})`,
            image: userData.bannerURL({ size: 256 })
        });

        await interaction.reply({ embeds: [successEmbed] });
    },
};