'use strict';

const { embeds } = require('../../config/default.json');

module.exports = {
    customId: 'snitch_kick_',
    isPrefix: true,
    async execute(interaction) {
        const { utils } = interaction.client;

        const targetId = interaction.customId.replace('snitch_kick_', '');

        const reporterField = interaction.message.embeds[0].fields.find(f => f.name.includes('Zgłaszający'));
        const reporterIdMatch = reporterField ? reporterField.value.match(/<@!?(\d+)>/) : null;
        const reporterId = reporterIdMatch ? reporterIdMatch[1] : null;

        const reasonField = interaction.message.embeds[0].fields.find(f => f.name.includes('Powód') || f.name.includes('wiadomości'));

        let rawReason = reasonField ? reasonField.value : "Naruszenie regulaminu.";
        rawReason = rawReason.replace(/[`*•]|```/g, '').trim();

        const fullReason = `ZGŁOSZENIE: Zaakceptowane przez ${interaction.user.tag} | POWÓD: ${rawReason}`;
        const auditLogReason = fullReason.length > 500 ? `${fullReason.slice(0, 497)}...` : fullReason;

        // Powiadomienie zglaszajacego
        if (reporterId) {
            const description = utils.reply.getString('success', 'SNITCH_ACCEPTED', interaction.guild.name);
            const firstEmbedDM = utils.createEmbed({ title: 'Zgłoszenie zaakceptowane', description });
            await interaction.client.users.send(reporterId, { embeds: [firstEmbedDM] }).catch(() => null);
        }

        // Powiadomienie wyrzuconego
        const secondEmbedDM = utils.createEmbed({
            title: 'Zostałeś wyrzucony',
            description: `\`🔍\` **Serwer:** ${interaction.guild.name}\n\`🔨\` **Moderator:** ${interaction.user.tag}\n\`💬\` **Powód:** ${rawReason}`
        });
        await interaction.client.users.send(targetId, { embeds: [secondEmbedDM] }).catch(() => null);

        // Kick i czyszczenie
        await interaction.guild.members.kick(targetId, { reason: auditLogReason });

        // Usuwania duplikatow
        const messages = await interaction.channel.messages.fetch({ limit: 50 }).catch(() => null);

        const duplicates = messages.filter(msg =>
            msg.embeds.length > 0 && msg.id !== interaction.message.id &&
            msg.embeds[0].fields.some(f => f.value.includes(targetId))
        );

        for (const msg of duplicates.values()) await msg.delete().catch(() => null);

        const finishedEmbed = interaction.message.embeds[0].toJSON();
        finishedEmbed.title = 'Zgłoszenie - akcja wykonana';
        finishedEmbed.color = embeds.secondaryColor;

        await interaction.update({
            content: `\`👢\` Użytkownik został wyrzucony przez ${interaction.user}.`,
            embeds: [finishedEmbed],
            components: []
        });
    }
};