"""HackPack v4 input driver.

Written in python because C takes too long to prototype. Could be rewritten
to use interrupts/pin change for the 7 buttons. No choice but to poll the A/D
converter; doesn't give us interrupts.
"""

from spidev import SpiDev
import time
import uinput
import RPi.GPIO as GPIO
import os
import signal
import sys
import math
import socket
import fcntl
import commands

# Turn on flood of messages
DEBUG = False

# Turn on and off touch and joystick
TOUCH_ON = True
JOYSTICK_ON = True
BUTTONS_ON = True

# Attempt to work around broken touchscreen or joystick
DETECT_OFF_SECONDS = 1

# MCP3008 10-Bit A/D Converter, Max is *1024*, center is *512*.
# Must be even number, between the two middles we won't move cursor.
# Most joysticks are ~ 490-530 at rest so be very conservative...

JOYSTICK_THRESHOLDS_X = [227, 277, 307, 382, 642, 717, 767, 817]
JOYSTICK_THRESHOLDS_Y = [227, 277, 307, 382, 642, 717, 767, 817]

# In arrow mode, we turn it binary. Set values here.

ARROW_THRESHOLD_X_LOW = 342
ARROW_THRESHOLD_Y_LOW = 342
ARROW_THRESHOLD_X_HIGH = 742
ARROW_THRESHOLD_Y_HIGH = 742

# Must be half the size of thresholds (both directions)
# Starts from most extreme
JOYSTICK_MOVEMENT_X = [8, 5, 2, 1]
JOYSTICK_MOVEMENT_Y = [11, 5, 3, 2]

if len(JOYSTICK_THRESHOLDS_X) % 2 != 0 or \
        len(JOYSTICK_THRESHOLDS_Y) % 2 != 0 or \
        len(JOYSTICK_THRESHOLDS_X) / 2 != len(JOYSTICK_MOVEMENT_X) or \
        len(JOYSTICK_THRESHOLDS_Y) / 2 != len(JOYSTICK_MOVEMENT_Y):
    print("Fix thresholds!")
    exit(0)

# Button and debouncing behavior
SHUTDOWN_HOLD_SECONDS = 3
POLLS_A_SECOND = 60
BUTTON_BOUNCE_SECONDS = .02

#  DON'T CHANGE BELOW HERE WITHOUT ASKING PAUL!      #
######################################################

# Socket (for changing mode on the driver)
SOCKET_PATH = "/dev/hackpack_input_driver"
SOCK = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)

# Handle graceful exit from arrow mode
RESET_STICK_MODE_SECONDS = 21

# Opening readings
ts, up_down, left_right = -1, -1, -1

# ILI9341 Settings...
XY_REVERSED = True
UPDOWN_INVERTED = False
LEFTRIGHT_INVERTED = False

# To verify
try:
    TOUCH_CONF = commands.getstatusoutput("cat /etc/ili9341_touch.conf")
    XY_REVERSED, UPDOWN_INVERTED, LEFTRIGHT_INVERTED = \
        map(lambda x: bool(int(x)), list(TOUCH_CONF[1]))
    print(XY_REVERSED, UPDOWN_INVERTED, LEFTRIGHT_INVERTED)
except:
    pass

# System Resolution
XRES, YRES = 640, 480

# Touch ADC Sensitivity
# 12-Bit
TOUCH_LEVELS = 4096
TOUCH_VOLTAGE_X = (200, 3830)
TOUCH_VOLTAGE_Y = (200, 3830)
LAST_X_POS, LAST_Y_POS = 0, 0

# To verify
try:
    RES = commands.getstatusoutput("cat /sys/class/graphics/fb0/virtual_size")
    XRES, YRES = map(float, RES[1].split(','))
    print(XRES, YRES)
except:
    pass

# Manual Touchscreen
CS_TOUCH = 4
X_ADDR, Y_ADDR = 0xD0, 0x90

# Button Layout // BMC GPIO number
POWER_BUTTON = 3
START_BUTTON = 26
SELECT_BUTTON = 16
A_BUTTON = 13
B_BUTTON = 25
X_BUTTON = 12
Y_BUTTON = 24

