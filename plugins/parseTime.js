'use strict';

function parseTimeString(timeString) {
    const regex = /(\d+)(h|m|s|d|godzin|godziny|minut|minuty|sekund|sekundy|dni|dzień)/gi;
    const matches = [...timeString.matchAll(regex)];

    if (!matches.length) return null;

    let totalSeconds = 0;
    let formattedTime = '';

    matches.forEach(match => {
        const amount = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 'h':
            case 'godzin':
            case 'godziny':
                totalSeconds += amount * 3600;
                formattedTime += amount === 1 ? `${amount} godzina ` : `${amount} godzin `;
                break;
            case 'm':
            case 'minut':
            case 'minuty':
                totalSeconds += amount * 60;
                formattedTime += amount === 1 ? `${amount} minuta ` : `${amount} minut `;
                break;
            case 's':
            case 'sekund':
            case 'sekundy':
                totalSeconds += amount;
                formattedTime += amount === 1 ? `${amount} sekunda ` : `${amount} sekund `;
                break;
            case 'd':
            case 'dni':
            case 'dzień':
                totalSeconds += amount * 86400;
                formattedTime += amount === 1 ? `${amount} dzień ` : `${amount} dni `;
        }
    });

    return { seconds: totalSeconds, formatted: formattedTime.trim() };
}

function formatDuration(milliseconds, options = {}) {
    const days = Math.floor(milliseconds / 86400000);
    const hours = Math.floor((milliseconds % 86400000) / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    const parts = [];

    const plural = (value, one, few, many) => {
        if (value === 1) return one;
        if (value >= 2 && value <= 4) return few;
        return many;
    };

    if (days) parts.push(options.fullWords ? `${days} ${plural(days, 'dzień', 'dni', 'dni')}` : `${days}d`);
    if (hours) parts.push(options.fullWords ? `${hours} ${plural(hours, 'godzina', 'godziny', 'godzin')}` : `${hours}h`);
    if (minutes) parts.push(options.fullWords ? `${minutes} ${plural(minutes, 'minuta', 'minuty', 'minut')}` : `${minutes}m`);
    if (seconds) parts.push(options.fullWords ? `${seconds} ${plural(seconds, 'sekunda', 'sekundy', 'sekund')}` : `${seconds}s`);

    return parts.length ? parts.join(options.fullWords ? ' ' : ' ') : options.fullWords ? '0 sekund' : '0s';
}

module.exports = { parseTimeString, formatDuration };