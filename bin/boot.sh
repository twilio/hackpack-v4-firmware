


# Turn on drivers

sudo modprobe -i uinput
sleep 1s

# Init input drivers
# We use the /home/pi/drivers dir we copied locally during install to avoid a git pull collision on an
# actively in-use driver

sudo python /home/pi/drivers/input/input_driver.py &
sleep 1s

# Init video driver GPIO

sudo echo "5" > /sys/class/gpio/export
sleep 1s

# Set GPIO direction

sudo echo "out" > /sys/class/gpio/gpio5/direction
sleep 1s

# Set active low, set to 0 to enable

sudo echo "0" > /sys/class/gpio/gpio5/value
sleep 1s

# Activate framebuffer

sudo /home/pi/drivers/video/fbcp-ili9341 &
sleep 1s

# Activate LEDs

sudo /home/pi/firmware/bin/lights.sh
sudo /home/pi/drivers/leds/open_lightsocket &
sleep 1s

# Display startup LED sequence

python /home/pi/drivers/leds/light_client/lightclient.py

python /home/pi/firmware/kiosk/kiosk.py &
