#!/bin/sh

# Change the input driver to keyboard mode (21s default timeout)
echo "0" | nc -Uu -w0 /dev/hackpack_input_driver