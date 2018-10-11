# HACKPACK V4 FIRMWARE

Manages system-level components for the Hackpack v4 hardware drivers that manage the
onboard screen, LEDs, and gamepad.

## Installation

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
screen

#### Onboard LEDs

tbd


####  Onboard Gamepad

The `/drivers` directory contains all functionality
that drives the custom inputs on the device - namely
the joystick and control buttons.


### Communications Pipeline

tbd
