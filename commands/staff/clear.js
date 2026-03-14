'use strict';

const { PermissionFlagsBits, SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    category: '`📛` Administracja',
    botPermissions: [PermissionFlagsBits.ManageMessages],
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Usuwa wybraną ilość wiadomości z kanału.')
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option
            .setName('ilość')
            .setDescription('Ilość wiadomości do usunięcia.')
            .setMinValue(1)
            .setMaxValue(100)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('usuń_przypięte')
            .setDescription('Wybierz, czy chcesz usunąć również przypięte wiadomości.')
            .setRequired(false)
            .addChoices(
                { name: 'Tak', value: 'true' },
                { name: 'Nie', value: 'false' }
            )
        ),
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const amount = interaction.options.getInteger('ilość');
        const removePinnedStr = interaction.options.getString('usuń_przypięte') ?? 'false';

        try {
            const fetchedMessages = await interaction.channel.messages.fetch({ limit: amount }).catch(() => null);

            const messagesToDelete = removePinnedStr === 'true' ? fetchedMessages : fetchedMessages.filter(msg => !msg.pinned);

            const deleted = await interaction.channel.bulkDelete(messagesToDelete, true);

            if (!deleted?.size) {
                return await utils.reply.error(interaction, 'CANT_CLEAR_MESSAGES');
            }

            const successEmbed = utils.createEmbed({
                title: 'Akcja wykonana',
                description: `\`💬\` **Usunięto:** ${deleted.size > 1 ? `${deleted.size} wiadomości` : `${deleted.size} wiadomość`}\n\`📌\` **W tym przypięte:** ${removePinnedStr === 'true' ? 'Tak.' : 'Nie.'}`
            });

            await interaction.reply({ embeds: [successEmbed] });
        } catch (err) {
            logger.error(`[Slash ▸ Clear] An error occurred for '${interaction.guild.id}':\n${err}`);
            await utils.reply.error(interaction, 'CLEAR_ERROR');
        }
    },
};