# Macros
SHUTDOWN_MAX = SHUTDOWN_HOLD_SECONDS * POLLS_A_SECOND
SLEEP_SEC = 1 / float(POLLS_A_SECOND)
DEBOUNCE_POLLS_MIN = math.ceil(BUTTON_BOUNCE_SECONDS / float(SLEEP_SEC))
X_ADJ = float(TOUCH_LEVELS) / XRES
Y_ADJ = float(TOUCH_LEVELS) / YRES
DETECT_OFF_CYCLES = DETECT_OFF_SECONDS / POLLS_A_SECOND
SOCKET_MAX_LOOPS = RESET_STICK_MODE_SECONDS * POLLS_A_SECOND

if XY_REVERSED:
    X_ADDR, Y_ADDR = Y_ADDR, X_ADDR

if DEBUG:
    print SHUTDOWN_MAX, SLEEP_SEC, DEBOUNCE_POLLS_MIN


def read_touch_screen(channel):
    """Read the HackPack touchscreen coordinates."""
    spi = SpiDev()
    spi.open(1, 0)
    spi.no_cs = True
    spi.max_speed_hz = 2000000

    # Manual chip select
    GPIO.output(CS_TOUCH, 1)
    GPIO.output(CS_TOUCH, 0)
    responseData = spi.xfer([channel, 0, 0])
    GPIO.output(CS_TOUCH, 1)
    spi.close()
    return (responseData[1] << 5) | (responseData[2] >> 3)


def print_to_dmesg(message):
    """Add a kernel message."""
    kernel_msg = 'sudo sh -c "echo ' + message + ' > /dev/kmsg"'
    os.system(kernel_msg)


class ADC:
    """Analog joystick attached to a MCP3008 A/D converter."""

    def __init__(
        self,
        bus=1,
        channel=0,
        device=1,
    ):
        """Define which SPI device is the A/D Converter on."""
        self.bus = bus
        self.device = device
        self.channel = channel
        self.spi = SpiDev()

    def open(self):
        """Claim the SPI channel when asked."""
        self.spi.open(self.bus, self.device)
        self.spi.max_speed_hz = 1000000
        self.spi.mode = 0b00

    def read(self):
        """Ask the device for a reading on a channel."""
        adc = self.spi.xfer2([1, (8 + self.channel) << 4, 0])
        data = ((adc[1] & 3) << 8) + adc[2]
        return data

    def close_spi(self):
        """Close the SPI channel when asked."""
        self.spi.close()

    def __enter__(self):
        """Magic function if you use 'with'."""
        self.open()
        return self

    def __exit__(self, type, value, traceback):
        """Magic function if you use 'with'."""
        self.close_spi()

ch0 = ADC(bus=1, channel=0, device=1)
ch1 = ADC(bus=1, channel=1, device=1)
ch7 = ADC(bus=1, channel=7, device=1)
virtual_mouse = virtual_keyboard = virtual_touchscreen = None


def handle_signal(sig, frame):
    """Deal with signals during Signal."""
    ch0.close_spi()
    ch1.close_spi()
    ch7.close_spi()
    SpiDev().close()
    SOCK.close()
    os.remove(SOCKET_PATH)
    virtual_mouse.__exit__()
    virtual_touchscreen.__exit__()
    virtual_keyboard.__exit__()
    print ("Input driver killed. Restart to handle HackPack.")
    sys.exit(-sig)


