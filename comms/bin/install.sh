
# Install dependencies for twilio-sync
#
# Needs to be installed manually, as we're manually
# including the library itself in the application
# stack, since it's traditionally a front-end
# Javascript library but happens to run in Node
# gracefully

sudo npm install twilio-notifications --prefix /home/pi/firmware/comms --silent
sudo npm install twilsock --prefix /home/pi/firmware/comms --silent
sudo npm install karibu --prefix /home/pi/firmware/comms --silent
sudo npm install loglevel --prefix /home/pi/firmware/comms --silent
sudo npm install operation-retrier --prefix /home/pi/firmware/comms --silent
sudo npm install backoff --prefix /home/pi/firmware/comms --silent
sudo npm install platform --prefix /home/pi/firmware/comms --silent
sudo npm install rfc6902 --prefix /home/pi/firmware/comms --silent
sudo npm install update --prefix /home/pi/firmware/comms --silent
sudo npm install uuid --prefix /home/pi/firmware/comms --silent

# Install all listed dependencies

sudo npm install --prefix /home/pi/firmware/comms --silent
