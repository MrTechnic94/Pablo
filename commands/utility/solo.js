'use strict';

const { MessageFlags, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { emojisConfig, embedOptions } = require('../../config/default');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('solo')
        .setDescription('Stocz bitwę 1v1 z innym użytkownikiem.')
        .addUserOption(option =>
            option.setName('przeciwnik')
                .setDescription('Wybierz użytkownika do walki')
                .setRequired(true)
        ),
    async execute(interaction) {
        const player1 = interaction.user;
        const player2 = interaction.options.getUser('przeciwnik');

        if (player1.id === player2.id) {
            return await interaction.reply({ content: 'Nie możesz walczyć sam ze sobą!', flags: MessageFlags.Ephemeral });
        }

        let players = [
            { user: player1, hp: 100 },
            { user: player2, hp: 100 }
        ];

        const emojis = [emojisConfig.battleForward, emojisConfig.battleBackwards];
        let battleLog = [];

        const countdownEmbed = new EmbedBuilder()
            .setTitle('💢 SOLÓWA ! 💢')
            .setDescription('*Solo zacznie się za 3...*')
            .setColor(embedOptions.defaultColor);

        let message = await interaction.reply({ embeds: [countdownEmbed] }).then(sent => sent.fetch());
        await new Promise(resolve => setTimeout(resolve, 1000));

        for (let i = 2; i > 0; i--) {
            countdownEmbed.setDescription(`*Solo zacznie się za ${i}...*`);
            await message.edit({ embeds: [countdownEmbed] });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        let round = 0;

        while (players[0].hp > 0 && players[1].hp > 0) {
            let attacker = players[round % 2];
            let defender = players[(round + 1) % 2];

            let damage = Math.floor(Math.random() * (45 - 5 + 1) + 5);
            if (damage > defender.hp) damage = defender.hp;
            defender.hp -= damage;

            let attackMessage = `${emojis[round % 2]} **${attacker.user.username}** uderzył **${defender.user.username}**, zabierając mu __${damage}__ zdrowia!`;
            battleLog.push(attackMessage);

            const battleEmbed = new EmbedBuilder()
                .setTitle('💢 SOLÓWA ! 💢')
                .setDescription(battleLog.join('\n'))
                .addFields(
                    { name: `${players[0].user.username}`, value: `${players[0].hp}/100 HP`, inline: true },
                    { name: `${players[1].user.username}`, value: `${players[1].hp}/100 HP`, inline: true }
                )
                .setColor(embedOptions.defaultColor);

            await message.edit({ embeds: [battleEmbed] });

            if (defender.hp <= 0) break;

            round++;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        let winner = players.find(p => p.hp > 0);

        battleLog.push(`\`\`\`🏆 ${winner.user.username} wygrał pojedynek! 🏆\`\`\``);

        const finalEmbed = new EmbedBuilder()
            .setTitle('💢 SOLÓWA ! 💢')
            .setDescription(battleLog.join('\n'))
            .addFields(
                { name: `${players[0].user.username}`, value: `${players[0].hp}/100 HP`, inline: true },
                { name: `${players[1].user.username}`, value: `${players[1].hp}/100 HP`, inline: true }
            )
            .setColor(embedOptions.defaultColor);

        await message.edit({ embeds: [finalEmbed] });
    }
};