#include <stdio.h>
#include <unistd.h>
#include <stdbool.h>
#include <sys/socket.h>
#include <sys/stat.h>
#include <sys/un.h>
#include <stdlib.h>
#include <stdint.h>
#include <signal.h>
#include <time.h>
#include "clk.h"
#include "gpio.h"
#include "dma.h"
#include "pwm.h"
#include "version.h"
#include "ws2811.h"

/* Macros and defines */
#define ARRAY_SIZE(item)       (sizeof(item) / sizeof(item[0]))
#define max(x, y) (((x) > (y)) ? (x) : (y))
#define min(x, y) (((x) < (y)) ? (x) : (y))

#define LED_COUNT               5                               // HackPack v4 has 5 LEDs
#define TARGET_FREQ             WS2811_TARGET_FREQ              // 800 kHz
#define GPIO_PIN                18                              // GPIO18 = Physical Pin 12
#define DMA                     10                              // DMA Channel
#define STRIP_TYPE              WS2811_STRIP_GRB                // WS2812/SK6812RGB integrated chip+leds

/* Path to the light UNIX socket watched by this server. */
char socket_path[1024] = "/dev/lightsocket";

/* Set up LED structure for DMA */
ws2811_t ledstring =
{
    .freq = TARGET_FREQ,
    .dmanum = DMA,
    .channel =
    {
        [0] =
        {
            .gpionum = GPIO_PIN,
            .count = LED_COUNT,
            .invert = 0,
            .brightness = 255,
            .strip_type = STRIP_TYPE,
        },
        [1] =
        {
            .gpionum = 0,
            .count = 0,
            .invert = 0,
            .brightness = 0,
        },
    },
};

/* Endless loop and verbose mode. */
static uint8_t running = 1;
static bool verbose_mode = false;

/* One instruction, 5 lights of color and a delay. */
typedef struct light_instruction 
{
        uint32_t led1[3];
        uint32_t led2[3];
        uint32_t led3[3];
        uint32_t led4[3];
        uint32_t led5[3];
        int32_t delay;
        struct light_instruction* next;
} light_t;

/* Pointer to head instruction */
light_t* head;

/* Sleep for x milliseconds. */
void msleep(int pmilliseconds)  
{
        struct timespec ts_sleep = 
        {
                pmilliseconds / 1000,
                (pmilliseconds % 1000) * 1000000L
        };

        nanosleep(&ts_sleep, NULL);
}

/*
 * Add a new instruction to our light list.
 */
void push_instruction(light_t *new_inst)
{
        light_t *current = head;
        if (!current) {
                head = new_inst;
                return;
        }

        while (current->next != NULL) {
                current = current->next;
        }

        current->next = new_inst;
}

/*
 * Clear all light instructions.
 */
void clear_instructions()
{
        light_t* current = head;
        light_t* next;
 
        while (current != NULL) {
                next = current->next;
                free(current);
                current = next;
        }

        head = NULL;
}

/*
 * Print out instructions in current show.
 */
void print_instructions()
{
        light_t *current = head;
        if (!current) {
                return;
        }

        int i = 1;
        while(running) {
                printf("Inst %d || ", i++);
                printf("LED1: %d, %d, %d | ", current->led1[0], current->led1[1], current->led1[2]);
                printf("LED2: %d, %d, %d | ", current->led2[0], current->led2[1], current->led2[2]);
                printf("LED3: %d, %d, %d | ", current->led3[0], current->led3[1], current->led3[2]);
                printf("LED4: %d, %d, %d | ", current->led4[0], current->led4[1], current->led4[2]);
                printf("LED5: %d, %d, %d | ", current->led5[0], current->led5[1], current->led5[2]);
                printf("DELAY: %d\n", current->delay);

                if (current->next) {
                        current = current->next;
                } else {
                        break;
                }
        }
}

/*
 * If we get a signal from Raspbian stop the main loop and clear lights.
 */
static void ctrl_c_handler(int signum)
{
        (void)(signum);
        running = 0;
}

/*
 * In case of signals.
 */
static void setup_handlers(void)
{
        struct sigaction sa = {
                .sa_handler = ctrl_c_handler,
        };

        sigaction(SIGINT, &sa, NULL);
        sigaction(SIGTERM, &sa, NULL);
}

