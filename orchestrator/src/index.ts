import { Hono } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { IncomingData } from "./types/Incoming";
import { handleAcceptNode, handleRemove } from "./state";

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

const startEventListner = () => {};

export default app;
