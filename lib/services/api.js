'use strict';

const verses = require('../../config/verses.json');
const { Bible } = require('../../config/default.json');
const { request } = require('undici');

async function fetchVerse(verseID, logger) {
    try {
        const { body, statusCode } = await request(
            `https://api.scripture.api.bible/v1/bibles/${Bible.id}/passages/${verseID}?content-type=html&include-notes=false&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true`,
            { headers: { 'api-key': process.env.BIBLE_API_KEY } }
        );

        if (statusCode !== 200) {
            logger.error(`[VerseApi] API request error code '${statusCode}'.`);
            return null;
        }

        const { data } = await body.json();

        return {
            reference: data.reference,
            content: data.content
                .replace(/<span[^>]*class="v"[^>]*>(\d+)<\/span>/g, '$1 ')
                .replace(/<[^>]+>/g, '')
                .replace(/\s+/g, ' ')
                .trim()
        };
    } catch (err) {
        logger.error(`[VerseApi] Error fetching verse '${verseID}':\n${err}`);
        return null;
    }
}

async function verseOfTheDay(logger) {
    const verseIndex = new Date().getDate() % verses.length;
    return fetchVerse(verses[verseIndex], logger);
}

async function randomVerse(logger) {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return fetchVerse(verses[randomIndex], logger);
}

module.exports = { verseOfTheDay, randomVerse };