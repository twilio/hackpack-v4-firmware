# 🌟 Hackpack v4 Python Development Toolkit

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Python Version](https://img.shields.io/badge/python-3.9%2B-blue)

## What is Hackpack?

Hackpack v4 is a limited-run hardware device distributed at SIGNAL 2018 - Twilio's Customer & Developer conference. Hackpack is your 8-bit companion through the conference, letting you interact with the environment, build an avatar, level up, and earn coins.

### But Technically What is it?

At its heart, Hackpack v4 is a **Raspberry Pi Zero W** equipped with:
- A color TFT screen
- A joystick
- Six game buttons
- A 5-NeoPixel LED bar

It boots into a custom browser view that gives any website it loads access to the joystick, game buttons, and control of the lights on the LED bar.

### Overview

The Hackpack v4 Python Development Toolkit provides a comprehensive setup for various Python development tasks, including:
- Web Development
- Security Tools
- Data Manipulation
- Networking
- Automation

## 📦 Installation

### Boot up a Raspberry Pi with Raspbian

To get started, you'll need to set up a standard Raspberry Pi with the current Raspbian image. Hackpack v4 requires Raspbian rather than Raspbian Lite, due to depending on the Raspbian desktop window manager for its 8-bit glory.

You can get the image files at the Raspberry Pi foundation's website:

👉 [Raspberry Pi Downloads](https://www.raspberrypi.org/downloads/raspbian/)

### Get the Codebase

To get started, clone this repo into `/home/pi/firmware`:

```bash
git clone https://github.com/Anon23261/hackpack-v4-firmware.git /home/pi/firmware
```

Once cloned locally, run the following command to install:

```bash
sudo bash /home/pi/firmware/bin/install.sh
```

This master install script runs the install scripts for each system component.

## ⚙️ Functionality

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

### Web Development
- **Flask**: Set up a basic web application.

### Security Tools
- **Scapy**: Create network packet manipulation tools.

### Data Manipulation
- **Pandas**: Analyze data efficiently.

### Networking
- Create simple TCP clients and servers.

### Automation
- Automate file operations and tasks.

## 🚀 New Features

### OTG USB Support

- The firmware now supports OTG USB connections for mouse and keyboard input, allowing for enhanced interaction with the Hackpack v4.

### Raspberry Pi Model Detection

- The firmware can automatically detect whether the device is a Raspberry Pi Zero W (32-bit) or Zero 2W (64-bit), ensuring optimal functionality based on the hardware model.

## System Control

### Command-Line Interface

`hackpack lights led_scanner` - play the led scanner light pattern

---

Feel free to contribute to this project or report any issues you encounter!