/*
 * Do a light show.
 */
void show_lights()
{
        light_t *current = head;
        if (!current) {
                return;
        }

        while(running) {
                ledstring.channel[0].leds[0] =  current->led1[0] << 16;
                ledstring.channel[0].leds[0] += current->led1[1] << 8;
                ledstring.channel[0].leds[0] += current->led1[2];

                ledstring.channel[0].leds[1] =  current->led2[0] << 16;
                ledstring.channel[0].leds[1] += current->led2[1] << 8;
                ledstring.channel[0].leds[1] += current->led2[2];

                ledstring.channel[0].leds[2] =  current->led3[0] << 16;
                ledstring.channel[0].leds[2] += current->led3[1] << 8;
                ledstring.channel[0].leds[2] += current->led3[2];

                ledstring.channel[0].leds[3] =  current->led4[0] << 16;
                ledstring.channel[0].leds[3] += current->led4[1] << 8;
                ledstring.channel[0].leds[3] += current->led4[2];

                ledstring.channel[0].leds[4] =  current->led5[0] << 16;
                ledstring.channel[0].leds[4] += current->led5[1] << 8;
                ledstring.channel[0].leds[4] += current->led5[2];
                
                if (verbose_mode) {
                        printf("LED1: %ul | ", ledstring.channel[0].leds[0]);
                        printf("LED2: %ul | ", ledstring.channel[0].leds[1]);
                        printf("LED3: %ul | ", ledstring.channel[0].leds[2]);
                        printf("LED4: %ul | ", ledstring.channel[0].leds[3]);
                        printf("LED5: %ul \n", ledstring.channel[0].leds[4]);
                }

                ws2811_return_t ret;
                if ((ret = ws2811_render(&ledstring)) != WS2811_SUCCESS) {
                        fprintf(stderr, "ws2811_render failed: %s\n", ws2811_get_return_t_str(ret));
                        break;
                }
                
                msleep((int)current->delay);

                if (current->next) {
                        current = current->next;
                } else {
                        break;
                }
        }
}

