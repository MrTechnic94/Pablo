'use strict';

module.exports = {
    presence: {
        online: { name: "Dostępny", emoji: "🟢" },
        idle: { name: "Zaraz wracam", emoji: "🌙" },
        offline: { name: "Offline", emoji: "🎱" },
        invisible: { name: "Niewidoczny", emoji: "🎱" },
        dnd: { name: "Nie przeszkadzać", emoji: "⛔" }
    },

    device: {
        desktop: { name: "Komputer", emoji: "🖥️" },
        mobile: { name: "Telefon", emoji: "📱" },
        web: { name: "Przeglądarka", emoji: "🌐" }
    },

    channels: {
        "0": "Tekstowy",
        "1": "Wiadomość prywatna",
        "2": "Głosowy",
        "3": "Grupowa wiadomość prywatna",
        "4": "Kategoria",
        "5": "Ogłoszenie",
        "10": "Wątek ogłoszeniowy",
        "11": "Wątek publiczny",
        "12": "Wątek prywatny",
        "13": "Scena",
        "14": "Katalog",
        "15": "Forum",
        "16": "Media"
    },

    verification: {
        "0": "**Brak:** Bez ograniczeń.",
        "1": "**Niski:** Wymaga potwierdzenia adresu e-mail konta Discord.",
        "2": "**Średni:** Wymaga rejestracji na Discordzie przez co najmniej 5 minut.",
        "3": "**Wysoki:** Wymaga członkostwa na serwerze przez co najmniej 10 minut.",
        "4": "**Bardzo wysoki:** Wymaga potwierdzenia numeru telefonu."
    },

    // ERRORY
    error: {
        TOO_MANY_FIGHTS: '`❌` Trwa już zbyt wiele walk (**%d**).',
        CANT_FIGHT_YOURSELF: '`❌` Nie możesz walczyć sam ze sobą.',
        FIGHT_ERROR: '`❌` Wystąpił problem podczas walki.',
        ACCESS_DENIED: '`❌` Nie masz permisji.',
        RESTART_ERROR: '`❌` Wystąpił problem podczas restartowania bota.',
        STATUS_ALREADY_RESTARTED: '`❌` Status został już zresetowany.',
        STATUS_ERROR: '`❌` Wystąpił problem podczas ustawienia statusu.',
        AVATAR_NO_CHANGE: '`❌` Avatar nie został zmieniony.',
        AVATAR_ERROR: '`❌` Wystąpił problem podczas ustawienia avataru.',
        PARAMETER_NOT_FOUND: '`❌` Nieznany parametr.',
        INVALID_EXTENSION: '`❌` Możesz wgrać tylko pliki: png, jpg, jpeg, gif lub webp.',
        BANNER_ERROR: '`❌` Wystąpił problem podczas ustawiania baneru.',
        NO_BANNER_FOUND: '`❌` Banner nie jest ustawiony.',
        STATUS_ALREADY_SET: '`❌` Nie możesz ustawić takiego samego statusu.',
        RATE_LIMIT: '`❌` Zbyt często wykonujesz tę akcje. Odczekaj kilka minut.',
        BAN_MEMBERS_PERMISSION_DENY: '❌` Nie masz uprawnienia `Banowanie członków`',
        BOT_BAN_MEMBERS_PERMISSION_DENY: '`❌` Nie mam uprawnienia `Banowanie członków`',
        USER_NOT_FOUND: '`❌` Nie znaleziono użytkownika',
        ROLE_TOO_HIGH: '`❌` Nie możesz tego zrobić, ponieważ jego ranga jest równa lub wyższa od Twojej.',
        BAN_USER_NOT_PUNISHABLE: '`❌` Nie mogę zbanować tego użytkownika.',
        BAN_ERROR: '`❌` Wystąpił problem podczas banowania użytkownika.',
        MANAGE_MESSAGE_PERMISSION_DENY: '`❌` Nie masz uprawnienia `Zarządzanie wiadomościami`.',
        BOT_MANAGE_MESSAGE_PERMISSION_DENY: '`❌` Nie mam uprawnienia `Zarządzanie wiadomościami`.',
        CLEAR_MESSAGE_NOT_FOUND: '`❌` Nie znaleziono wiadomości do usunięcia z podanymi opcjami.',
        CLEAR_ERROR: '`❌` Wystąpił problem podczas usuwania wiadomości.',
        MISSING_ROLE: '`❌` Nie masz wymaganej roli.',
        ROLE_HIGHER_THAN_BOT: '`❌` Rola, którą chcesz nadać, znajduje się wyżej niż moja najwyższa rola.',
        USER_ALREADY_HAS_ROLE: '`❌` Użytkownik posiada już rolę **<@&%s>**.',
        ROLE_GIVE_ERROR: '`❌` Nie udało się nadać roli.',
        KICK_MEMBERS_PERMISSION_DENY: '`❌` Nie masz uprawnienia `Wyrzucaj, zatwierdzaj i odrzucaj członków`.',
        BOT_KICK_MEMBERS_PERMISSION_DENY: '`❌` Nie mam uprawnienia `Wyrzucaj, zatwierdzaj i odrzucaj członków`.',
        KICK_USER_NOT_PUNISHABLE: '`❌` Nie mogę wyrzucić tego użytkownika.',
        KICK_ERROR: '`❌` Wystąpił problem podczas wyrzucania użytkownika.',
        BOT_MANAGE_ROLES_PERMISSION_DENY: '`❌` Nie mam uprawnienia `Zarządzanie rolami`.',
        BOT_HIERARCHY_TOO_LOW: '`❌` Rola, którą chcesz zabrać, znajduje się wyżej niż moja najwyższa rola.',
        USER_NOT_HAS_ROLE: '`❌` Użytkownik nie posiada roli <@&%s>.',
        ROLE_REMOVE_ERROR: '`❌` Nie udało się zabrać roli.',
        MODERATE_MEMBERS_PERMISSION_DENY: '`❌` Nie masz uprawnień do odciszania użytkowników.',
        BOT_MODERATE_MEMBERS_PERMISSION_DENY: '`❌` Nie mam uprawnień do odciszania użytkowników.',
        USER_IS_NOT_TIMED_OUT: '`❌` Ten użytkownik nie jest wyciszony.',
        TIMEOUT_REMOVE_ERROR: '`❌` Wystąpił problem podczas usuwania wyciszenia użytkownikowi.',
        INVALID_TIME_FORMAT: '`❌` Nieprawidłowy format czasu. Użyj np. 1h, 30m, 1d.',
        USER_IS_TIMED_OUT: '`❌` Ten użytkownik jest już wyciszony.',
        TIMEOUT_ERROR: '`❌` Wystąpił problem podczas nakładania wyciszenia na użytkownika.',
        USER_NOT_BANNED: '`❌` Ten użytkownik nie jest zbanowany.',
        UNBAN_ERROR: '`❌` Wystąpił problem podczas odbanowywania użytkownika.',
        USER_NO_BANNER: '`❌` Użytkownik nie ma ustawionego baneru.',
        INVALID_EMOJI: '`❌` Nie znaleziono poprawnego emoji. Obsługiwane są tylko niestandardowe emoji z serwera.',
        EMOJI_NOT_FOUND: '`❌` Nie znaleziono takiego emoji na tym serwerze.',
        NO_COMMANDS_AVAILABLE: '`❌` Brak dostępnych poleceń.',
        API_CONNECTION_ERROR: '`❌` Nie udało się uzyskać informacji o połączeniu.',
        FETCH_ERROR: '`❌` Nie udało się pobrać %s.',
        QUOTE_ERROR: '`❌` Wystąpił problem podczas pobierania %s.',
        REPORT_BOT_ERROR: '`❌` Nie możesz zgłosić bota.',
        CANT_REPORT_SELF: '`❌` Nie możesz zgłosić samego siebie.',
        SNITCH_CHANNEL_NOT_FOUND: '`❌` Kanał systemu zgłoszeń nie został skonfigurowany.',
        NICKNAME_NOT_SET: '`❌` Nie masz ustawionego pseudonimu.',
        SAME_NICKNAME_ERROR: '`❌` Nie możesz ustawić takiego samego pseudonimu.',
        NICKNAME_ERROR: '`❌` Nie udało się zmienić Twojego pseudonimu.',
        ONLY_MEMES_ALLOWED: '`❌` Możesz wysyłać tutaj tylko memy.',
        COMMAND_NOT_FOUND: '`❌` Polecenie które próbujesz wykonwać nie istnieje.',
        COMMAND_ERROR: '`❌` Wystąpił problem podczas wykonywania polecenia.',
        USER_ALREADY_VERIFIED: '`❌` Już zaakceptowałeś regulamin.',
        SNITCH_REJECTED_DM: '`❌` Twoje zgłoszenie %s na serwerze **%s** zostało odrzucone.',
        BAN_FAILED: '`❌` Nie udało się zbanować użytkownika (Brak uprawnień).',
        ROLE_ALREADY_OWNED: '`❌` Posiadasz już taką rolę.',
        MENU_ERROR: '`❌` To nie jest twoje menu.'
    },

    // KOMUNIKATY
    success: {
        RESTART_BOT: '`💤` Bot restartuje się...',
        SNITCH_SENT: '`➕` Twoje zgłoszenie wpłyneło do administracji. Dziękujemy za czujność!',
        VERIFIED: '`🔹` Dziękujemy za akceptację regulaminu.',
        SNITCH_ACCEPTED: '`🤩` Dziękujemy za czujność! Użytkownik, którego zgłosiłeś, został zbanowany na serwerze **%s**',
        NEW_COLOR: '`➕` Twój nowy kolor to <@&%s>.',
        SNITCH_REJECTED: '`➖` Zgłoszenie zostało odrzucone.',
        SNITCH_CLEANED: '\nWyczyszczono powiązane zgłoszenia (Łącznie: **%s**).'
    }
};