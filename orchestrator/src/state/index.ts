import { WSContext } from "hono/ws";
import { OutgoingMessage } from "../types/Outgoing";
import { OracleResponseData } from "../types/Incoming";

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

export const getWsClients = () => WS_CLIENTS;

export const handleOracleResponse = async (responseData: OracleResponseData, pubKey: string) => {
  console.log(`Received oracle response from node ${pubKey}:`);
  console.log(`  Request ID: ${responseData.requestId}`);
  console.log(`  Agent ID: ${responseData.agentId}`);
  console.log(`  Response: ${responseData.response}`);
  console.log(`  Timestamp: ${responseData.timestamp}`);

  // TODO: Verify node is authorized and has sufficient stake

  // TODO: Submit response to blockchain contract
  // This will require contract instance with signer
  // Example: await contract.submitResponse(requestId, agentId, response, signature)

  // For now, just log the response
  console.log("Response received successfully (blockchain submission not yet implemented)");
};
