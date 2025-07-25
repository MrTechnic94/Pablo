'use strict';

const { embeds } = require('../config/default.json');
const { EmbedBuilder } = require('discord.js');

function createEmbed({ title, url, author = {}, description, thumbnail, fields = {}, image, timestamp, footer = {}, color }) {
    const templateEmbed = new EmbedBuilder()
    if (title) templateEmbed.setTitle(title);
    if (url) templateEmbed.setURL(url);
    if (author.name) templateEmbed.setAuthor(author);
    if (description) templateEmbed.setDescription(description);
    if (thumbnail) templateEmbed.setThumbnail(thumbnail);
    if (fields.length || fields.name) templateEmbed.setFields(fields);
    if (image) templateEmbed.setImage(image);
    if (timestamp) templateEmbed.setTimestamp();
    if (footer.text) templateEmbed.setFooter(footer);
    templateEmbed.setColor(color ?? embeds.defaultColor);

    return templateEmbed;
}

module.exports = { createEmbed };