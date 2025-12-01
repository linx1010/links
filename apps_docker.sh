#!/bin/bash

# Obtém o diretório atual
BASE_DIR=$(pwd)

# Angular
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR' && docker-compose stop angular && docker-compose rm -f angular && docker-compose build --no-cache angular && docker-compose up -d angular\"
end tell"

# Server-JS
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR' && docker-compose stop server-js && docker-compose rm -f server-js && docker-compose build --no-cache server-js && docker-compose up -d server-js\"
end tell"

# Python-Consumer
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR' && docker-compose stop python-consumer && docker-compose rm -f python-consumer && docker-compose build --no-cache python-consumer && docker-compose up -d python-consumer\"
end tell"