class ButtonState:
    """Static variables and a method to switch between button modes."""

    # Joystick has 2 modes:
    #   True - Act like joystick/mouse
    #   False - Act like arrow keys
    JOYSTICK_MODE = True

    # Debounce in software, it's cheaper!
    start_pressed = False
    select_pressed = False
    start_counter = 0
    select_counter = 0
    a_counter = 0
    b_counter = 0
    x_counter = 0
    y_counter = 0
    ts_counter = 0
    shutdown_counter = 0
    escape_counter = 0

    # Fake keys while in joystick mode
    up_arrow_pressed = False
    down_arrow_pressed = False
    left_arrow_pressed = False
    right_arrow_pressed = False
    enter_pressed = False
    space_pressed = False
    enter_counter = 0
    space_counter = 0

    # socket counter, for switch back
    socket_counter = 0

    @classmethod
    def switch_to_joystick_mode(cls):
        """Cleanup from arrow mode."""
        if cls.up_arrow_pressed:
            virtual_keyboard.emit(uinput.KEY_UP, 0)
            if DEBUG:
                print("Released Up Arrow.")

        if cls.down_arrow_pressed:
            virtual_keyboard.emit(uinput.KEY_DOWN, 0)
            if DEBUG:
                print("Released Down Arrow.")

        if cls.left_arrow_pressed:
            virtual_keyboard.emit(uinput.KEY_LEFT, 0)
            if DEBUG:
                print("Released Left Arrow.")

        if cls.right_arrow_pressed:
            virtual_keyboard.emit(uinput.KEY_RIGHT, 0)
            if DEBUG:
                print("Released Right Arrow.")

        if cls.enter_pressed:
            virtual_keyboard.emit(uinput.KEY_ENTER, 0)
            if DEBUG:
                print("Released Enter Key.")

        if cls.space_pressed:
            virtual_keyboard.emit(uinput.KEY_SPACE, 0)
            if DEBUG:
                print("Released Space Key.")

        cls.up_arrow_pressed = False
        cls.down_arrow_pressed = False
        cls.left_arrow_pressed = False
        cls.right_arrow_pressed = False
        cls.enter_pressed = False
        cls.space_pressed = False
        cls.enter_counter = 0
        cls.space_counter = 0
        cls.socket_counter = 0
        cls.JOYSTICK_MODE = True

        if DEBUG:
            print "Switching to JOYSTICK mode"

    @classmethod
    def switch_to_arrow_mode(cls):
        """Cleanup from joystick mode."""
        if cls.start_pressed:
            virtual_mouse.emit(uinput.BTN_LEFT, 0)
            if DEBUG:
                print("Released L Mouse (Start) Button.")

        if cls.select_pressed:
            virtual_mouse.emit(uinput.BTN_RIGHT, 0)
            if DEBUG:
                print("Released R Mouse (Select) Button.")

        cls.start_pressed = False
        cls.select_pressed = False
        cls.start_counter = 0
        cls.select_counter = 0
        cls.socket_counter = SOCKET_MAX_LOOPS

        cls.JOYSTICK_MODE = False
        if DEBUG:
            print "Switching to ARROW mode"


