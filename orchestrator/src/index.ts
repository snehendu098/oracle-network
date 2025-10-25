import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { IncomingData } from "./types/Incoming";
import { handleAcceptNode, handleRemove, handleOracleResponse } from "./state";
import { ethers } from "ethers";
import { handleConnection } from "./helpers";

const app = new Hono();

app.get(
  "/ws/:pubKey",
  upgradeWebSocket((c) => {
    const { pubKey } = c.req.param();

    return {
      async onMessage(event, ws) {
        const incomingData: IncomingData = JSON.parse(event.data.toString());

        switch (incomingData.type) {
          case "ACCEPT_CONN":
            handleAcceptNode(ws, pubKey);
            break;

          case "ORACLE_RESPONSE":
            await handleOracleResponse(incomingData.data, pubKey);
            break;

          default:
            break;
        }
      },

      async onClose(_event, ws) {
        handleRemove(ws, pubKey);
      },
    };
  }),
);

// Oracle contract ABI - only including the OracleRequest event
const ORACLE_ABI = [
  "event OracleRequest(uint256 indexed requestId, uint256 agentId, string prompt)",
];

const startEventListner = async () => {
  // Configuration - these should be environment variables in production
  const RPC_URL = process.env.RPC_URL || "http://localhost:8545";
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL || "5000"); // 5 seconds default

  if (!CONTRACT_ADDRESS) {
    console.error("CONTRACT_ADDRESS environment variable is required");
    return;
  }

  try {
    // Connect to the blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ORACLE_ABI, provider);

    console.log(`Starting event listener for contract: ${CONTRACT_ADDRESS}`);
    console.log(`Connected to RPC: ${RPC_URL}`);

    // Get the current block number to start listening from
    let lastProcessedBlock = await provider.getBlockNumber();
    console.log(`Starting from block: ${lastProcessedBlock}`);

    // Polling function to check for new events
    const pollForEvents = async () => {
      try {
        const currentBlock = await provider.getBlockNumber();

        // Query for events between last processed block and current block
        if (currentBlock > lastProcessedBlock) {
          const events = await contract.queryFilter(
            "OracleRequest",
            lastProcessedBlock + 1,
            currentBlock
          );

          // Process each event
          for (const event of events) {
            // Type guard to ensure we have an EventLog with args
            if ('args' in event && event.args) {
              const [requestId, agentId, prompt] = event.args;

              console.log(`New Oracle Request received:`);
              console.log(`  Request ID: ${requestId.toString()}`);
              console.log(`  Agent ID: ${agentId.toString()}`);
              console.log(`  Prompt: ${prompt}`);
              console.log(`  Block: ${event.blockNumber}`);

              // Broadcast to all connected oracle nodes
              await handleConnection(
                requestId.toString(),
                agentId.toString(),
                prompt
              );
            }
          }

          lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        console.error("Error polling for events:", error);
      }
    };

    // Start polling
    setInterval(pollForEvents, POLLING_INTERVAL);

    console.log(`Event listener started successfully (polling every ${POLLING_INTERVAL}ms)`);
  } catch (error) {
    console.error("Failed to start event listener:", error);
  }
};

// Start the event listener when the module loads
startEventListner();

export default app;
