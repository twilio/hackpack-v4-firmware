import os
import sys
import subprocess
import threading
import time

import webview
import RPi.GPIO as GPIO


_firmware_path = '/home/pi/firmware'
_AUTHTOKEN_FILE = "/home/pi/.authtoken"
_threads = []
_fileMonitorActive = True
_current_url = 'https://hackpack-server.herokuapp.com'



sys.path.append(_firmware_path + '/drivers/leds/lib_python')

from led_client import LEDClient


class Api:
    def __init__(self):
        self.default_variable = False

    def show_lights(self, params):
        msg = ''

        try:
            lightbar = LEDClient()
            lightbar.pattern('led_scanner')

            msg = 'Successfully displayed lights'

        except Error as e:
            msg = 'Could not activate lights: ' % e.message

        r = {
            'status': 200,
            'message': str(msg)
        }

        return r

    def getAuthToken(self, params):
        # Read AuthToken from file
        if os.path.exists(_AUTHTOKEN_FILE):
            process = subprocess.call("sudo /home/pi/firmware/bin/system/io/getAuthToken.sh", stderr=subprocess.STDOUT, shell=True)
            response = {
                'message': str(process).rstrip()
                # 'message': file.read().rstrip()
            }
        else:
            response = {
                'message': ''
            }
        return response

    def setAuthToken(self, params):
        # Write AuthToken to file
        f = open(_AUTHTOKEN_FILE, "w")
        f.write(params.authToken)
        response = {
            'message': 'ok'
        }
        return response

    # Usage: get_ip_address('eth0') -> 192.160.0.110
    def getIpAddress(self, params):
        ifname = 'wlan0'
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            ip = socket.inet_ntoa(fcntl.ioctl(
                s.fileno(),
                0x8915,  # SIOCGIFADDR
                struct.pack('256s', ifname[:15])
            )[20:24])
            response = {
                'message': str(ip)
            }
        except:
            # Error - could not retrieve IP
            response = {
                'message': '> Could not receive IP address'
            }
        return response

    def getHardwareId(self, params):
        # Use subprocess.check_output if you expect a response
        process = subprocess.check_output("sudo bash /home/pi/firmware/bin/system/io/getHardwareId.sh", stderr=subprocess.STDOUT, shell=True)
        response = {
            'message': str(process).rstrip()
        }
        return response

    def inputArrow(self, params):
        process = subprocess.call("sudo bash /home/pi/firmware/bin/system/io/input_arrow.sh", stderr=subprocess.STDOUT, shell=True)
        response = {
            'message': 'ok'
        }
        return response

    def inputCursor(self, params):
        process = subprocess.call("sudo bash /home/pi/firmware/bin/system/io/input_cursor.sh", stderr=subprocess.STDOUT, shell=True)
        response = {
            'message': 'ok'
        }
        return response

def file_monitor():
    global _fileMonitorActive
    global _current_url

    while _fileMonitorActive:
        time.sleep(5)
        print 'Checking file..'

        file_path = '/home/pi/config.txt'

        file_exists = os.path.isfile(file_path)

        # print('Current url: ' + _current_url)

        if file_exists:
            f = open('/home/pi/config.txt', 'r')

            if f.mode == 'r':
                requested_url = f.read()

                if requested_url != _current_url:
                    _current_url = requested_url
                    webview.load_url(_current_url)

if __name__ == '__main__':
    t = threading.Thread(target=file_monitor)
    _threads.append(t)
    t.start()

    api = Api()

    webview.create_window(
        "",
        #url="file:///home/pi/firmware/system_api/snake.htm",
        #url="../../hoppo/index.htm",
        url=_current_url,
	#url="http://frankpoth.info/content/pop-vlog/javascript/2017/009-control/control.html",
        width=640,
        height=480,
        fullscreen=True,
        text_select=False,

        js_api=api
    )
