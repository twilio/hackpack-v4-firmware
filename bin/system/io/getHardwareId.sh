
#!/bin/sh

# https://raspberrypi.stackexchange.com/questions/2086/how-do-i-get-the-serial-number
cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2
