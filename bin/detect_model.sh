#!/bin/bash

# Get Raspberry Pi model information
pi_model=$(cat /proc/cpuinfo | grep Model | cut -d':' -f2 | xargs)

# Detect if we're running on a Pi Zero 2W or Pi Zero W
if [[ "$pi_model" == *"Raspberry Pi Zero 2 W"* ]]; then
    echo "zero2"
elif [[ "$pi_model" == *"Raspberry Pi Zero W"* ]]; then
    echo "zerow"
else
    echo "unknown"
fi
