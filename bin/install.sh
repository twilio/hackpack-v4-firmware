

# Install basic system dependencies

echo ""
echo "--------------------------------------------------"
echo ""
echo "(1 of 5) Installing system basics..."
echo ""
echo "--------------------------------------------------"
echo ""

sudo mkdir /home/pi/hp_tmp

sudo touch /home/pi/hp_tmp/.hp_storage_
sudo chown -R pi:pi /home/pi/hp_tmp/.hp_storage_

sudo touch /home/pi/hp_tmp/.authtoken
sudo chown -R pi:pi /home/pi/hp_tmp/.authtoken

sudo apt-get update
sudo apt-get install --no-install-recommends -y git
sudo apt-get install --no-install-recommends -y chromium-browser

# Install NodeJS

sudo apt-get install --no-install-recommends -y nodejs
sudo apt-get install --no-install-recommends -y npm

# Run Driver install script

echo ""
echo "--------------------------------------------------"
echo ""
echo "(2 of 5) Starting Hackpack Driver install..."
echo ""
echo "--------------------------------------------------"
echo ""

sudo bash /home/pi/firmware/drivers/bin/install.sh

# Run CLI install script

echo ""
echo "--------------------------------------------------"
echo ""
echo "(3 of 5) Starting Hackpack CLI install..."
echo ""
echo "--------------------------------------------------"
echo ""

sudo bash /home/pi/firmware/cli/bin/install.sh

# Run System API install script

echo ""
echo "--------------------------------------------------"
echo ""
echo "(4 of 5) Installing SYSTEM API..."
echo ""
echo "--------------------------------------------------"
echo ""

sudo bash /home/pi/firmware/system_api/bin/install.sh

# Run Kiosk install

echo ""
echo "--------------------------------------------------"
echo ""
echo "(5 of 5) Installing Kiosk functionality..."
echo ""
echo "--------------------------------------------------"
echo ""

sudo apt-get install -y libgtk-3-dev
sudo apt-get install --no-install-recommends -y midori
sudo apt-get install --no-install-recommends -y scons
sudo apt-get install --no-install-recommends -y swig
sudo apt-get install --no-install-recommends -y swig
sudo apt-get install --no-install-recommends -y gir1.2-webkit-3.0
sudo apt-get install --no-install-recommends -y libgtk-3.0
sudo apt-get install --no-install-recommends -y matchbox

sudo pip install pywebview[gtk3]

echo ""
echo "--------------------------------------------------"
echo ""
echo "Finished installing Hackpack v4. Rebooting..."
echo ""
echo "--------------------------------------------------"
echo ""

sudo shutdown -r now
