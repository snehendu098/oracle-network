import { WSContext } from "hono/ws";
import { OutgoingMessage } from "../types/Outgoing";

const WS_CLIENTS: { [key: string]: WSContext<WebSocket> } = {};

export const handleAcceptNode = (ws: WSContext<WebSocket>, pubKey: string) => {
  if (WS_CLIENTS[pubKey]) {
    // check the staked amount
    ws.send(
      JSON.stringify({
        type: "JOIN_FAIL",
        data: {
          timestamp: new Date(),
        },
        success: false,
      } as OutgoingMessage),
    );
    return;
  }

  // check staked amount
  WS_CLIENTS[pubKey] = ws;

  ws.send(
    JSON.stringify({
      type: "JOIN_SUCCESS",
      data: {
        timestamp: new Date(),
      },
      success: true,
    } as OutgoingMessage),
  );
};

export const handleRemove = (ws: WSContext<WebSocket>, pubKey: string) => {
  delete WS_CLIENTS[pubKey];

  ws.send(
    JSON.stringify({
      type: "DISCONNECT",
      data: {
        timestamp: new Date(),
      },
      success: true,
    } as OutgoingMessage),
  );
};
