# Hackpack v4 Firmware

## What is a Hackpack?

Hackpack v4 is a limited-run hardware device distributed at SIGNAL 2018 - Twilio's Customer & Developer conference. Hackpack is your 8-bit companion through the conference, letting you interact with the environment, build an avatar, level up and earn coins.

### But Technically What is it?

At it's heart, Hackpack v4 is a Raspberry Pi Zero W equipped with a color TFT screen, a joystick, six game buttons, and a 5-NeoPixel LED bar. It boots into a custom browser view that gives any website it loads access to the joystick, game buttons, and control of the lights on the LED bar.

### Firmware

Hackpack v4 Firmware manages system-level components for the Hackpack v4 hardware drivers that manage the
onboard screen, LEDs, and gamepad.

## Installation

### Boot up a Raspberry Pi with Raspbian

To get started, you'll need to set up a standard Raspberry Pi with the current Raspian image. Hackpack v4 requires Raspbian rather than Raspian Lite, due to depending on the Raspbian desktop window manager for its 8-bit glory.

You can get the image files at the Raspberry Pi foundation's website:

https://www.raspberrypi.org/downloads/raspbian/

### Get the codebase

To get started, clone this repo into `/home/pi/firmware`. The codebase depends on
being installed at /home/pi/firmware currently.

Once cloned locally, run:

`sudo bash /home/pi/firmware/bin/install.sh`

This master install script, in turn, runs the install
scripts for each system component - drivers, kiosk,
and comms.

## Functionality

### Hardware

#### Onboard Screen

Your Hackpack v4 is equipped with a capacitive-touch
screen, which duplicates the video output that can also be displayed normally via the HDMI output of the
Raspberry Pi.

#### Onboard LEDs

What Hackpack would be complete without NeoPixels? Your
Hackpack v4 sports 5 RGB NeoPixels, with a custom-built
unix socket that lets you control light patterns from


####  Onboard Gamepad

The `/drivers` directory contains all functionality
that drives the custom inputs on the device - namely
the joystick and control buttons.


### Communications Pipeline

tbd

## System Control

### Command-Line Interface

`hackpack kiosk start` - starts the kiosk webview
`hackpack kiosk stop` - stops the kiosk webview

`hackpack lights led_scanner` - play the led scanner light pattern
