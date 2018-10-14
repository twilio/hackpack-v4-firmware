#!/bin/sh

# Change the input driver to cursor mode (default)
echo "1" | nc -Uu -w0 /dev/hackpack_input_driver