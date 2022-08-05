// https://stackoverflow.com/a/72560866/3899847
#include "SocketIOclientMod.hpp"

// send text frame followed by binary frame
bool SocketIOclientMod::sendBIN(uint8_t *payload, size_t length, char const* eventName, char const* hostName, bool headerToPayload) //char *hostname,
{

  // text frame content including hostname and placeholder:
  // 451["pic",{"hostname":"ESP32_cam","image":{"placeholder":true,"num":0}}]
  //451-["jpgstream",{"hostname":"ESP32CAM-","picture":{"_placeholder":true,"num":0}}]
  char binaryLeadFrame[128];
  
  strcpy(binaryLeadFrame, "451-[\"");
  strcat(binaryLeadFrame, eventName);
  strcat(binaryLeadFrame, "\",{\"hostname\":\"");
  
  //strcpy(binaryLeadFrame, "451-[\"jpgstream\",{\"hostname\":\"");
  strcat(binaryLeadFrame, hostName);
  strcat(binaryLeadFrame, "\",\"picture\":{\"_placeholder\":true,\"num\":0}}]");

  bool ret = false;
  if (length == 0)
  {
    length = strlen((const char *)payload);
  }
  ret = sendFrame(&_client, WSop_text, (uint8_t *)binaryLeadFrame,
                  strlen((const char *)binaryLeadFrame), true, headerToPayload);

  if (ret)
  {
    ret = sendFrame(&_client, WSop_binary, payload, length, true, headerToPayload);
  }
  return ret;
}
