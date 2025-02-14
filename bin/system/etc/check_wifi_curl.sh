#!/bin/sh

# WAY BETTER THAN WGET (leaner)

# Pings google (could even hit their 8.8.8.8 dns) for response

curl -sS https://google.com > /dev/null
if [[ $? -eq 0 ]]; then
        echo "true"
else
        echo "false"
fi