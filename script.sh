#!/bin/bash

# Obtém o diretório atual
BASE_DIR=$(pwd)

# 1. Abre uma nova aba no Terminal e roda o consumer_rpc.py com o conda estudos
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR'/backend && conda activate estudos && python consumer_rpc.py\"
end tell"

# 2. Abre outra aba no Terminal e roda o server.js
osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR'/frontend/gestor-links/backend-nodes && node server.js\"
end tell"
