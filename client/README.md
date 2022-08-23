# ESP32-CAM, socket.io, node.js

## 2022.08.

This project based on 
- [ESP32-CAM fastest way to stream video output to nodejs server with socketIO](https://stackoverflow.com/questions/66549640/esp32-cam-fastest-way-to-stream-video-output-to-nodejs-server-with-socketio/72560866#72560866)
- [Inglebard/esp32cam-relay](https://github.com/Inglebard/esp32cam-relay/tree/main/socketIO/esp32camsocketio)
- [timum-viw/socket.io-client](https://github.com/timum-viw/socket.io-client)


## Main goal

Create simple Survillance system with multiple ESP32-CAM modules. Some other great projects, like [Easytarget Camera Webserver](https://travis-ci.com/github/easytarget/esp32-cam-webserver) are very usefull, but I neede some extra functionality like:
- more camera
- React on client side
- etc

### CameraWebServer

Arduino sketch with the following features:
- custom hostname
- IP last segment as hostname extension --> used on server and client side

extended function
```sh
bool sendBIN(uint8_t *payload, size_t length, char const* eventName, char const* hostName, bool headerToPayload = false);
```

### Client
is a React app.

#### Structure
App.js
VideoCard.js

#### Functioning
When client connected to socket server, it emits the following events
```sh
REACT_APP_CONNEECTED_CLIENT
```
and then the server respond to it via the following event:
```sh
SERVER_CAMERALIST
```
and with the following data:
```sh
cameraList [ 'ESP32CAM-142', 'ESP32CAM-144' ]
```
The VideoCard component called with one of the above list item. Then it connects to the
```sh
REACT_APP_CLIENT_EVENTNAME
```
event and get the responded args.

the args are:
```sh
{
    "message": {
        "hostname": "ESP32CAM-144",
        "picture": {} ArrayBuffer
    },
    "ip": "::ffff:192.168.1.144"
}
```

#### TODO:
- Authentication