<div align="center">

# 🎮 Hackpack v4 Firmware

*Your retro-gaming companion powered by Raspberry Pi!*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Raspberry%20Pi-brightgreen.svg)](https://www.raspberrypi.com/)
[![OS](https://img.shields.io/badge/OS-Raspberry%20Pi%20OS-blue.svg)](https://www.raspberrypi.com/software/)

<img src="bin/root/opt/splash.png" alt="Hackpack Logo" width="400"/>

</div>

## 🚀 What is Hackpack?

Hackpack v4 is your ultimate retro-gaming companion! Originally distributed at SIGNAL 2018 (Twilio's Developer Conference), it's now been updated to support both Raspberry Pi Zero W and Zero 2W! 

### 🛠️ Hardware Features

- 🖥️ Vibrant Color TFT Screen
- 🕹️ Responsive Joystick
- 🎮 6 Gaming Buttons
- 💡 5-NeoPixel LED Light Bar
- 🧠 Raspberry Pi Zero W/2W Brain

### 🎯 Key Features

- 🌈 Custom Browser Interface
- 🎮 Full Gamepad Support
- 💫 LED Light Control
- 🔄 Auto Hardware Detection
- ⚡ Optimized Performance

## 🔧 Installation

### Step 1: Choose Your Hardware

#### 🔵 Raspberry Pi Zero W
```markdown
✨ Perfect for Classic Gaming
📥 Use 32-bit Raspberry Pi OS
🔗 Download: raspberrypi.com/software
📦 Select: "Raspberry Pi OS with desktop"
```

#### 🔴 Raspberry Pi Zero 2W (Recommended)
```markdown
🚀 Enhanced Performance
📥 Use 64-bit Raspberry Pi OS
🔗 Download: raspberrypi.com/software
📦 Select: "Raspberry Pi OS (64-bit) with desktop"
```

### Step 2: Install the Firmware

1. Clone this repository:
```bash
git clone https://github.com/YourUsername/hackpack-v4-firmware.git /home/pi/firmware
```

2. Run the installer:
```bash
sudo bash /home/pi/firmware/bin/install.sh
```

🎯 The firmware will automatically detect your Pi model and apply the optimal configuration!

## 🎮 Features

### 🖥️ Display
Crisp, responsive display with optimized refresh rates for both Pi models:
- Zero W: Classic mode with perfect compatibility
- Zero 2W: Enhanced mode with improved performance

### 🕹️ Controls
- Precise joystick input
- 6 responsive gaming buttons
- USB keyboard support

### 💡 LED System
- 5 programmable RGB NeoPixels
- Custom animation support
- Interactive light patterns

## 🛠️ Development

### Prerequisites
- Raspberry Pi Zero W or Zero 2W
- Raspberry Pi OS (32/64-bit)
- Basic Linux knowledge

### Building from Source
```bash
# Install development dependencies
sudo apt-get install git python3-pip nodejs npm

# Clone and build
git clone https://github.com/YourUsername/hackpack-v4-firmware.git
cd hackpack-v4-firmware
sudo bash bin/install.sh
```

## 🤝 Contributing

We welcome contributions! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">

### 🎮 Happy Gaming! 🕹️

</div>

### Get the codebase

To get started, clone this repo into `/home/pi/firmware`. The codebase depends on
being installed at /home/pi/firmware currently.

Once cloned locally, run:

`sudo bash /home/pi/firmware/bin/install.sh`

This master install script, in turn, runs the install
scripts for each system component - drivers, and kiosk.

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

## System Control

### Command-Line Interface

`hackpack kiosk start` - starts the kiosk webview
`hackpack kiosk stop` - stops the kiosk webview

`hackpack lights led_scanner` - play the led scanner light pattern
