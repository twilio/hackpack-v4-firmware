import webview
import os
import time
import sys
import random
import subprocess
import socket
import fcntl
import struct
import ast
import json

# from stored_patterns import LED_Scanner, White_Swell, Rainbow,\
#     USA, USA_Swell, Gold_Swell
# from stored_patterns import Vote_1, Vote_2, Vote_3, Vote_4, Vote_5
# from stored_patterns import Pong_Cyan, Pong_Green, Pong_Red, \
#     Pong_Blue, Pong_Violet, Pong_Yellow

AUTHTOKEN_FILE = "/home/pi/hp_tmp/.authtoken"
STORAGE_FILE = "/home/pi/hp_tmp/.hp_storage_"
HACKPACK_URL = 'https://hackpack-server.herokuapp.com'
# HACKPACK_URL = 'http://10.0.0.31:4000'

LIGHTSOCKET_PATH = '/dev/lightsocket'
LIGHTSOCKET_PACKET_LENGTH = 100
DEBUG = False
client = None


class Api:
    def __init__(self):
        self.default_variable = False

        self.HW_ID = self._get_hw_id()
        if DEBUG:
            print(self.HW_ID)

    def _send_to_lightsocket(self, lightsocket, output):
        if len(output) < LIGHTSOCKET_PACKET_LENGTH:
            output = '|' + output
            output = output.rjust(LIGHTSOCKET_PACKET_LENGTH, '0')
        lightsocket.sendall(output)

    def _get_hw_id(self):
        # Extract serial from cpuinfo file
        hw_id = "0000000000000000"
        try:
            f = open('/proc/cpuinfo','r')
            for line in f:
                if line[0:6]=='Serial':
                    hw_id = line[10:26]
            f.close()
        except:
            hw_id = "ERROR000000000"

        return hw_id

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

    def run_lights(
        self,
        demo,
        repeat_times,
        noclear=False
    ):
        cmd_dict = []
        # if demo > 17 or demo < 0:
        #     print("Exiting: Invalid demo: " + demo)
        #     exit(0)
        # else:
        #     # Which pattern to run
        #     if demo == 0:
        #         # Clear
        #         Pattern = [("0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,15")]
        #     elif demo == 1:
        #         Pattern = LED_Scanner
        #     elif demo == 2:
        #         Pattern = White_Swell
        #     elif demo == 3:
        #         Pattern = Rainbow
        #     elif demo == 4:
        #         Pattern = USA
        #     elif demo == 5:
        #         Pattern = USA_Swell
        #     elif demo == 6:
        #         Pattern = Gold_Swell
        #     elif demo == 7:
        #         Pattern = Vote_1
        #     elif demo == 8:
        #         Pattern = Vote_2
        #     elif demo == 9:
        #         Pattern = Vote_3
        #     elif demo == 10:
        #         Pattern = Vote_4
        #     elif demo == 11:
        #         Pattern = Vote_5
        #     elif demo == 12:
        #         Pattern = Pong_Cyan
        #     elif demo == 13:
        #         Pattern = Pong_Green
        #     elif demo == 14:
        #         Pattern = Pong_Red
        #     elif demo == 15:
        #         Pattern = Pong_Blue
        #     elif demo == 16:
        #         Pattern = Pong_Violet
        #     elif demo == 17:
        #         Pattern = Pong_Yellow
        #
        # cmd_dict.append("CLR")
        #
        # for x in range(0, repeat_times):
        #     for y in range(0, len(Pattern)):
        #         cmd_dict.append(Pattern[y])
        #
        # # Cleanup
        # if not noclear:
        #     cmd_dict.append("000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000")
        #
        # # Read back - comment out to skip. Printed out by the server.
        # # _send_to_lightsocket("PRT")
        #
        # # Show lights
        # cmd_dict.append("SHW")
        #
        # self.call_light_sequence(cmd_dict)


    def init(self, params):
        response = {
            'message': 'Hello from Python {0}'.format(sys.version)
        }
        return json.dumps(response)

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
        # Use subprocess.check_output if you expect a response
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
        process = subprocess.check_output(
            "sudo bash /home/pi/bin/check_wifi_wget.sh",
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
            f = open(AUTHTOKEN_FILE, "r")
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
        if DEBUG:
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
        if DEBUG:
            print(params)
        response = {
            'message': self.HW_ID
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
            "sudo bash /home/pi/firmware/bin/system/io/input_arrow.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def inputCursor(self, params):
        subprocess.call(
            "sudo bash /home/pi/firmware/bin/system/io/input_cursor.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
        response = {
            'message': 'ok'
        }
        return json.dumps(response)

    def showLights(self, params):
        # Use subprocess.call if you don't need an output
        subprocess.call(
            "sudo /home/pi/bin/lights_scanner.sh",
            stderr=subprocess.STDOUT,
            shell=True
        )
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
        if DEBUG:
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
                "/home/pi/Signal2018/Doom/DOOM1.WAD",
                "-config",
                "/home/pi/hackpack-server/.chocolate-doom-config"
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
        if DEBUG:
            print(params)
        # params.message will contain the command
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if not u'xy' in p or not u'ud' in p or not u'lr' in p:
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


        command = "sudo bash -c 'touch /home/pi/.ili9341_touch.conf && echo \"" +\
                  str(xy) + str(ud) + str(lr) + \
                  "\" > /home/pi/.ili9341_touch.conf'"

        print(command)

        os.system(command)
        os.system("sudo pkill -f input_driver.py 2> /dev/null")

    def removeAuthToken(self, params):
        if DEBUG:
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
        if DEBUG:
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
        if DEBUG:
            print(params)
        # params.message will contain the command
        p = self.parse_react_json(params)
        if p == '':
            response = {
                'message': ''
            }
            return json.dumps(response)

        if DEBUG:
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
        if DEBUG:
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


if __name__ == '__main__':
    api = Api()
    webview.create_window(
        'Hackpack v4',
        url=HACKPACK_URL,
        js_api=api,
        width=640,
        height=480,
        resizable=False,
        fullscreen=True,
        min_size=(320, 240),
        background_color='#F00',
        text_select=False,
        debug=True
    )