def main():
    """Typical polling loop."""
    global JOYSTICK_MODE, JOYSTICK_ON, TOUCH_ON, BUTTONS_ON
    global virtual_keyboard, virtual_mouse, virtual_touchscreen
    global ts, up_down, left_right

    GPIO.setmode(GPIO.BCM)
    GPIO.setwarnings(False)

    # Mouse/Joystick
    virtual_mouse = uinput.Device((
        uinput.REL_X,
        uinput.REL_Y,
        uinput.BTN_LEFT,
        uinput.BTN_RIGHT,
    ))

    # Touchscreen
    virtual_touchscreen = uinput.Device((
        uinput.BTN_TOUCH,
        uinput.ABS_MT_PRESSURE + (0, 255, 0, 0),
        uinput.ABS_X + (TOUCH_VOLTAGE_X[0], TOUCH_VOLTAGE_X[1], 0, 0),
        uinput.ABS_Y + (TOUCH_VOLTAGE_Y[0], TOUCH_VOLTAGE_Y[1], 0, 0),
    ))

    # Keyboard
    virtual_keyboard = uinput.Device((
        uinput.KEY_X,
        uinput.KEY_Y,
        uinput.KEY_A,
        uinput.KEY_B,
        uinput.KEY_ESC,
        uinput.KEY_UP,
        uinput.KEY_DOWN,
        uinput.KEY_LEFT,
        uinput.KEY_RIGHT,
        uinput.KEY_SPACE,
        uinput.KEY_ENTER,
    ))

    # Joystick
    ch0.open()
    ch1.open()

    # Touch
    ch7.open()

    # If we're killed release SPI
    signal.signal(signal.SIGTERM, handle_signal)

    # Touchscreen SPI Select
    GPIO.setup(CS_TOUCH, GPIO.OUT)
    GPIO.output(CS_TOUCH, 1)

    # Shutdown switch
    # RPiF, why did you give pin 5 SCL? Need it to start. DON'T need a pullup,
    # there is a 1.8k PUP physically connected. Fine, 330R added...
    # A short hit we'll call an escape.
    GPIO.setup(POWER_BUTTON, GPIO.IN)

    # Buttons which need pull-downs
    GPIO.setup(START_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(SELECT_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(A_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(B_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(X_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
    GPIO.setup(Y_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    print_to_dmesg("Input driver started")

    # Open a non-blocking socket to allow mode change
    if os.path.exists(SOCKET_PATH):
        os.remove(SOCKET_PATH)

    SOCK.bind(SOCKET_PATH)
    os.chmod(SOCKET_PATH, 0777)
    fcntl.fcntl(SOCK, fcntl.F_SETFL, os.O_NONBLOCK)

    # Big loop incoming.
    while(1):
        # Check the socket for one byte, throws error if none
        try:
            sock_recv = SOCK.recv(1)
            print("RECEIVED BYTE: " + sock_recv)

            if sock_recv == "0":
                ButtonState.switch_to_arrow_mode()
            elif sock_recv == "1":
                ButtonState.switch_to_joystick_mode()
        except socket.error:
            pass

        # Shutdown Button Check (Doubles as Escape)
        # (This one is a pull-down, invert logic)
        if not GPIO.input(POWER_BUTTON):
            if (ButtonState.escape_counter == DEBOUNCE_POLLS_MIN):
                if DEBUG:
                    print("Pressed Escape (Power) Button.")
                virtual_keyboard.emit(uinput.KEY_ESC, 1)
                ButtonState.escape_counter += 1
            elif (ButtonState.escape_counter < DEBOUNCE_POLLS_MIN):
                ButtonState.escape_counter += 1
            ButtonState.shutdown_counter += 1
            if ButtonState.shutdown_counter >= SHUTDOWN_MAX:
                os.system("wall HackPack v4 is Leaving the Building.")
                os.system("sudo shutdown -h 0")
        else:
            if (ButtonState.escape_counter >= DEBOUNCE_POLLS_MIN):
                virtual_keyboard.emit(uinput.KEY_ESC, 0)
                if DEBUG:
                    print("Released Escape (Power) Button.")
            ButtonState.escape_counter = 0
            ButtonState.shutdown_counter = 0

        # Poll Buttons for Clicks
        if (BUTTONS_ON):

            if ButtonState.JOYSTICK_MODE:
                # Start Button/Left Mouse
                if GPIO.input(START_BUTTON):
                    if (ButtonState.start_counter == DEBOUNCE_POLLS_MIN):
                        if DEBUG:
                            print("Pressed L Mouse (Start) Button.")
                        virtual_mouse.emit(uinput.BTN_LEFT, 1)
                        ButtonState.start_pressed = True
                        ButtonState.start_counter += 1
                    elif (ButtonState.start_counter < DEBOUNCE_POLLS_MIN):
                        ButtonState.start_counter += 1
                else:
                    if (ButtonState.start_counter >= DEBOUNCE_POLLS_MIN):
                        virtual_mouse.emit(uinput.BTN_LEFT, 0)
                        ButtonState.start_pressed = False
                        if DEBUG:
                            print("Released L Mouse (Start) Button.")
                    ButtonState.start_counter = 0

                # Select Button/Right Mouse
                if GPIO.input(SELECT_BUTTON):
                    if (ButtonState.select_counter == DEBOUNCE_POLLS_MIN):
                        if DEBUG:
                            print("Pressed R Mouse (Select) Button.")
                        virtual_mouse.emit(uinput.BTN_RIGHT, 1)
                        ButtonState.select_pressed = True
                        ButtonState.select_counter += 1
                    elif (ButtonState.select_counter < DEBOUNCE_POLLS_MIN):
                        ButtonState.select_counter += 1
                else:
                    if (ButtonState.select_counter >= DEBOUNCE_POLLS_MIN):
                        virtual_mouse.emit(uinput.BTN_RIGHT, 0)
                        ButtonState.select_pressed = False
                        if DEBUG:
                            print("Released R Mouse (Select) Button.")
                    ButtonState.select_counter = 0
            else:
                # Select Button/Space
                if GPIO.input(SELECT_BUTTON):
                    if (ButtonState.space_counter == DEBOUNCE_POLLS_MIN):
                        if DEBUG:
                            print("Pressed Space (Select) Button.")
                        virtual_keyboard.emit(uinput.KEY_SPACE, 1)
                        ButtonState.space_pressed = True
                        ButtonState.space_counter += 1
                    elif (ButtonState.space_counter < DEBOUNCE_POLLS_MIN):
                        ButtonState.space_counter += 1
                else:
                    if (ButtonState.space_counter >= DEBOUNCE_POLLS_MIN):
                        virtual_keyboard.emit(uinput.KEY_SPACE, 0)
                        ButtonState.space_pressed = False
                        if DEBUG:
                            print("Released Space (Select) Button.")
                    ButtonState.space_counter = 0

                # Start Button/Enter
                if GPIO.input(START_BUTTON):
                    if (ButtonState.enter_counter == DEBOUNCE_POLLS_MIN):
                        if DEBUG:
                            print("Pressed Enter (Start) Button.")
                        virtual_keyboard.emit(uinput.KEY_ENTER, 1)
                        ButtonState.enter_pressed = True
                        ButtonState.enter_counter += 1
                    elif (ButtonState.enter_counter < DEBOUNCE_POLLS_MIN):
                        ButtonState.enter_counter += 1
                else:
                    if (ButtonState.enter_counter >= DEBOUNCE_POLLS_MIN):
                        virtual_keyboard.emit(uinput.KEY_ENTER, 0)
                        ButtonState.enter_pressed = False
                        if DEBUG:
                            print("Released Enter (Start) Button.")
                    ButtonState.enter_counter = 0

            # A Button
            if GPIO.input(A_BUTTON):
                if (ButtonState.a_counter == DEBOUNCE_POLLS_MIN):
                    if DEBUG:
                        print("Pressed A Button.")
                    virtual_keyboard.emit(uinput.KEY_A, 1)
                    ButtonState.a_counter += 1
                elif (ButtonState.a_counter < DEBOUNCE_POLLS_MIN):
                    ButtonState.a_counter += 1
            else:
                if (ButtonState.a_counter >= DEBOUNCE_POLLS_MIN):
                    virtual_keyboard.emit(uinput.KEY_A, 0)
                    if DEBUG:
                        print("Released A Button.")
                ButtonState.a_counter = 0

            # B Button
            if GPIO.input(B_BUTTON):
                if (ButtonState.b_counter == DEBOUNCE_POLLS_MIN):
                    if DEBUG:
                        print("Pressed B Button.")
                    virtual_keyboard.emit(uinput.KEY_B, 1)
                    ButtonState.b_counter += 1
                elif (ButtonState.b_counter < DEBOUNCE_POLLS_MIN):
                    ButtonState.b_counter += 1
            else:
                if (ButtonState.b_counter >= DEBOUNCE_POLLS_MIN):
                    virtual_keyboard.emit(uinput.KEY_B, 0)
                    if DEBUG:
                        print("Released B Button.")
                ButtonState.b_counter = 0

            # X Button
            if GPIO.input(X_BUTTON):
                if (ButtonState.x_counter == DEBOUNCE_POLLS_MIN):
                    if DEBUG:
                        print("Pressed X Button.")
                    virtual_keyboard.emit(uinput.KEY_X, 1)
                    ButtonState.x_counter += 1
                elif (ButtonState.x_counter < DEBOUNCE_POLLS_MIN):
                    ButtonState.x_counter += 1
            else:
                if (ButtonState.x_counter >= DEBOUNCE_POLLS_MIN):
                    virtual_keyboard.emit(uinput.KEY_X, 0)
                    if DEBUG:
                        print("Released X Button.")
                ButtonState.x_counter = 0

            # Y Button
            if GPIO.input(Y_BUTTON):
                if (ButtonState.y_counter == DEBOUNCE_POLLS_MIN):
                    if DEBUG:
                        print("Pressed Y Button.")
                    virtual_keyboard.emit(uinput.KEY_Y, 1)
                    ButtonState.y_counter += 1
                elif (ButtonState.y_counter < DEBOUNCE_POLLS_MIN):
                    ButtonState.y_counter += 1
            else:
                if (ButtonState.y_counter >= DEBOUNCE_POLLS_MIN):
                    virtual_keyboard.emit(uinput.KEY_Y, 0)
                    if DEBUG:
                        print("Released Y Button.")
                ButtonState.y_counter = 0

        # Poll Joystick for Updates in Joystick Mode, use arrow keys
        if (JOYSTICK_ON and ButtonState.JOYSTICK_MODE):
            # Disable for broken joystick
            if (up_down == -1 and left_right == 0 and
                    ch0.read() < 70 and ch1.read() < 70):
                JOYSTICK_ON = False
                print_to_dmesg("Joystick disabled.")

            up_down = ch0.read()
            left_right = ch1.read()

            try:
                # Joystick Threshold math... guaranteed even.
                T_LEN_PER_SIDE_Y = len(JOYSTICK_THRESHOLDS_Y) / 2
                T_LEN_PER_SIDE_X = len(JOYSTICK_THRESHOLDS_X) / 2

                # Check the up_down channels from the bottom
                i = 0
                while i < T_LEN_PER_SIDE_Y:
                    if up_down < JOYSTICK_THRESHOLDS_Y[i]:
                        virtual_mouse.emit(
                            uinput.REL_Y, -1 * JOYSTICK_MOVEMENT_Y[i]
                        )
                    i += 1

                # Check the up_down channels from the top
                i = 0
                while i < T_LEN_PER_SIDE_Y:
                    if up_down > JOYSTICK_THRESHOLDS_Y[
                        len(JOYSTICK_THRESHOLDS_Y) - 1 - i
                    ]:
                        virtual_mouse.emit(
                            uinput.REL_Y,
                            JOYSTICK_MOVEMENT_Y[i]
                        )
                    i += 1

                # Check the left_right channel from the right (invert)
                i = 0
                while i < T_LEN_PER_SIDE_X:
                    if left_right < JOYSTICK_THRESHOLDS_X[i]:
                        virtual_mouse.emit(
                            uinput.REL_X,
                            JOYSTICK_MOVEMENT_X[i]
                        )
                    i += 1

                # Check the left_right channel from the left (invert)
                i = 0
                while i < T_LEN_PER_SIDE_X:
                    if left_right > JOYSTICK_THRESHOLDS_X[
                        len(JOYSTICK_THRESHOLDS_X) - 1 - i
                    ]:
                        virtual_mouse.emit(
                            uinput.REL_X, -1 * JOYSTICK_MOVEMENT_X[i]
                        )
                    i += 1

            except:
                # Something went wrong with the joystick math
                pass

        # Poll Joystick for Updates in ARROW mode
        if (JOYSTICK_ON and not ButtonState.JOYSTICK_MODE):
            # Disable for broken joystick
            if (up_down == -1 and left_right == 0 and
                    ch0.read() < 70 and ch1.read() < 70):
                JOYSTICK_ON = False
                print_to_dmesg("Joystick disabled.")

            # Normal joystick
            up_down = ch0.read()
            left_right = ch1.read()

            try:

                # Check the up_down channels from the bottom
                if up_down > ARROW_THRESHOLD_Y_HIGH:
                    if not ButtonState.down_arrow_pressed:
                        ButtonState.down_arrow_pressed = True
                        virtual_keyboard.emit(uinput.KEY_DOWN, 1)
                        if DEBUG:
                            print("Arrow down PRESS: ", up_down)
                else:
                    if ButtonState.down_arrow_pressed:
                        ButtonState.down_arrow_pressed = False
                        virtual_keyboard.emit(uinput.KEY_DOWN, 0)
                        if DEBUG:
                            print("Arrow down RELEASE: ", up_down)

                # Check the up_down channels from the top
                if up_down < ARROW_THRESHOLD_Y_LOW:
                    if not ButtonState.up_arrow_pressed:
                        ButtonState.up_arrow_pressed = True
                        virtual_keyboard.emit(uinput.KEY_UP, 1)
                        if DEBUG:
                            print("Arrow up PRESS: ", up_down)
                else:
                    if ButtonState.up_arrow_pressed:
                        ButtonState.up_arrow_pressed = False
                        virtual_keyboard.emit(uinput.KEY_UP, 0)
                        if DEBUG:
                            print("Arrow up RELEASE: ", up_down)

                # Check the up_down channels from the right (invert)
                if left_right < ARROW_THRESHOLD_X_LOW:
                    if not ButtonState.right_arrow_pressed:
                        ButtonState.right_arrow_pressed = True
                        virtual_keyboard.emit(uinput.KEY_RIGHT, 1)
                        if DEBUG:
                            print("Arrow right PRESS: ", left_right)
                else:
                    if ButtonState.right_arrow_pressed:
                        ButtonState.right_arrow_pressed = False
                        virtual_keyboard.emit(uinput.KEY_RIGHT, 0)
                        if DEBUG:
                            print("Arrow right RELEASE: ", left_right)

                # Check the up_down channels from the right (invert)
                if left_right > ARROW_THRESHOLD_X_HIGH:
                    if not ButtonState.left_arrow_pressed:
                        ButtonState.left_arrow_pressed = True
                        virtual_keyboard.emit(uinput.KEY_LEFT, 1)
                        if DEBUG:
                            print("Arrow left PRESS: ", left_right)
                else:
                    if ButtonState.left_arrow_pressed:
                        ButtonState.left_arrow_pressed = False
                        virtual_keyboard.emit(uinput.KEY_LEFT, 0)
                        if DEBUG:
                            print("Arrow left RELEASE: ", left_right)

                if ButtonState.socket_counter > 0:
                    ButtonState.socket_counter -= 1
                else:
                    ButtonState.switch_to_joystick_mode()

            except:
                # Something went wrong with the joystick math
                pass

        # Poll Touch for Updates
        if (TOUCH_ON):
            # Disable TS if not found OR a person is holding it down
            # when we startup
            if (ts == -1 and ch7.read() < 100):
                ButtonState.ts_counter += 1
                if ButtonState.ts_counter >= DETECT_OFF_CYCLES:
                    TOUCH_ON = False
                    print_to_dmesg("Touchscreen disabled.")
                continue

            # Normal TS Read
            ts = ch7.read()
            if (ts < 100):

                print("TS is " + str(ts))
                X_ABS = read_touch_screen(X_ADDR)
                Y_ABS = read_touch_screen(Y_ADDR)

                if UPDOWN_INVERTED:
                    Y_ABS = TOUCH_LEVELS - Y_ABS
                if LEFTRIGHT_INVERTED:
                    X_ABS = TOUCH_LEVELS - X_ABS

                X_ABS = max(1, X_ABS)
                Y_ABS = max(1, Y_ABS)
                try:
                    X_POS = int(round(X_ABS / X_ADJ))
                    Y_POS = int(round(Y_ABS / Y_ADJ))
                    if DEBUG:
                        print(X_POS, Y_POS)
                    LAST_X_POS, LAST_Y_POS = X_ABS, Y_ABS

                    # Touch Up
                    if (ButtonState.ts_counter >= DEBOUNCE_POLLS_MIN):
                        if DEBUG:
                            print("Pressed Touchscreen Button.")
                        if (ButtonState.ts_counter == DEBOUNCE_POLLS_MIN):
                            virtual_touchscreen.emit(
                                uinput.BTN_TOUCH,
                                1,
                                syn=False
                            )
                        virtual_touchscreen.emit(
                            uinput.ABS_X,
                            X_ABS,
                            syn=False
                        )
                        virtual_touchscreen.emit(
                            uinput.ABS_Y,
                            Y_ABS,
                            syn=False
                        )
                        virtual_touchscreen.emit(uinput.ABS_MT_PRESSURE, 255)
                        ButtonState.ts_counter += 1

                    elif (ButtonState.ts_counter < DEBOUNCE_POLLS_MIN):
                        ButtonState.ts_counter += 1
                    ButtonState.ts_counter += 1

                except:
                    # Something went wrong with the touchscreen math
                    pass

            else:
                if (ButtonState.ts_counter > 0):
                    # Touch Up
                    ButtonState.ts_counter = 0

                    virtual_touchscreen.emit(uinput.BTN_TOUCH, 0, syn=False)
                    virtual_touchscreen.emit(
                        uinput.ABS_X,
                        LAST_X_POS,
                        syn=False
                    )
                    virtual_touchscreen.emit(
                        uinput.ABS_Y,
                        LAST_Y_POS,
                        syn=False
                    )
                    virtual_touchscreen.emit(uinput.ABS_MT_PRESSURE, 0)

        time.sleep(SLEEP_SEC)

if __name__ == "__main__":
    main()
