import ast
import fcntl
import json
import os
import struct
import socket
import struct
import subprocess
import sys
import threading
import time
import webview


_AUTHTOKEN_FILE = "/home/pi/hp_tmp/.authtoken"
_STORAGE_FILE = '/home/pi/hp_tmp/.hp_storage_'

_LIGHTSOCKET_PATH = '/dev/lightsocket'
_LIGHTSOCKET_PACKET_LENGTH = 100

_HW_ID = None

_firmware_path = '/home/pi/firmware'
_threads = []
_fileMonitorActive = True
_current_url = 'https://hackpack-server.herokuapp.com'
_client = None

_DEBUG = False


sys.path.append(_firmware_path + '/drivers/leds/lib_python')

from led_client import LEDClient


class Api:

    def __init__(self):
        self.default_variable = False

        self._HW_ID = self._get_hw_id()

        if _DEBUG:
            print(self._HW_ID)

    def _send_to_lightsocket(self, output):
        if len(output) < _LIGHTSOCKET_PACKET_LENGTH:
            output = '|' + output
            output = output.rjust(_LIGHTSOCKET_PACKET_LENGTH, '0')

        lightsocket.sendall(output)

    def _get_hw_id(self):
        # Extract serial from cpuinfo file

        hardware_id = '0000000000000000'

        try:
            f= open('/proc/cpuinfo', 'r')

            for line in f:
                if line[0:6] == 'Serial':
                    hardware_id = line[10:26]

            f.close()

        except:
            hardware_id = 'ERROR000000000'

        return hardware_id

    def call_light_sequence(self, light_commands):
        try:
            if os.path.exists( LIGHTSOCKET_PATH ):
                client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                client.connect( LIGHTSOCKET_PATH )
            else:
                print("Exiting: Can't find socket.")
                return
            for command in light_commands:
                self._send_to_lightsocket(client, command)
            client.shutdown(socket.SHUT_WR)
            client.close()
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

    def run_lights(self, demo, repeat_times, noclear=False):
        cmd_dict = []
        if demo > 17 or demo < 0:
            print("Exiting: Invalid demo: " + demo)
            exit(0)
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

        cmd_dict.append("CLR")

        for x in range(0, repeat_times):
            for y in range(0, len(Pattern)):
                cmd_dict.append(Pattern[y])

        # Cleanup
        if not noclear:
            cmd_dict.append("000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000")

        # Read back - comment out to skip. Printed out by the server.
        # _send_to_lightsocket("PRT")

        # Show lights
        cmd_dict.append("SHW")

        self.call_light_sequence(cmd_dict)



    def get(self, params):
        if DEBUG:
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
                f = open(STORAGE_FILE + str(key), "r")
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
        if DEBUG:
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
                f = open(STORAGE_FILE + str(key), "w")
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
        process = subprocess.check_output(
            "sudo /home/pi/firmware/bin/auto_update.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': str(process)
        }

        return json.dumps(response)

    def checkWifiConnection(self, params):
        process = subprocess.check_putput(
            "sudo /home/pi/firmware/bin/check_wifi_wget.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': str(process)
        }

        return json.dumps(response)

    def getAuthToken(self, params):
        # Read AuthToken from file
        try:
            f = open(_AUTHTOKEN_FILE, 'r')
            value = f.read()
            f.close()

            response = {
                'message': value.rstrip()
            }

        except:
            response = {
                'message': ''
            }

        return json.dumps(response)

    def setAuthToken(self, params):
        if DEBUG:
            print(params)
        # Write AuthToken to file
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'authToken' in p:
            f = open(AUTHTOKEN_FILE, "w")
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
        if DEBUG:
            print(params)
        response = {
            'message': self.HW_ID
        }
        return json.dumps(response)

    def inputArrow(self, params):
        process = subprocess.call(
            "sudo bash /home/pi/firmware/bin/system/io/input_arrow.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': 'ok'
        }

        return response

    def inputCursor(self, params):
        process = subprocess.call(
            "sudo bash /home/pi/firmware/bin/system/io/input_cursor.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': 'ok'
        }

        return response


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

    def showLights(self, params):
        subprocess.call(
            "sudo /home/pi/bin/lights_scanner.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': 'ok'
        }

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
        try:
            p = st.literal_eval(params)
        except:
            response = {
                'message': ''
            }

            return json.dumps(response)

        parameters = \
            [
                "python",
                "/home/pi/drivers/leds/light_client/lightclient.py"
            ]

        if p['demo']:
            parameters.append('-d')
            parameters.append('-r')
            parameters.append(str(p['repeat']))

        subprocess.Popen(parameters)
        response = {
            'message': 'ok'
        }

        return json.dumps(response)

    def lightsOff(self, params):
        self._send_to_lightsocket('CLR')
        self._send_to_lightsocket('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1')
        self._send_to_lightsocket('SHW')

        response = {
            'message': 'ok'
        }

        return json.dumps(response)

    def clearLightSequence(self, params):
        self._send_to_lightsocket("CLR")
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def lightLights(self, params):
        self._send_to_lightsocket("SHW")
        response = {
            'message': 'ok'
        }

        return json.dumps(response)

    def addLightCommand(self, params):
        # params.message will contain the command
        try:
            p_dict = ast.literal_eval(params)
        except:
            response = {
                'message': ''
            }
            return json.dumps(response)

        print len(p_dict[u'message'].split(','))

        if u'message' in p_dict and len(p_dict[u'message'].split(',')) == 16:
            self._send_to_lightsocket(p_dict[u'message'])
            response = {
                'message': 'ok'
            }
        else:
            response = {
                'message': ''
            }
        return json.dumps(response)

    def textLights(self, params):
        # params.message will contain the entire sms message
        try:
            p_dict = ast.literal_eval(params)
        except:
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'message' in p_dict and len(p_dict[u'message'].split(',')) == 16:
            self._send_to_lightsocket("CLR")
            self._send_to_lightsocket(p_dict[u'message'])
            self._send_to_lightsocket("SHW")
            response = {
                'message': 'ok'
            }
            return json.dumps(response)

    def setTouch(self, params):
        # Paul: Allow driver change, todo
        pass



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
        url=_current_url,
        width=640,
        height=480,
        resizeable=False,
        fullscreen=True,
        min_size=(320, 240),
        background_color='#F00',
        text_select=False,
        debug=_DEBUG,

        js_api=api
    )
