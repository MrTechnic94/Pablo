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
BOT_USER="pablo-bot"

printf "${BOLD}${GREEN}GOOD${NC} Starting systemctl service configuration...\n"

# Sprawdzenie czy uzytkownik istnieje
if ! id "$BOT_USER" >/dev/null 2>&1; then
    printf "${BOLD}${BRIGHT_GOLD}WARN${NC}${GOLD} User ${BRIGHT_GOLD}$BOT_USER${GOLD} not found${NC}\n"
    printf "${BOLD}${GREEN}GOOD${NC} Creating system user...\n"
    sudo adduser --system --group --no-create-home "$BOT_USER" > /dev/null
fi

# Nadanie uprawnien do aktualnego folderu
CURRENT_DIR=$(pwd)
printf "${BOLD}${GREEN}GOOD${NC} Setting permissions for $CURRENT_DIR...\n"
sudo chown -R "$BOT_USER":"$BOT_USER" "$CURRENT_DIR"
sudo chmod -R 755 "$CURRENT_DIR"

IS_IN_ROOT=false
case "$CURRENT_DIR" in
    /root*)
        printf "${BOLD}${BRIGHT_GOLD}WARN${NC}${GOLD} Bot is in ${BRIGHT_GOLD}/root${GOLD}. Adjusting parent permissions...${NC}\n"
        sudo chmod +x /root
        sudo setfacl -m u:"$BOT_USER":x /root > /dev/null 2>&1 || true
        IS_IN_ROOT=true
        ;;
esac

# Sprawdzenie czy plik szablonu istnieje
if [ ! -f "$TEMPLATE" ]; then
    printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED} Template file ${BRIGHT_RED}$TEMPLATE${RED} not found${NC}\n"
    exit 1
fi

# Dane do podstawienia
USER_NAME="$BOT_USER"
GROUP_NAME="$BOT_USER"
NODE_PATH=$(which node)

printf "USER: ${GREEN}$USER_NAME${NC}\n"
printf "DIRECTORY: ${GREEN}$CURRENT_DIR${NC}\n"

# Tworzenie pliku .service
sed -e "s|{{USER}}|$USER_NAME|g" \
    -e "s|{{GROUP}}|$GROUP_NAME|g" \
    -e "s|{{DIR}}|$CURRENT_DIR|g" \
    -e "s|{{NODE}}|$NODE_PATH|g" \
    "$TEMPLATE" > "$SERVICE_NAME" || { printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED}Failed to create service file${NC}\n"; exit 1; }

if [ "$IS_IN_ROOT" = true ]; then
    printf "${BOLD}${GREEN}GOOD${NC} Injecting ProtectHome=false for /root compatibility...${NC}\n"
    sed -i "/WorkingDirectory/a ProtectHome=false" "$SERVICE_NAME"
fi

# Instalacja w systemie
printf "${BOLD}${GREEN}GOOD${NC} Installing service to $DESTINATION...\n"
sudo mv "$SERVICE_NAME" "$DESTINATION" || { printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED}Failed to move file to ${BRIGHT_RED}$DESTINATION${NC}\n"; exit 1; }

# Odmaskowanie i przeladowanie
sudo systemctl unmask "$SERVICE_NAME" > /dev/null 2>&1
sudo systemctl daemon-reload

# Start uslugi
sudo systemctl enable "$SERVICE_NAME" || { printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED}Failed to enable service${NC}\n"; exit 1; }
sudo systemctl restart "$SERVICE_NAME" || { printf "${BOLD}${BRIGHT_RED}ERROR${NC}${RED}Failed to start service${NC}\n"; exit 1; }

# Sprawdzanie statusu
printf "Checking service status...\n"
sleep 2

if systemctl is-active --quiet "$SERVICE_NAME"; then
    printf "STATUS: ${BOLD}${GREEN}LIVE${NC}\n"
    printf "TO CHECK STATUS: ${GREEN}systemctl status $SERVICE_NAME${NC}\n"
    printf "TO VIEW LOGS: ${GREEN}journalctl -u $SERVICE_NAME -f${NC}\n"
else
    printf "STATUS: ${BOLD}${BRIGHT_RED}FAILED${NC}\n"
    printf "${RED}Service is not running. Check logs:${NC}\n"
    printf "${GREEN}journalctl -u $SERVICE_NAME -n 50 --no-pager${NC}\n"
    exit 1
fi