#include <WiFi.h>
#include "esp_camera.h"
#include <ArduinoJson.h>
#include "SocketIOclientMod.hpp"

#define DEBUG_WEBSOCKETS(...)               \
    {                                       \
        DEBUG_ESP_PORT.printf(__VA_ARGS__); \
        DEBUG_ESP_PORT.flush();             \
    }
    
//
// WARNING!!! PSRAM IC required for UXGA resolution and high JPEG quality
//            Ensure ESP32 Wrover Module or other board with PSRAM is selected
//            Partial images will be transmitted if image exceeds buffer size
//

// Select camera model
//#define CAMERA_MODEL_WROVER_KIT // Has PSRAM
//#define CAMERA_MODEL_ESP_EYE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_PSRAM // Has PSRAM
//#define CAMERA_MODEL_M5STACK_V2_PSRAM // M5Camera version B Has PSRAM
//#define CAMERA_MODEL_M5STACK_WIDE // Has PSRAM
//#define CAMERA_MODEL_M5STACK_ESP32CAM // No PSRAM
#define CAMERA_MODEL_AI_THINKER // Has PSRAM
//#define CAMERA_MODEL_TTGO_T_JOURNAL // No PSRAM

#include "camera_pins.h"
#include "config.h"

const char *hostname = HOSTNAME;
const char *ssid = SSID;
const char *password = PASSWORD;
const char *server_host = SERVER_HOST;
const uint16_t server_port = SERVER_PORT;
const char *eventname = SERVER_EVENTNAME;

const char *locationname = "Livingroom2";
char IP_end[4];
char camHostname[50];

IPAddress camIP;
SocketIOclientMod socketIO;

#define USE_SERIAL Serial

void socketIOEvent(socketIOmessageType_t type, uint8_t *payload, size_t length)
{
    switch (type)
    {
    case sIOtype_DISCONNECT:
        Serial.printf("[IOc] Disconnected!\n");
        break;
    case sIOtype_CONNECT:
        Serial.printf("[IOc] Connected to url: %s\n", payload);

        // join default namespace (no auto join in Socket.IO V3)
        socketIO.send(sIOtype_CONNECT, "/");
        break;
    case sIOtype_EVENT:
        Serial.printf("[IOc] get event: %s\n", payload);
        break;
    case sIOtype_ACK:
        Serial.printf("[IOc] get ack: %u\n", length);
        break;
    case sIOtype_ERROR:
        Serial.printf("[IOc] get error: %u\n", length);
        break;
    case sIOtype_BINARY_EVENT:
        Serial.printf("[IOc] get binary: %u\n", length);
        break;
    case sIOtype_BINARY_ACK:
        Serial.printf("[IOc] get binary ack: %u\n", length);
        break;
    }
}

void setupCamera()
{

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;

    config.frame_size = FRAMESIZE_VGA; // FRAMESIZE_ + QVGA|CIF|VGA|SVGA|XGA|SXGA|UXGA
    config.jpeg_quality = 10;
    config.fb_count = 1;

    // Init Camera
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK)
    {
        Serial.printf("Camera init failed with error 0x%x", err);
        return;
    }
}

void setup()
{
    Serial.begin(115200);

    /* TODO:
     * Set Locationname from config file
     */
    // locationname
    
    /* TODO:
     * Set hostname from config file
     */
    // WiFi.hostname(hostname.c_str());

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi..");
    }

    // Print ESP32 Local IP Address
    camIP = WiFi.localIP();
    Serial.println(camIP);

    // add last ip segment to hostname
    const String tmp = String(camIP[3]);
    strcpy(camHostname, hostname);
    strcpy(IP_end, tmp.c_str());
    //    Serial.println("lastIP:");
    //    Serial.print(tmp);
    strcat(camHostname, "-");
    strcat(camHostname, IP_end);
    //    Serial.println("newHostname:");
    //    Serial.print(camHostname);

    setupCamera();

    // server address, port and URL
    socketIO.begin(server_host, server_port, "/socket.io/?EIO=4");

    // event handler
    socketIO.onEvent(socketIOEvent);
}

unsigned long messageTimestamp = 0;
void loop()
{
    socketIO.loop();
    uint64_t now = millis();

    // can't make it fast. SocketIO keep disconnecting
    if (now - messageTimestamp > 1000)
    {
        messageTimestamp = now;
        camera_fb_t *fb = NULL;
        // Take Picture with Camera
        fb = esp_camera_fb_get();
        if (!fb)
        {
            Serial.println("Camera capture failed");
            return;
        }

        // create JSON message for Socket.IO (event)
        DynamicJsonDocument doc(15000);
        JsonArray array = doc.to<JsonArray>();

        // add event name
        // Hint: socket.on('event_name', ....
        array.add(eventname);

        // add payload (parameters) for the event
        JsonObject param1 = array.createNestedObject();
        param1["hostname"] = camHostname;
        param1["location"] = locationname;
        param1["picture"] = String((char *)fb->buf);

        // JSON to String (serializion)
        String output;
        String output2;
        serializeJson(doc, output);
        output2 = "451-" + output;
//        Serial.println("output2");
//        Serial.println(output2);
        //  Send event
        // socketIO.sendEVENT(output2);

        socketIO.sendBIN(fb->buf, fb->len, eventname, camHostname, locationname); //, (char) camIP[3]);

        Serial.println("Image sent");
        esp_camera_fb_return(fb);
    }
    // delay(2000);
}
