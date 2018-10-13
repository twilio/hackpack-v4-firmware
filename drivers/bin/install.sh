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
sudo echo "" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "network={" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "    ssid=\"SIGNAL18\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "    psk=\"Join us at signal\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "    id_str=\"signal_guest\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "}" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "network={" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "    ssid=\"TwilioGuest\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "    psk=\"join us at twilio\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "    id_str=\"twilio_guest\"" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "}" >> /etc/wpa_supplicant/wpa_supplicant.conf
sudo echo "" >> /etc/wpa_supplicant/wpa_supplicant.conf

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
