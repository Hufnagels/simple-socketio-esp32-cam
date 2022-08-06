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

Simple node.js responded html file

### Server
Node.js server with socket.io

## TODO
- Client rewrite into React. 
- Server side send to connected clients the camera id-s (ESP32CAM- < IP >)
- Sketch:
- - config page in AP mode (save config to sd)
- - - add name (like: Livingroom)