#!/bin/bash
# Obtém o diretório atual
BASE_DIR=$(pwd)
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR'/frontend/gestor-links/backend-nodes && node --env-file=.env server.js\"
end tell"
