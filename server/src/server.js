const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const url = require('url');

require('dotenv').config()
const { WS_PORT, SERVER_EVENTNAME, CLIENT_EVENTNAME, SERVER_CAMERALIST, CLIENT_CONNECTED } = process.env
const port = WS_PORT;

// ESP32 sended message
// {
//   "hostname": "ESP32CAM-144",
//   "picture": ArrayBuffer(20629)
// }
let cameraList = []
const cameras = async (eventName, args) => {
  // console.log(`Eventname: ${eventName} ${SERVER_EVENTNAME}`);
  if (eventName === SERVER_EVENTNAME) {
    if (cameraList.indexOf(args.hostname) === -1) {
      cameraList.push(args.hostname);
      console.log('cameraList', cameraList)
      io.emit(SERVER_CAMERALIST, { cameraList })
    }
  }
  // console.log('cameraList2', cameraList)
  // return cameraList
}
// ESP32
// socketIO.sendEVENT(output)
// [IOc] Connected to url: /socket.io/?EIO=4
// ["jpgstream_serverio",{"hostname":"ESP32CAM-142","location":"Livingroom","picture":"⸮⸮⸮⸮"}]

const listener = async (eventName, args) => {
  // console.log(`Eventname: ${eventName}`);
  // console.log(`Args: ${args.hostname}`);
  if (typeof eventName === 'undefined') return
  await cameras(eventName, args)
  if (eventName !== CLIENT_CONNECTED) io.emit(args.hostname, { message: args.message })
  if (eventName === CLIENT_CONNECTED) io.emit(SERVER_CAMERALIST, { cameraList })
}

io.on('connection', (socket) => {

  // var socketId = socket.id;
  // var clientIp = socket.request.connection.remoteAddress;
  // console.info('[' + socketId + '] new connection', clientIp);
  //console.info(socket.handshake);
  //console.info(socket.request.connection.eventname);


  socket.onAny(listener);
  // socket.onAnyOutgoing((event, ...args) => {
  //   console.log(`got ${event}`);
  // });
  socket.on(SERVER_EVENTNAME, async (message) => {
    //console.log("image received", message)

    io.emit(CLIENT_EVENTNAME, { message, ip: socket.request.connection.remoteAddress })
    //io.emit(message.hostname, { message, ip: socket.request.connection.remoteAddress })
  });

  socket.on('reconnect', () => {
    //console.log(`ReConnected client id ${socket.id}`)
  })

  socket.on('disconnect', (reason) => {
    //console.log(`DisConnected client id ${socket.id} and reeason is: ${reason}`)
  })
})

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'view/server.html'))
})
app.get('/config.js', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'view/config.js'))
})

server.listen(port, () => {
  // console.log(`App listening at http://localhost:${port}`)
})



/* import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Server } from "socket.io"

// custom

const { WS_PORT, HTTP_PORT, CLIENT_CORS_URL } = process.env

const app = express()
app.use(cors())
let connectedClients = []

const io = new Server(WS_PORT,
  // {
  //   handlePreflightRequest: (req, res) => {
  //     const headers = {
  //       "Access-Control-Allow-Headers": "Content-Type, Authorization",
  //       "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
  //       "Access-Control-Allow-Credentials": true
  //     };
  //     res.writeHead(200, headers);
  //     res.end();
  //   }
  // }
  {
    cors: {
      origin: '*', //CLIENT_CORS_URL,
      methods: ["GET", "POST"],
      // allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  }
)


io.on('connection', (socket) => {

  const listener = (eventName, ...args) => {
    console.log(eventName, args);
  }

  socket.onAny(listener);

  console.log(`Connecté au client ${socket.id}`)

  socket.on('jpgstream_serverio', function (msg) {
    console.log("image received")
    io.emit('jpgstream_clientio', msg.pic)
  });
})


// preview page
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, './server.html'))
})

app.listen(HTTP_PORT, (req, res) => {
  if (process.env.NODE_ENV !== 'production') console.log(`HTTP server is avaliable at port ${HTTP_PORT}`)
}) */