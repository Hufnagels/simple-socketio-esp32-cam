# ESP32-CAM, socket.io, node.js -- CameraWebServer3

## 2022.08.

This project based on 
- [Links2004-arduinoWebSockets -- WebSocketClientSocketIOack](https://github.com/Links2004/arduinoWebSockets/blob/master/examples/esp32/WebSocketClientSocketIOack/WebSocketClientSocketIOack.ino)


## Main goal

Create simple Survillance system with multiple ESP32-CAM modules. Some other great projects, like [Easytarget Camera Webserver](https://travis-ci.com/github/easytarget/esp32-cam-webserver) are very usefull, but I neede some extra functionality like:
- more camera
- React on client side
- etc

### CameraWebServer

Arduino sketch with the following features:
- custom hostname
- IP last segment as hostname extension --> used on server and client side

Not connecting to node server via 
```sh
socketIO.sendEVENT(output)
```

### Client
Simple node.js responded html file

### Server
Node.js server with socket.io

## TODO
- Client rewrite into React. 
- Server side 
  - send to connected clients the camera id-s (ESP32CAM- < IP >)
  - Authentication
- Sketch:
  - config page in AP mode 
    - save config to sd)
    - add name (like: Livingroom)
  - MQTT optional send connected cam name and ip address
  - Authentication