#!/bin/sh

# DEPRECATED FOR THE CURL VERSION - Maybe not installed by default?

# Pings google (could even hit their 8.8.8.8 dns) for response

wget -q --tries=10 --timeout=20 --spider https://google.com > /dev/null
if [[ $? -eq 0 ]]; then
        echo "true"
else
        echo "false"
fi