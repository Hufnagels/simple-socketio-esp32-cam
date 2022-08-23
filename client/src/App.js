import React from 'react'
import io from 'socket.io-client';

// Material
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { alpha, styled } from '@mui/material/styles';

// Custom
import VideoCard from './components/VideoCard'
// import useResizeObserver from '../src/app/hooks/useResizeObserver.hook'
import {
  REACT_APP_WS_IP,
  REACT_APP_WS_PORT,
  REACT_APP_CLIENT_CONNECTED,
  REACT_APP_SERVER_CAMERALIST,
} from './app/config';
const socket = io(`ws://${REACT_APP_WS_IP}:${REACT_APP_WS_PORT}`)

const App = () => {

  const [isConnected, setIsConnected] = React.useState(socket.connected)
  const [cameralist, setCameralist] = React.useState([])

  const videContainerRef = React.useRef(null)
  // const dimensions = useResizeObserver(videContainerRef);
  const [width, setWidth] = React.useState(0)
  const [height, setHeight] = React.useState(70)
  // // const [Videowidth, setVideowidth] = React.useState(0)
  // // const [Videoheight, setVideoeight] = React.useState(70)
  // const ratio = 4 / 3
  const GridParam = 4
  // const GridModifier = 12 / GridParam

  // const resizing = dim => {
  //   // console.log('screen.height', dim.height)
  //   // console.log('screen.width', dim.width)
  //   // let newHeight = dim.width / GridModifier * 1/ratio - 40
  //   // let newWidth = newHeight * ratio
  //   setWidth(dim.width / GridModifier)
  //   setHeight(dim.width / GridModifier / 4 * 3)
  //   // setVideowidth(dim.width / GridModifier)
  //   // setVideoeight(newHeight)
  //   setVisible(true)
  // }

  const listener = (eventName, data) => {
    // console.log('app', eventName, data)
    //console.log('CLIENT_EVENTNAME message.hostname', message.hostname)
    if (eventName === REACT_APP_SERVER_CAMERALIST) {
      setCameralist(data.cameraList)
      console.log('app', eventName, data.cameraList)
    }

  }

  // React.useEffect(() => {
  //   if (!dimensions) return;
  //   resizing(dimensions)
  //   //console.log('REACT_APP_FFMPEG_IP', REACT_APP_FFMPEG_IP, REACT_APP_WS_IP)
  // }, [dimensions])

  React.useEffect(() => {
    socket.on('connect', () => {
      console.log('REACT_APP_CLIENT_CONNECTED', REACT_APP_CLIENT_CONNECTED)
      setIsConnected(true);
      socket.emit(REACT_APP_CLIENT_CONNECTED)
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.onAny(listener);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.offAny(listener)
    };

  }, [])

  return (
    <React.Fragment>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              CAM feeds
            </Typography>
            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
      </Box>
      <Box sx={{ p: 1 }}>
        <Grid sx={{ flexGrow: 1 }} container spacing={1} ref={videContainerRef} >
          {cameralist.map(camera => <Grid item xs={GridParam} key={camera}>
            <VideoCard
              width={width}
              height={height}
              name={camera}
            />
          </Grid>)}
        </Grid>
      </Box>

    </React.Fragment>
  );
}

export default App;
