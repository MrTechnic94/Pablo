'use strict';

const emojiRegex = /<?(?<animated>a)?:?[\w]+:(?<id>\d{17,19})>?/;
const idRegex = /^\d{17,19}$/;

function parseEmojiId(input) {
    if (typeof input !== 'string') return null;

    const match = input.match(emojiRegex);

    if (match?.groups) return match.groups.id;

    if (idRegex.test(input)) return input;

    return null;
}

function parseEmojiUrl(input) {
    if (typeof input !== 'string') return null;

    if (input.startsWith('http')) return input;

    const match = input.match(emojiRegex);

    if (match?.groups) {
        const { animated, id } = match.groups;
        return `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'webp'}`;
    }

    if (idRegex.test(input)) {
        return `https://cdn.discordapp.com/emojis/${input}.webp`;
    }

    return null;
}

module.exports = { parseEmojiId, parseEmojiUrl };