/*
* main opens our socket then runs in a loop forever
* 
* Inputs:
*         - argc, argv: command link input (generally nothing, but can set socket path)
*
* Socket Inputs:
*         NOTE: Pad packets to 100 characters with the last character of padding '|'
*         - SHW: Show current light show
*         - PRT: Print out the currently loaded light show
*         - CLR: Clear the currently loaded light show
*         - R1,G1,B1,R2,G2,B2,R3,G3,B3,R4,G4,B4,R5,G5,B5,DELAY: Add one instruction to the light show
*                                                             : Use UNSIGNED INTEGERS
*                                                             : 
*                                                             : R/G/B: Max 255 (But dimmer if possible)
*                                                             : Delay: Length to stay in milliseconds
* 
* Output:
*         - Return code
*/
int main(int argc, char *argv[]) {
        bool next_path = false;
        struct sockaddr_un addr;
        char buf[100];
        int fd, cl, rc;
        ws2811_return_t ret;

        for (int i = 0; i < argc; ++i) {
                if (strcmp("-v", argv[i]) == 0) {
                        verbose_mode = true;
                } else if (strcmp("-p", argv[i]) == 0) {
                        next_path = true;
                } else if (strcmp("-h", argv[i]) == 0) {
                        printf("Light socket server for HackPackv4.\n");
                        printf("  -v : Verbose Mode\n");
                        printf("  -p <path> : Change path of light socket.\n");
                        printf("            : DEFAULT: /dev/lightsocket\n");
                } else if (next_path) {
                        socket_path[0] = '\0';
                        size_t len = min(1024, strlen(argv[i]));
                        memcpy(socket_path, argv[i], len);
                        socket_path[len] = '\0';
                        next_path = false;
                }

                if (verbose_mode) {
                        printf("Got: %s\n", argv[i]);
                }
        }

        if (verbose_mode) {
                printf("Socket path is: %s\n", socket_path);
        }

        if ( (fd = socket(AF_UNIX, SOCK_STREAM, 0)) == -1) {
                perror("socket error");
                exit(-1);
        }

        /* Unlink socket if it exists then create it. */
        memset(&addr, 0, sizeof(addr));
        addr.sun_family = AF_UNIX;
        if (*socket_path == '\0') {
                *addr.sun_path = '\0';
                strncpy(addr.sun_path+1, socket_path+1, sizeof(addr.sun_path)-2);
        } else {
                strncpy(addr.sun_path, socket_path, sizeof(addr.sun_path)-1);
                unlink(socket_path);
        }

        /* Trap socket errors. */
        if (bind(fd, (struct sockaddr*)&addr, sizeof(addr)) == -1) {
                perror("Couldn't bind socket");
                exit(-1);
        }
        chmod(addr.sun_path, 0777);

        if (listen(fd, 5) == -1) {
                perror("Couldn't listen on socket");
                exit(-1);
        }

        /* Deal with signals then initialize lights. */
        setup_handlers();
        if ((ret = ws2811_init(&ledstring)) != WS2811_SUCCESS) {
                fprintf(stderr, "ws2811_init failed: %s\n", ws2811_get_return_t_str(ret));
                return ret;
        }

        /* Sit and wait on socket connections forever. Parse anything that comes in. */
        while (running) {
                if ( (cl = accept(fd, NULL, NULL)) == -1) {
                        perror("Couldn't accept from socket");
                        continue;
                }

                /* Packet is: R1,G1,B1,R2,G2,B2,R3,G3,B3,R4,G4,B4,R5,G5,B5,DELAY */
                while ( (rc=read(cl,buf,sizeof(buf))) > 0) {
                        int i = 0;
                        unsigned long led_array[16];

                        /* Strip padding */
                        char *command = strtok(buf, "|");
                        command = strtok(NULL, "|");

                        char *token = strtok(command, ",");
                        if (strstr(token,"PRT") != NULL) {
                                print_instructions();
                        } else if (strstr(token,"CLR") != NULL) {
                                clear_instructions();
                        } else if (strstr(token,"SHW") != NULL) {
                                show_lights();
                        } else {
                                do {
                                        led_array[i] = strtoul(token, NULL, 10);
                                        token = strtok(NULL, ",");
                                        ++i;
                                } while (token != NULL);

                                if (verbose_mode) {
                                        printf("%d elements. Read %u bytes: %.*s\n", i, rc, rc, buf);
                                }

                                /* Populate a light instruction if we have the proper number of elements */
                                if (i == 16) {
                                        light_t *instruction = malloc(sizeof(light_t));
                                        instruction->next = NULL;

                                        /* Populate the 5 light arrays */
                                        instruction->led1[0] = (uint32_t)led_array[0];
                                        instruction->led1[1] = (uint32_t)led_array[1];
                                        instruction->led1[2] = (uint32_t)led_array[2];
                                        instruction->led2[0] = (uint32_t)led_array[3];
                                        instruction->led2[1] = (uint32_t)led_array[4];
                                        instruction->led2[2] = (uint32_t)led_array[5];
                                        instruction->led3[0] = (uint32_t)led_array[6];
                                        instruction->led3[1] = (uint32_t)led_array[7];
                                        instruction->led3[2] = (uint32_t)led_array[8];
                                        instruction->led4[0] = (uint32_t)led_array[9];
                                        instruction->led4[1] = (uint32_t)led_array[10];
                                        instruction->led4[2] = (uint32_t)led_array[11];
                                        instruction->led5[0] = (uint32_t)led_array[12];
                                        instruction->led5[1] = (uint32_t)led_array[13];
                                        instruction->led5[2] = (uint32_t)led_array[14];

                                        /* Populate the delay */
                                        instruction->delay = (int32_t)led_array[15];

                                        /* Add it to the list */
                                        push_instruction(instruction);
                                }
                        }     

                        if (rc == -1) {
                                exit(-1);
                        } else if (rc == 0) {
                                close(cl);
                        }
                }
        }

        ledstring.channel[0].leds[0] = 0x00000000;
        ledstring.channel[0].leds[1] = 0x00000000;
        ledstring.channel[0].leds[2] = 0x00000000;
        ledstring.channel[0].leds[3] = 0x00000000;
        ledstring.channel[0].leds[4] = 0x00000000;
        ws2811_render(&ledstring);

        return 0;
}