#!/bin/bash

# Install prerequisites

# Detect Pi model
PI_MODEL=$(/home/pi/firmware/bin/detect_model.sh)

# Install Python packages using pip3
sudo pip3 install python-uinput
sudo pip3 install RPi.GPIO
sudo pip3 install spidev

# Overlay appropriate config.txt based on Pi model
echo ""
echo "Installing Hackpack boot configuration for $PI_MODEL..."
echo ""

if [ "$PI_MODEL" = "zero2" ]; then
    sudo cp /home/pi/firmware/bin/root/boot/config_zero2w.txt /boot/config.txt
    echo "Installed Zero 2W configuration"
elif [ "$PI_MODEL" = "zerow" ]; then
    sudo cp /home/pi/firmware/bin/root/boot/config_zerow.txt /boot/config.txt
    echo "Installed Zero W configuration"
else
    echo "Unknown Pi model. Please ensure you're using a Pi Zero W or Pi Zero 2W"
    exit 1
fi

# Add predefined wifi networks Hackpack can join

echo ""
echo "Installing wifi networks..."
echo ""

# sudo cp /home/pi/firmware/bin/root/boot/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf
echo "" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "network={" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "    ssid=\"SIGNAL18\"" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "    psk=\"Join us at signal\"" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "    id_str=\"signal_guest\"" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "}" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "network={" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "    ssid=\"TwilioGuest\"" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "    psk=\"join us at twilio\"" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "    id_str=\"twilio_guest\"" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "}" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf
echo "" | sudo tee --append /etc/wpa_supplicant/wpa_supplicant.conf

# Configure boot-time background image

echo ""
echo "Installing Hackpack boot background image"
echo ""

sudo cp /home/pi/firmware/bin/root/opt/splash.png /opt/splash.png

# Install drivers

echo ""
echo "Installing drivers..."
echo ""

sudo cp -r /home/pi/firmware/drivers /home/pi

# Set up boot sequencing

echo ""
echo "Setting up boot sequencing..."
echo ""

sudo cp /home/pi/firmware/bin/root/home/pi/.config/lxsession/LXDE-pi/autostart /home/pi/.config/lxsession/LXDE-pi/autostart
sudo chmod 775 /home/pi/firmware/bin/boot.sh


echo ""
echo "Setting up Doom..."
echo ""

# Soon

echo ""
echo "Finished installing driver support"
echo ""
