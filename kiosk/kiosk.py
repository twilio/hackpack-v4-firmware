import os
import sys
import subprocess

import webview


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


if __name__ == '__main__':
    api = Api()

    webview.create_window(
        "",
        #url="file:///home/pi/firmware/system_api/snake.htm",
        url="../../hoppo/index.htm",
        #url="http://frankpoth.info/content/pop-vlog/javascript/2017/009-control/control.html",
        width=640,
        height=480,
        fullscreen=True,
        text_select=False,

        js_api=api
    )
