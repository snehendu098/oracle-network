import { OracleRequestData, OutgoingMessage } from "../types/Outgoing";
import { getWsClients } from "../state";

export const handleConnection = async (requestId: string, agentId: string, prompt: string) => {
  const clients = getWsClients();

  const message: OutgoingMessage = {
    type: "ORACLE_REQUEST",
    data: {
      requestId,
      agentId,
      prompt,
      timestamp: new Date(),
    },
    success: true,
  };

  // Broadcast to all connected oracle nodes
  Object.values(clients).forEach((ws) => {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Failed to send message to oracle node:`, error);
    }
  });
};
