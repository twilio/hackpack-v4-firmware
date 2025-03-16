obj-m := bcm2835_spi_display.o

CFLAGS_bcm2835_spi_display.o := -O3 -std=gnu99 -Wno-declaration-after-statement -DKERNEL_MODULE -DILI9341=1 -DADAFRUIT_ILI9341_PITFT=1

# Add support for Kali Linux
ifeq ($(shell uname -a | grep -i kali),)
    CFLAGS_bcm2835_spi_display.o += -DKALI_LINUX
endif
