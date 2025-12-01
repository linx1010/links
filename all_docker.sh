#!/bin/bash

# Obtém o diretório atual
BASE_DIR=$(pwd)

# Abre uma nova aba no Terminal e roda o ciclo completo para todos os serviços
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR' && docker-compose down -v --rmi all && docker-compose build --no-cache && docker-compose up -d\"
end tell"
