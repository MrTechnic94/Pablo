'use strict';

const { embeds } = require('../../config/default.json');

module.exports = {
    customId: 'snitch_dismiss_',
    isPrefix: true,
    async execute(interaction, logger) {
        const { utils } = interaction.client;

        try {
            if (!interaction.message.components.length) return;

            const reporterId = interaction.customId.replace('snitch_dismiss_', '');
            const targetField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłoszony'));
            const targetIdMatch = targetField ? targetField.value.match(/<@!?(\d+)>/) : null;
            const targetId = targetIdMatch ? targetIdMatch[1] : null;

            const userDisplay = targetId ? `<@${targetId}>` : 'wybranego użytkownika';

            const description = utils.reply.getString('error', 'SNITCH_REJECTED_DM', userDisplay, interaction.guild.name);

            const embedDM = utils.createEmbed({
                title: 'Zgłoszenie odrzucone',
                description: description
            });

            if (reporterId) {
                await interaction.client.users.send(reporterId, { embeds: [embedDM] })
                    .catch(() => logger.warn(`[Button ▸ SnitchDismiss] Failed to send DM to '${reporterId}'.`));
            }

            const finishedEmbed = interaction.message.embeds[0].toJSON();
            finishedEmbed.title = 'Zgłoszenie - akcja wykonana';
            finishedEmbed.color = embeds.secondaryColor;

            let duplicatesProcessed = 0;

            if (targetId) {
                const messages = await interaction.channel.messages.fetch({ limit: 50 }).catch(() => null);

                if (messages) {
                    const duplicates = messages.filter(msg =>
                        msg.embeds.length > 0 &&
                        msg.id !== interaction.message.id &&
                        msg.embeds[0].fields.some(f => f.name.includes('Zgłoszony') && f.value.includes(targetId)) &&
                        msg.components.length > 0
                    );

                    duplicatesProcessed = duplicates.size;

                    for (const msg of duplicates.values()) {
                        const dupEmbed = msg.embeds[0].toJSON();
                        dupEmbed.title = 'Zgłoszenie - akcja wykonana (duplikat)';
                        dupEmbed.color = embeds.secondaryColor;

                        await msg.edit({
                            content: `\`❌\` To zgłoszenie zostało oznaczone jako duplikat i zostało odrzucone przez <@${interaction.user.id}>.`,
                            embeds: [dupEmbed],
                            components: []
                        }).catch(() => null);
                    }
                }
            }

            let finalContent = `\`❌\` Zgłoszenie zostało odrzucone przez <@${interaction.user.id}>.`;

            if (duplicatesProcessed > 0) {
                finalContent += `\n\`🧹\` Zaktualizowano również \`${duplicatesProcessed}\` inne aktywne zgłoszenia tego użytkownika.`;
            }

            return await interaction.update({
                content: finalContent,
                embeds: [finishedEmbed],
                components: []
            });
        } catch (err) {
            logger.error(`[Button ▸ SnitchDismiss] An error occurred for '${interaction.guild.id}':\n${err}`);

            if (err.code === 10062 || err.code === 50027) return;

            await utils.reply.error(interaction, 'COMMAND_ERROR');
        }
    },
};