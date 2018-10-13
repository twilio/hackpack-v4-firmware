#!/bin/sh

# Lights
sleep 1s
sudo echo "6" > /sys/class/gpio/export

sleep 1s
sudo echo "out" > /sys/class/gpio/gpio6/direction

# Active low, set to 0 to enable
sleep 1s
sudo echo "0" > /sys/class/gpio/gpio6/value
sleep 1s
