import React from 'react';
import io from 'socket.io-client';


import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Typography,
  Stack,
  FormGroup,
  FormControlLabel,
  Switch,
  Skeleton,
} from '@mui/material';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// Csutom
import {
  REACT_APP_WS_IP,
  REACT_APP_WS_PORT,
  REACT_APP_CLIENT_EVENTNAME,
} from '../app/config';
const socket = io(`ws://${REACT_APP_WS_IP}:${REACT_APP_WS_PORT}`)
const iconSize = { height: 30, width: 30 }
const day = {
  brightness: 0.2,
  saturation: 1,
  gamma: 1,
}
const night = {
  brightness: 0.3,
  saturation: 1,
  gamma: 1.1,
}
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
options.timeZone = 'UTC';
options.timeZoneName = 'short';

const VideoCard = props => {
  // console.log('VideoCard', props)
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastPong, setLastPong] = React.useState(null);
  const [pic, setPic] = React.useState(null);
  const [location, setLocation] = React.useState(null);
  let urlObject;

  const [checked, setChecked] = React.useState(false);
  const [state, setState] = React.useState(checked ? night : day)
  const handleChange = (event) => {
    setChecked(event.target.checked)
    setState(event.target.checked ? night : day)
  };

  const listener = (eventName, data) => {
    //console.log('jpgstream_clientio args', eventName, data)
    const message = data.message
    //console.log('CLIENT_EVENTNAME message.hostname', message.hostname)
    if (eventName === REACT_APP_CLIENT_EVENTNAME && message.hostname === props.name) {
      setLocation(message.location)
      var blob = new Blob([message.picture], { type: "image/jpeg" });
      // const arrayBuffer = message.picture
      if (urlObject) {
        URL.revokeObjectURL(urlObject)
      }
      urlObject = URL.createObjectURL(blob) //new Blob([arrayBuffer]))
      setPic(urlObject)
      setLastPong(new Date().toLocaleString('hu-HU'));
    }

  }

  React.useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {

      setLastPong(new Date().toLocaleString('hu-HU', options)) //.toLocaleDateString('hu-HU', options));
    });

    socket.onAny(listener);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
      socket.offAny(listener)
    };
  }, [isConnected]);

  const sendPing = () => {
    socket.emit('ping');
  }

  return (
    <Card sx={{ maxWidth: '100%' }}>
      <CardMedia
        component="div"
        height={props.height}
      >
        <React.Fragment>
          <Box sx={{ position: 'relative' }}>
            {pic ? <img src={pic} width="100%" height="100%" alt={props.name} /> : <Skeleton variant="rectangular" width={210} height={118} sx={{ bgcolor: 'grey.900' }} />}
            <Typography gutterBottom variant="body2" component="div"
              style={{ position: 'absolute', bottom: 10, right: 10, color: 'white' }}
            >{lastPong}</Typography>
          </Box>

          {/* <Typography gutterBottom variant="body2" component="div" >Connected: {isConnected ? 'true' : 'false'}</Typography>
          <Typography gutterBottom variant="body2" component="div" >Last pong: {lastPong || '-'}</Typography>
          <Button onClick={sendPing}>Send ping</Button> */}
        </React.Fragment>
      </CardMedia>
      <CardContent>
        <Typography gutterBottom variant="subtitle" component="div">{location || 'N/A'}</Typography>
        {checked &&
          <Stack direction="row" spacing={2} sx={{ border: '1px dashed green' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
              <IconButton aria-label="previous">
                <KeyboardArrowUpIcon sx={{ iconSize }} />
              </IconButton>
              <IconButton aria-label="play/pause">
                <KeyboardArrowDownIcon sx={{ iconSize }} />
              </IconButton>
              <IconButton aria-label="next">
                <KeyboardArrowLeftIcon sx={{ iconSize }} />
              </IconButton>
              <IconButton aria-label="next">
                <KeyboardArrowRightIcon sx={{ iconSize }} />
              </IconButton>
            </Box>

            <Box sx={{ padding: '10px' }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch checked={checked} onChange={handleChange} name="Night" />
                  }
                  label="Night"
                />

              </FormGroup>
            </Box>
          </Stack>
        }

      </CardContent>
      {/* <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions> */}
    </Card>
  );
}

export default VideoCard