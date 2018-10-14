import os
import socket
import sys
import time
import optparse
from stored_patterns import LED_Scanner, White_Swell, Rainbow, USA, USA_Swell, Gold_Swell
from stored_patterns import Vote_1, Vote_2, Vote_3, Vote_4, Vote_5
from stored_patterns import Pong_Cyan, Pong_Green, Pong_Red, Pong_Blue, Pong_Violet, Pong_Yellow
from stored_patterns import Cyan_Wave, Green_Wave, Red_Wave, Blue_Wave, Violet_Wave, Yellow_Wave
from stored_patterns import Inv_Cyan_Wave, Inv_Green_Wave, Inv_Red_Wave, Inv_Blue_Wave, Inv_Violet_Wave, Inv_Yellow_Wave
from stored_patterns import OK_GO_PINK, OK_GO_BLUE, OK_GO_GREEN, OK_GO_YELLOW
from stored_patterns import OK_GO_PURPLE, OK_GO_RED, OK_GO_ORANGE, OK_GO_WHITE

packet_length = 100
client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

def _send_to_lightsocket(output):
    if len(output) < packet_length:
        output = '|' + output
        output = output.rjust(packet_length, '0')
    client.sendall(output)
    #client.send("\n")

def _dim_light_cmd(cmd, dim):
    factor = float(dim) / float(100)
    lcmd = cmd.split(',')
    for i, intensity in enumerate(lcmd[:-1]):
        lcmd[i] = int(float(intensity) * factor)
    dimmed_lights = ','.join([str(i) for i in lcmd])
    return dimmed_lights

if __name__ == "__main__":

    parser = optparse.OptionParser()

    parser.add_option("-p", "--path", dest="path", default="/dev/lightsocket",
        help="Path to light socket", metavar="PATH")
    parser.add_option("-d", "--demo", dest="demo", default=1, type="int",
        help="Built-in demo [0-37]", metavar="DEMO")
    parser.add_option("-i", "--intensity", dest="intensity", default=100, type="int",
        help="Light Brightness [0-100]", metavar="INTENSITY")
    parser.add_option("-n", "--noclear", action="store_true", dest="noclear", default=False,
        help="Don't clear at end", metavar="NOCLEAR")
    parser.add_option("-r", "--repeat", dest="repeat", default=3, type="int",
        help="Times to repeat", metavar="TIMES")
    (options, args) = parser.parse_args()

    demo = options.demo
    if int(demo) > 37 or int(demo) < 0:
        print("Exiting: Invalid demo: " + str(demo))
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


    intensity = options.intensity
    if intensity < 0:
        intensity = 0
    elif intensity > 100:
        intensity = 100

    if os.path.exists( options.path ):
        client.connect( options.path )
    else:
        print("Exiting: Can't find socket.")
        exit(0)

    _send_to_lightsocket("CLR")

    repeat_times = options.repeat
    for x in range(0, repeat_times):
        for y in range(0, len(Pattern)):
            if intensity == 0:
                pass
            elif intensity == 100:
                _send_to_lightsocket(Pattern[y])
                #time.sleep(.0005)
            else:
                _send_to_lightsocket(_dim_light_cmd(Pattern[y], intensity))

    # Cleanup
    noclear = options.noclear
    if not noclear:
        _send_to_lightsocket("000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000")

    # Read back - comment out to skip. Printed out by the server.
    # _send_to_lightsocket("PRT")

    # Show lights
    _send_to_lightsocket("SHW")

    client.shutdown(socket.SHUT_WR)
    client.close()
