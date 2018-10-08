import os
import sys
import subprocess
import threading
import time

import webview
import paho.mqtt.client as mqtt


_firmware_path = '/home/pi/firmware'

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

def mqtt_on_connect(client, userdata, flags, rc):
    print("Connected with local MQTT server")

def mqtt_on_message(client, userdata, msg):
    print("Message from MQTT server: " + msg.topic+" "+str(msg.payload))


client = mqtt.Client()

def mqtt_start():
    time.sleep(0.1)

    client.loop_forever()


if __name__ == '__main__':
    client.on_connect = mqtt_on_connect
    client.on_message = mqtt_on_message

    client.connect("localhost", 1883, 60)

    t = threading.Thread(target=mqtt_start)
    t.start()



    api = Api()

    webview.create_window(
        "",
        #url="file:///home/pi/firmware/system_api/snake.htm",
        #url="../../hoppo/index.htm",
        url="http://hackpack-hoppo.herokuapp.com",
	#url="http://frankpoth.info/content/pop-vlog/javascript/2017/009-control/control.html",
        width=640,
        height=480,
        fullscreen=True,
        text_select=False,

        js_api=api
    )
