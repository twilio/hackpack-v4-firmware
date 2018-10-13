#!/bin/sh

# Install prerequisites

sudo pip install python-uinput

# Overlay /boot/config.txt with Hackpack config

echo ""
echo "Installing Hackpack boot configuration..."
echo ""

sudo cp /home/pi/firmware/bin/root/boot/config.txt /boot/config.txt

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
