import os
import socket
import sys
import time
import optparse
from stored_patterns import LED_Scanner, White_Swell, Rainbow, USA, USA_Swell, Gold_Swell
from stored_patterns import Vote_1, Vote_2, Vote_3, Vote_4, Vote_5
from stored_patterns import Pong_Cyan, Pong_Green, Pong_Red, Pong_Blue, Pong_Violet, Pong_Yellow

packet_length = 100
client = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)

def _send_to_lightsocket(output):
    if len(output) < packet_length:
        output = '|' + output
        output = output.rjust(packet_length, '0')
    client.sendall(output)
    #client.send("\n")

if __name__ == "__main__":

    parser = optparse.OptionParser()

    parser.add_option("-p", "--path", dest="path", default="/dev/lightsocket",
        help="Path to light socket", metavar="PATH")
    parser.add_option("-d", "--demo", dest="demo", default=1, type="int",
        help="Built-in demo [0-17]", metavar="DEMO")
    parser.add_option("-n", "--noclear", action="store_true", dest="noclear", default=False,
        help="Don't clear at end", metavar="NOCLEAR")
    parser.add_option("-r", "--repeat", dest="repeat", default=3, type="int",
        help="Times to repeat", metavar="TIMES")
    (options, args) = parser.parse_args()

    demo = options.demo
    if demo > 17 or demo < 0:
        print("Exiting: Invalid demo: "+demo)
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

    if os.path.exists( options.path ):
        client.connect( options.path )
    else:
        print("Exiting: Can't find socket.")
        exit(0)

    _send_to_lightsocket("CLR")

    repeat_times = options.repeat
    for x in range(0, repeat_times):
        for y in range(0, len(Pattern)):
            _send_to_lightsocket(Pattern[y])
            #time.sleep(.0005)

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
