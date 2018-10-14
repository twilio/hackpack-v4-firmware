#!/bin/sh

echo "> Update started"

# Repo directory
cd /home/pi/firmware

# Sync with public github
git pull

echo "> Update Complete"