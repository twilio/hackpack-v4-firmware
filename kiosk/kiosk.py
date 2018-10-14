
import ast
import fcntl
import json
import os
import sys
import struct
import socket
import struct
import subprocess
import sys
import threading
import time
import webview
import collections
import random
import math
from pynput import keyboard

# Import LED python library
FIRMWARE_PATH = '/home/pi/firmware'
sys.path.append(FIRMWARE_PATH + '/drivers/leds/lib_python')
from led_client import LEDClient
from stored_patterns import LED_Scanner, White_Swell, Rainbow
from stored_patterns import USA, USA_Swell, Gold_Swell
from stored_patterns import Vote_1, Vote_2, Vote_3, Vote_4, Vote_5
from stored_patterns import Pong_Cyan, Pong_Green, Pong_Red
from stored_patterns import Pong_Blue, Pong_Violet, Pong_Yellow
from stored_patterns import Cyan_Wave, Green_Wave, Red_Wave
from stored_patterns import Blue_Wave, Violet_Wave, Yellow_Wave
from stored_patterns import Inv_Cyan_Wave, Inv_Green_Wave, Inv_Red_Wave
from stored_patterns import Inv_Blue_Wave, Inv_Violet_Wave, Inv_Yellow_Wave
from stored_patterns import OK_GO_PINK, OK_GO_BLUE, OK_GO_GREEN, OK_GO_YELLOW
from stored_patterns import OK_GO_PURPLE, OK_GO_RED, OK_GO_ORANGE, OK_GO_WHITE

HACKPACK_URL = 'https://hackpack-server.herokuapp.com'
CURRENT_URL = HACKPACK_URL
_max_lights = 100
_is_debug = False

# Number of ESCAPE taps in a row to send user URL back to home
CONSECUTIVE_ESCAPE = 3

# Initialize and load the buffer
circular_keys = collections.deque(maxlen=CONSECUTIVE_ESCAPE)
circular_keys.append(0)
circular_keys.append(0)
circular_keys.append(0)


