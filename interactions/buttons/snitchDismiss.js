'use strict';

module.exports = {
    customId: 'snitch_dismiss_',
    isPrefix: true,
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        const reporterId = interaction.replace('snitch_dismiss_', '');

        const targetField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłoszony'));
        const targetIdMatch = targetField ? targetField.value.match(/<@!?(\d+)>/) : null;
        const targetId = targetIdMatch ? targetIdMatch[1] : null;

        const userDisplay = targetId ? `użytkownika <@${targetId}>` : 'wybranego użytkownika';

        const description = utils.reply.getString('error', 'SNITCH_REJECTED_DM', userDisplay, interaction.guild.name);

        const embedDM = utils.createEmbed({
            title: 'Zgłoszenie odrzucone',
            description: description
        });

        if (reporterId) {
            await interaction.client.users.send(reporterId, { embeds: [embedDM] })
                .catch(() => logger.warn(`[Button ▸ SnitchDismiss] Failed to send DM to reporter: ${reporterId}`));
        }

        let duplicatesDeleted = 0;

        if (targetId) {
            const messages = await interaction.channel.messages.fetch({ limit: 50 }).catch(() => null);

            const duplicates = messages.filter(msg =>
                msg.embeds.length > 0 &&
                msg.id !== interaction.message.id &&
                msg.embeds[0].fields.some(f => f.name.includes('Zgłoszony') && f.value.includes(targetId))
            );

            duplicatesDeleted = duplicates.size;

            if (duplicatesDeleted > 0) {
                await Promise.all(duplicates.map(msg => msg.delete().catch(() => null)));
            }
        }

        await interaction.message.delete().catch(() => null);

        let finalContent = utils.reply.getString('success', 'SNITCH_REJECTED');

        if (duplicatesDeleted > 0) {
            finalContent += utils.reply.getString('success', 'SNITCH_CLEANED', duplicatesDeleted);
        }

        await utils.reply.error(interaction, finalContent);
    }
};