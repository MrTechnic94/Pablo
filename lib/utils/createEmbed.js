'use strict';

const { embeds } = require('../../config/default.json');
const { EmbedBuilder } = require('discord.js');

function createEmbed({ title, url, author, description, thumbnail, fields, image, timestamp, footer, color }) {
    const builtEmbed = new EmbedBuilder();
    if (title) builtEmbed.setTitle(title);
    if (url) builtEmbed.setURL(url);
    if (author?.name) builtEmbed.setAuthor(author);
    if (description) builtEmbed.setDescription(description);
    if (thumbnail) builtEmbed.setThumbnail(thumbnail);
    if (fields && fields.length > 0) builtEmbed.setFields(fields);
    if (image) builtEmbed.setImage(image);
    if (timestamp) builtEmbed.setTimestamp(timestamp);
    if (footer?.text) builtEmbed.setFooter(footer);
    builtEmbed.setColor(embeds.defaultColor ?? color);

    return builtEmbed;
}

module.exports = { createEmbed };