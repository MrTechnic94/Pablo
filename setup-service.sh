# [i] Aby uruchomic konfiguracje, uzyj polecenia 'pnpm setup-service'.
# [i] Jesli nie hostujesz bota na serwerze VPS z Linuxem,
# nie ma potrzeby tego uruchamiac.
# [i] Plik konfiguruje usluge systemowa, co pozwala botowi dzialac
# 24/7 w tle, nawet po zamknieciu konsoli.
# [i] Jest to wydajniejsza i bezpieczniejsza alternatywa dla 'PM2'.
# [i] Jezeli posiadasz malego bota lub/oraz cenisz sobie wygode
# to polecam pozostac przy 'PM2'.
# [i] Aby uzyc 'PM2' zainstaluj pakiet poleceniem 'pnpm install --save-dev pm2'
# i uruchom poleceniem 'pnpm pm2' lub 'pnpm pm2:docker'.

#!/bin/bash

# Kolory
BOLD="\033[1m"
GREEN="\033[0;32m"
RED="\033[38;5;9m"
BRIGHT_RED="\033[0;31m"
GOLD="\033[38;5;220m"
BRIGHT_GOLD="\033[38;5;178m"
NC="\033[0m"

# Uslugi
SERVICE_NAME="pablo.service"
TEMPLATE="service.template"
DESTINATION="/etc/systemd/system/$SERVICE_NAME"

printf "${BOLD}${GREEN}GOOD${NC} Starting automatic systemctl configuration...\n"

# Automatyczne wykrywanie sciezki PNPM (szuka w PATH oraz w folderach lokalnych roota)
PNPM_DETECTED=$(which pnpm || find /root/.local -name pnpm -type f -executable 2>/dev/null | head -n 1)

if [ -z "$PNPM_DETECTED" ]; then
    printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED} pnpm not found!${NC}\n"
    exit 1
fi

# Tworzenie linku systemowego dla unikniecia bledow uprawnien w systemd
if [ ! -x "/usr/bin/pnpm" ]; then
    printf "${BOLD}${GREEN}GOOD${NC} Creating system symlink for pnpm...\n"
    sudo ln -s "$PNPM_DETECTED" /usr/bin/pnpm 2>/dev/null
fi
PNPM_PATH="/usr/bin/pnpm"

# Automatyczne ustawienie uzytkownika na podstawie folderu
CURRENT_DIR=$(pwd)
case "$CURRENT_DIR" in
    /root*)
        USER_NAME="root"
        GROUP_NAME="root"
        IS_IN_ROOT=true
        printf "${BOLD}${BRIGHT_GOLD}WARN${NC}${GOLD} Root directory detected. Setting service user to ${BRIGHT_GOLD}root${GOLD}.${NC}\n"
        ;;
    *)
        USER_NAME="pablo-bot"
        GROUP_NAME="pablo-bot"
        IS_IN_ROOT=false
        if ! id "$USER_NAME" >/dev/null 2>&1; then
            printf "${BOLD}${GREEN}GOOD${NC} Creating system user ${USER_NAME}...\n"
            sudo adduser --system --group --no-create-home "$USER_NAME" > /dev/null
        fi
        sudo chown -R "$USER_NAME":"$USER_NAME" "$CURRENT_DIR"
        ;;
esac

# Sprawdzenie czy plik szablonu istnieje
if [ ! -f "$TEMPLATE" ]; then
    printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED} Template file ${BRIGHT_RED}${TEMPLATE}${RED} not found!${NC}\n"
    exit 1
fi

# Generowanie pliku uslugi
printf "${BOLD}${GREEN}GOOD${NC} Generating service file...\n"
sed -e "s|{{USER}}|$USER_NAME|g" \
    -e "s|{{GROUP}}|$GROUP_NAME|g" \
    -e "s|{{DIR}}|$CURRENT_DIR|g" \
    -e "s|{{PNPM}}|$PNPM_PATH|g" \
    "$TEMPLATE" > "$SERVICE_NAME"

# Poprawki kompatybilnosci dla katalogu /root (Sandbox escape)
if [ "$IS_IN_ROOT" = true ]; then
    printf "${BOLD}${GREEN}GOOD${NC} Applying /root compatibility fixes...\n"
    sed -i "/WorkingDirectory/a ProtectHome=false" "$SERVICE_NAME"
    sed -i "/WorkingDirectory/a ProtectSystem=off" "$SERVICE_NAME"
fi

# Instalacja i start uslugi
printf "${BOLD}${GREEN}GOOD${NC} Installing and starting the service...\n"
sudo mv "$SERVICE_NAME" "$DESTINATION"
sudo systemctl daemon-reload
sudo systemctl unmask "$SERVICE_NAME" > /dev/null 2>&1
sudo systemctl enable "$SERVICE_NAME" --now

# Sprawdzanie statusu koncowego
printf "Checking service status...\n"
sleep 2

if systemctl is-active --quiet "$SERVICE_NAME"; then
    printf "STATUS: ${BOLD}${GREEN}LIVE${NC}\n"
    printf "TO CHECK STATUS: ${GREEN}systemctl status $SERVICE_NAME${NC}\n"
    printf "TO VIEW LOGS: ${GREEN}journalctl -u $SERVICE_NAME -f${NC}\n"
else
    printf "STATUS: ${BOLD}${BRIGHT_RED}FAILED${NC}\n"
    printf "${RED}Service failed to start. Check recent logs below:${NC}\n"
    journalctl -u $SERVICE_NAME -n 15 --no-pager
    exit 1
fi