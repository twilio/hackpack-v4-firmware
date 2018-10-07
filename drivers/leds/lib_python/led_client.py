import os
import socket
import sys
import time
import optparse
from stored_patterns import LED_Scanner, White_Swell, Rainbow, USA, USA_Swell


class LEDClient(object):
    _packet_length = 100
    _client = None
    _socket_path = '/dev/lightsocket'


    def __init__(self):
        pass

    def set_lights(self, colors=None):
        cmd_str = ''

        if isinstance(colors, list):
            if len(colors) < 5:
                print('Too few parameters passed in - there are five lights.')

            else:
                for c in colors:
                    if cmd_str is not '':
                        cmd_str += ','

                    cmd_str += str(c[0]) + ',' + str(c[1]) + ',' + str(c[2])

                # Add the last integer, guessing it's for brightness

                cmd_str += ',15'

        # print(cmd_str)

        self._start_connection()
        self._send_to_lightsocket(cmd_str)
        self._render()
        self._end_connection()

    # def draw(self):
    #     self._start_connection()
    #
    #     self._send_to_lightsocket("CLR")
    #
    #     p = LED_Scanner
    #
    #     for y in range(0, len(p)):
    #         self._send_to_lightsocket(p[y])
    #
    #     # Cleanup
    #     self.reset_draw()
    #
    #     # Show lights
    #     self._render()
    #
    #     # Close socket connection
    #     self._end_connection()

    def pattern(self, pattern_name):
        self._start_connection()
        self._send_to_lightsocket('CLR')

        self._send_pattern_to_lightsocket(pattern_name)

        self.reset_draw()
        self._render()
        self._end_connection()

    def _send_pattern_to_lightsocket(self, pattern):
        p = USA_Swell

        if str(pattern).lower() == 'led_scanner':
            p = LED_Scanner
        elif str(pattern).lower() == 'white_swell':
            p = White_Swell
        elif str(pattern).lower() == 'rainbow':
            p = Rainbow

        for y in range(0, len(p)):
            self._send_to_lightsocket(p[y])

    def clear(self):
        self._start_connection()

        self._send_to_lightsocket('CLR')
        self.reset_draw()
        self._render()

        self._end_connection()

    def _render(self):
        self._send_to_lightsocket('SHW')

    def reset_draw(self):
        self._send_to_lightsocket("000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000")


    # --------------------------------------------------------------------------
    # PRIVATE METHODS
    # --------------------------------------------------------------------------


    def _start_connection(self):
        self._client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self._client.connect( self._socket_path )

    def _end_connection(self):
        self._client.shutdown(socket.SHUT_WR)
        self._client.close()

    def _send_to_lightsocket(self, output):
        if len(output) < self._packet_length:
            output = '|' + output
            output = output.rjust(self._packet_length, '0')

        self._client.sendall(output)
