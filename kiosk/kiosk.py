import os
import sys
import subprocess
import threading
import time

import webview
import RPi.GPIO as GPIO


_AUTHTOKEN_FILE = "/home/pi/.authtoken"
_LIGHTSOCKET_PATH = '/dev/lightsocket'
_LIGHTSOCKET_PACKET_LENGTH = 100

_STORAGE_FILE = '/home/pi/hp_tmp/.hp_storage_'

_firmware_path = '/home/pi/firmware'
_threads = []
_fileMonitorActive = True
_current_url = 'https://hackpack-server.herokuapp.com'



sys.path.append(_firmware_path + '/drivers/leds/lib_python')

from led_client import LEDClient


class Api:
    def __init__(self):
        self.default_variable = False
        self.client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

        if os.path.exists(_LIGHTSOCKET_PATH):
            self.client.connect(_LIGHTSOCKET_PATH)
        else:
            print('Cant find socket.')

    def _send_to_lightsocket(self, output):
        if len(output) < _LIGHTSOCKET_PACKET_LENGTH:
            output = '|' + output
            output = output.rjust(_LIGHTSOCKET_PACKET_LENGTH, '0')

    def get(self, params):
        try:
            p = ast.literal_eval(params)
        except:
            response = {
                'message': ''
            }
            return json.dumps(response)

        if u'key' in p:
            key = p[u'key']

            # Read AuthToken from file

            try:
                f = open(_STORAGE_FILE + str(key), 'r')
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

    def set(self, params):
        try:
            p = ast.literal_eval(params)
        except:
            response = {
                'message': ''
            }

            return json.dumps(response)

        if u'key' in p and u'data' in p:
            key = p[u'key']
            # Write AuthToken to file

            try:
                f = open(_STORAGE_FILE + str(key), 'w')
                f.write(str(p[u'data']))
                f.close()

                response = {
                    'message': ''
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
            "sudo /home/pi/bin/auto_update.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': str(process)
        }

        return json.dumps(response)

    def checkWifiConnection(self, params):
        process = subprocess.check_putput(
            "sudo /home/pi/bin/check_wifi_connection.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': str(process)
        }

        return json.dumps(response)

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
        # Write AuthToken to file
        try:
            p = ast.literal_eval(params)
        except:
            response = {
                'message': ''
            }

            return json.dumps(response)

        if p['authToken']:
            f = open(_AUTHTOKEN_FILE, 'w')
            f.write(p['authToken'])
            f.close()

            response = {
                'message': 'ok'
            }

            return json.dumps(response)

        else:
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
        # Use subprocess.check_output if you expect a response
        process = subprocess.check_output(
            "sudo bash /home/pi/firmware/bin/system/io/getHardwareId.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': str(process).rstrip()
        }
        return json.dumps(response)

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

    def showLights(self, params):
        subprocess.call(
            "sudo /home/pi/bin/lights_scanner.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )

        response = {
            'message': 'ok'
        }

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
        fullscreen=True,
        text_select=False,

        js_api=api
    )
