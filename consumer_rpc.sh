#!/bin/bash
# Obtém o diretório atual
BASE_DIR=$(pwd)

osascript -e "tell application \"Terminal\"
    do script \"cd '$BASE_DIR'/backend && conda activate estudos && python consumer_rpc.py\"
end tell"