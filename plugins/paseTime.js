'use strict';

function parseTime(timeString) {
    const regex = /(\d+)(h|m|s|d|godzin|godziny|minut|minuty|sekund|sekundy|dni|dzień)/gi;
    const matches = [...timeString.matchAll(regex)];

    if (matches.length === 0) return null;

    let totalSeconds = 0;

    matches.forEach(match => {
        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 'h':
            case 'godzin':
            case 'godziny':
                totalSeconds += amount * 3600;
                break;
            case 'm':
            case 'minut':
            case 'minuty':
                totalSeconds += amount * 60;
                break;
            case 's':
            case 'sekund':
            case 'sekundy':
                totalSeconds += amount;
                break;
            case 'd':
            case 'dni':
            case 'dzień':
                totalSeconds += amount * 86400;
                break;
            default:
                break;
        }
    });
    return totalSeconds;
}

function formatTime(timeString) {
    const regex = /(\d+)(h|m|s|d|godzin|godziny|minut|minuty|sekund|sekundy|dni|dzień)/gi;
    const matches = [...timeString.matchAll(regex)];

    let formattedTime = '';

    matches.forEach(match => {
        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 'h':
            case 'godzin':
            case 'godziny':
                formattedTime += amount === 1 ? `${amount} godzina` : `${amount} godzin`;
                break;
            case 'm':
            case 'minut':
            case 'minuty':
                formattedTime += amount === 1 ? `${amount} minuta` : `${amount} minut`;
                break;
            case 's':
            case 'sekund':
            case 'sekundy':
                formattedTime += amount === 1 ? `${amount} sekunda` : `${amount} sekund`;
                break;
            case 'd':
            case 'dni':
            case 'dzień':
                formattedTime += amount === 1 ? `${amount} dzień` : `${amount} dni`;
                break;
            default:
                break;
        }
    });
    return formattedTime;
}

module.exports = { parseTime, formatTime };