class BrowserApi:
    """Main Browser API exposed through the webview."""

    _AUTHTOKEN_FILE = "/home/pi/hp_tmp/.authtoken"
    _STORAGE_FILE = "/home/pi/hp_tmp/.hp_storage_"
    _LIGHTSOCKET_PATH = '/dev/lightsocket'
    _LIGHTSOCKET_PACKET_LENGTH = 100
    _client = None
    _HW_ID = None
    _is_debug = True

    def __init__(self, debug):
        self.default_variable = False
        self._is_debug = debug
        self._HW_ID = self._get_hw_id()
        self._max_lights = _max_lights
        if self._is_debug:
            print(self._HW_ID)

    def _send_to_lightsocket(self, lightsocket, output):
        if len(output) < self._LIGHTSOCKET_PACKET_LENGTH:
            output = '|' + output
            output = output.rjust(self._LIGHTSOCKET_PACKET_LENGTH, '0')
        lightsocket.sendall(output)

    def _get_hw_id(self):
        # Extract serial from cpuinfo file
        hw_id = "0000000000000000"
        try:
            f = open('/proc/cpuinfo', 'r')
            for line in f:
                if line[0:6] == 'Serial':
                    hw_id = line[10:26]
            f.close()
        except:
            hw_id = "ERROR000000000"

        return hw_id

    def _dim_light_cmd(self, cmd, dim=None):
        if not dim:
            dim = self._max_lights
        if self._is_debug:
            print(cmd)
        factor = float(dim) / float(100)
        lcmd = cmd.split(',')
        for i, intensity in enumerate(lcmd[:-1]):
            lcmd[i] = int(float(intensity) * factor)
        dimmed_lights = ','.join([str(i) for i in lcmd])
        if self._is_debug:
            print(dimmed_lights)
        return dimmed_lights

    def call_light_sequence(self, light_commands):
        try:
            if os.path.exists(self._LIGHTSOCKET_PATH):
                self._client = \
                    socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                self._client.connect(self._LIGHTSOCKET_PATH)
            else:
                print("Exiting: Can't find socket.")
                return
            for command in light_commands:
                self._send_to_lightsocket(self._client, command)
            self._client.shutdown(socket.SHUT_WR)
            self._client.close()
        except:
            print("Exiting: Failed socket.")
            return

    def parse_react_json(self, react_json):
        try:
            p = ast.literal_eval(react_json)
        except:
            try:
                p = ast.literal_eval(json.dumps(react_json))
            except:
                return ''

        return p

    def run_lights(
        self,
        demo,
        repeat_times,
        noclear=False
    ):
        cmd_dict = []
        if int(demo) > 37 or int(demo) < 0:
            print("Exiting: Invalid demo: " + str(demo))
            return
        else:
            # Which pattern to run
            if demo == 0:
                # Clear
                Pattern = [("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15")]
            elif demo == 1:
                Pattern = LED_Scanner
            elif demo == 2:
                Pattern = White_Swell
            elif demo == 3:
                Pattern = Rainbow
            elif demo == 4:
                Pattern = USA
            elif demo == 5:
                Pattern = USA_Swell
            elif demo == 6:
                Pattern = Gold_Swell
            elif demo == 7:
                Pattern = Vote_1
            elif demo == 8:
                Pattern = Vote_2
            elif demo == 9:
                Pattern = Vote_3
            elif demo == 10:
                Pattern = Vote_4
            elif demo == 11:
                Pattern = Vote_5
            elif demo == 12:
                Pattern = Pong_Cyan
            elif demo == 13:
                Pattern = Pong_Green
            elif demo == 14:
                Pattern = Pong_Red
            elif demo == 15:
                Pattern = Pong_Blue
            elif demo == 16:
                Pattern = Pong_Violet
            elif demo == 17:
                Pattern = Pong_Yellow
            elif demo == 18:
                Pattern = Cyan_Wave
            elif demo == 19:
                Pattern = Green_Wave
            elif demo == 20:
                Pattern = Red_Wave
            elif demo == 21:
                Pattern = Blue_Wave
            elif demo == 22:
                Pattern = Violet_Wave
            elif demo == 23:
                Pattern = Yellow_Wave
            elif demo == 24:
                Pattern = Inv_Cyan_Wave
            elif demo == 25:
                Pattern = Inv_Green_Wave
            elif demo == 26:
                Pattern = Inv_Red_Wave
            elif demo == 27:
                Pattern = Inv_Blue_Wave
            elif demo == 28:
                Pattern = Inv_Violet_Wave
            elif demo == 29:
                Pattern = Inv_Yellow_Wave
            elif demo == 30:
                Pattern = OK_GO_PINK
            elif demo == 31:
                Pattern = OK_GO_BLUE
            elif demo == 32:
                Pattern = OK_GO_GREEN
            elif demo == 33:
                Pattern = OK_GO_YELLOW
            elif demo == 34:
                Pattern = OK_GO_PURPLE
            elif demo == 35:
                Pattern = OK_GO_RED
            elif demo == 36:
                Pattern = OK_GO_ORANGE
            elif demo == 37:
                Pattern = OK_GO_WHITE

        cmd_dict.append("CLR")

        for x in range(0, repeat_times):
            for y in range(0, len(Pattern)):
                if self._max_lights < 100:
                    cmd_dict.append(self._dim_light_cmd(Pattern[y]))
                elif self._max_lights == 0:
                    return
                else:
                    cmd_dict.append(Pattern[y])

        # Cleanup
        if not noclear:
            cmd_dict.append("000,000,000,000,000,000,000,000,"
                            "000,000,000,000,000,000,000,001")

        # Read back - comment out to skip. Printed out by the server.
        # _send_to_lightsocket("PRT")

        # Show lights
        cmd_dict.append("SHW")

        self.call_light_sequence(cmd_dict)


    def init(self, params):
        response = {
            'message': 'Hello from Python {0}'.format(sys.version)
        }
        return json.dumps(response)

    def get(self, params):
        if self._is_debug:
            print(params)
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'key' in p:
            key = p[u'key']
            # Read AuthToken from file
            try:
                f = open(self._STORAGE_FILE + str(key), "r")
                value = f.read()
                f.close()
                response = {
                    'message': value
                }
            except:
                response = {
                    'message': ''
                }
            return json.dumps(response)
        response = {
            'message': ''
        }
        return json.dumps(response)

    def set(self, params):
        if self._is_debug:
            print(params)
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'key' in p and u'data' in p:
            key = p[u'key']
            # Write AuthToken to file
            try:
                f = open(self._STORAGE_FILE + str(key), "w")
                f.write(str(p[u'data']))
                f.close()
                response = {
                    'message': 'ok'
                }
            except:
                response = {
                    'message': ''
                }
        else:
            response = {
                'message': ''
            }
        return json.dumps(response)

    def autoUpdate(self, params):
        # Use subprocess.check_output if you expect a response
        process = subprocess.check_output(
            "sudo /home/pi/firmware/bin/system/etc/auto_update.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': str(process)
        }
        return json.dumps(response)

    def checkWifiConnection(self, params):
        process = subprocess.check_output(
            "sudo bash /home/pi/firmware/bin/system/etc/check_wifi_curl.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': str(process),
        }
        return json.dumps(response)

    def getAuthToken(self, params):
        # Read AuthToken from file
        try:
            f = open(self._AUTHTOKEN_FILE, "r")
            value = f.read()
            f.close()
            response = {
                # 'message': str(process).rstrip()
                'message': value.rstrip()
            }
        except:
            response = {
                'message': ''
            }
        return json.dumps(response)

    def setAuthToken(self, params):
        if self._is_debug:
            print(params)
        # Write AuthToken to file
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'authToken' in p:
            f = open(self._AUTHTOKEN_FILE, "w")
            f.write(p[u'authToken'])
            f.close()
            response = {
                'message': 'ok'
            }
            return json.dumps(response)
        else:
            response = {
                'message': ''
            }
            return json.dumps(response)

    # Usage: get_ip_address('eth0') -> 192.160.0.110
    def getIpAddress(self, params):
        if self._is_debug:
            print(params)
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
        return json.dumps(response)

    def getHardwareId(self, params):
        if self._is_debug:
            print(params)
        response = {
            'message': self._HW_ID
        }
        return json.dumps(response)

    def getRandomNumber(self, params):
        randNum = random.randint(0, 100000000)
        message = 'Random IO: {0}'.format(randNum)
        response = {
            'message': message
        }
        return json.dumps(response)

    def inputArrow(self, params):
        subprocess.Popen(
            "sudo /home/pi/firmware/bin/system/io/input_arrow.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def inputCursor(self, params):
        subprocess.call(
            "sudo /home/pi/firmware/bin/system/io/input_cursor.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def showLights(self, params):
        # Show scanner
        self.run_lights(1, 3)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def lightsOff(self, params):
        # Use subprocess.call if you don't need an output
        cmd_dict = []
        cmd_dict.append("CLR")
        cmd_dict.append("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1")
        cmd_dict.append("SHW")
        self.call_light_sequence(cmd_dict)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def showLightsParams(self, params):
        if self._is_debug:
            print(params)
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        demo, repeat = 2, 3

        if u'demo' in p:
            try:
                demo = int(p[u'demo'])
            except:
                pass

        if u'repeat' in p:
            try:
                repeat = int(p[u'repeat'])
            except:
                pass

        self.run_lights(demo, repeat)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def lightsOff(self, params):
        # Use subprocess.call if you don't need an output
        cmd_dict = []
        cmd_dict.append("CLR")
        cmd_dict.append("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1")
        cmd_dict.append("SHW")
        self.call_light_sequence(cmd_dict)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def setLightIntensity(self, params):
        global _max_lights
        if self._is_debug:
            print(params)
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'intensity' in p:
            try:
                new_int = int(p[u'intensity'])
                if new_int >= 0 and new_int <= 100:
                    _max_lights = new_int
                    self._max_lights = new_int
                    if self._is_debug:
                        print("New intensity: " + _max_lights)
                    response = {
                        'message': 'ok'
                    }
                    return json.dumps(response)
            except:
                pass

        response = {
            'message': ''
        }
        return json.dumps(response)



    def changeWebView(self, params):
        # Add key 'url' with a URL to change
        global CURRENT_URL
        if self._is_debug:
            print(params)
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'url' in p:
            CURRENT_URL = p[u'url']
            self.run_lights(18, 5)
            webview.load_url(CURRENT_URL)

            response = {
                'message': 'ok'
            }
        else:
            response = {
                'message': ''
            }
        return json.dumps(response)

    def longTime(self, params):
        time.sleep(15)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def launchDoom(self, params):
        p = subprocess.Popen(
            [
                "chocolate-doom",
                "-iwad",
                "/home/pi/doom/DOOM1.WAD",
                "-config",
                "/home/pi/doom/.chocolate-doom-config",
                "extraconfig",
                "/home/pi/doom/.chocolate-doom-extra-config"
            ]
        )
        p.wait()
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def launchMicropolis(self, params):
        p = subprocess.Popen(["micropolis"])
        p.wait()
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def launchOpenTTD(self, params):
        p = subprocess.Popen(["openttd"])
        p.wait()
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def clearLightSequence(self, params):
        cmd_dict = []
        cmd_dict.append("CLR")
        self.call_light_sequence(cmd_dict)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def lightLights(self, params):
        cmd_dict = []
        cmd_dict.append("SHW")
        self.call_light_sequence(cmd_dict)
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def changeTouchscreenMode(self, params):
        if self._is_debug:
            print(params)
        # params.message will contain the command
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'xy' not in p or u'ud' not in p or u'lr' not in p:
            print("1")
            response = {
                'message': ''
            }
            return json.dumps(response)

        try:
            xy, ud, lr = \
                map(int, list([p[u'xy'], p[u'ud'], p[u'lr']]))
        except:
            print("2")
            response = {
                'message': ''
            }
            return json.dumps(response)

        command = "sudo bash -c" \
                  "'touch /home/pi/.ili9341_touch.conf && echo \"" + \
                  str(xy) + str(ud) + str(lr) + \
                  "\" > /home/pi/.ili9341_touch.conf'"

        if self._is_debug:
            print(command)

        os.system(command)
        os.system("sudo pkill -f input_driver.py 2> /dev/null")

    def removeAuthToken(self, params):
        if self._is_debug:
            print(params)

        try:
            os.system('sudo rm /home/pi/hp_tmp/.authtoken 2> /dev/null')
        except:
            pass

        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def removeAllTempStorage(self, params):
        if self._is_debug:
            print(params)

        try:
            os.system('find /home/pi/hp_tmp -mindepth 1 -delete')
        except:
            pass

        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def addLightCommand(self, params):
        if self._is_debug:
            print(params)
        # params.message will contain the command
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if self._is_debug:
            print(p)
            print(type(p))

        if u'message' in p:
            p_dict = p[u'message'].split(',')
            print len(p_dict)
            if u'message' in p and len(p_dict) == 16:
                cmd_dict = []
                cmd_dict.append(p[u'message'])
                print cmd_dict
                self.call_light_sequence(cmd_dict)
                response = {
                    'message': 'ok'
                }
            else:
                response = {
                    'message': ''
                }
            return json.dumps(response)

        response = {
            'message': ''
        }
        return json.dumps(response)

    def textLights(self, params):
        if self._is_debug:
            print(params)
        # params.message will contain the entire sms message
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'message' in p_dict and len(p_dict[u'message'].split(',')) == 16:
            cmd_dict = []
            cmd_dict.append("CLR")
            cmd_dict.append(p_dict[u'message'])
            cmd_dict.append("SHW")
            self.call_light_sequence(cmd_dict)
            response = {
                'message': 'ok'
            }
            return json.dumps(response)

    def selfDestruct(self, params):
        if self._is_debug:
            print(params)

        try:
            os.system('sudo pkill -f kiosk.py 2> /dev/null')
        except:
            pass

        response = {
            'message': 'ok'
        }
        return json.dumps(response)


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

def on_release(key):
    global CURRENT_URL, HACKPACK_URL, _is_debug, _max_lights
    if _is_debug:
        print('{0} released'.format(key))
    circular_keys.append(key)
    if keyboard.Key.esc == \
            circular_keys[0] == circular_keys[1] == circular_keys[2]:
        circular_keys.append(0)
        circular_keys.append(0)
        circular_keys.append(0)
        if CURRENT_URL is not HACKPACK_URL:
            if _is_debug:
                print("RESETTING!")
            CURRENT_URL = HACKPACK_URL
            webview.load_url(HACKPACK_URL)
            os.system(' '.join([
                'python',
                '/home/pi/firmware/drivers/leds/light_client/lightclient.py',
                '-d',
                '24',
                '-r',
                '5',
                '-i',
                str(_max_lights)
            ]))


def listen_keys():
    '''Listen to keyboard triple escape tap to go back.'''
    try:
        with keyboard.Listener(
            on_release=on_release
        ) as listener:
            listener.join()
    except:
        # No support
        return


def change_url(api):
    global CURRENT_URL
    time.sleep(30)
    CURRENT_URL = 'https://www.twilio.com'
    api.changeWebView("{u'url': '" + CURRENT_URL + "'}")
    print("Switching to " + CURRENT_URL)


if __name__ == '__main__':
    a = BrowserApi(_is_debug)
    t = threading.Thread(target=listen_keys)
    t.daemon = True
    t.start()

    if _is_debug:
        t2 = threading.Thread(target=change_url, args=(a , ))
        t2.daemon = True
        t2.start()

    webview.create_window(
        'Hackpack v4',
        url=HACKPACK_URL,
        js_api=a,
        debug=_is_debug,

        # Window style & use

        width=640,
        height=480,
        resizable=False,
        fullscreen=True,
        min_size=(320, 240),
        background_color='#F00',
        text_select=False,
    )
