import {
  EXPECTED_PONG_BACK,
  KEEP_ALIVE_CHECK_INTERVAL,
  nullAddress
} from "../constants/constants.js";
import { startConnection } from "../controllers/websocketController.js";

export const handleTransferEvent = async (from, to, tokenId) => {
  try {
    console.log(
      `New event, from: ${from}, to: ${to}, tokenId: ${tokenId.toString()}`
    );
    const method = from === nullAddress ? "POST" : "PATCH";
    const response = await fetch(`${process.env.BACKEND_APP_URL}/nft`, {
      method: method,
      headers: {
        Authorization: `Bearer ${process.env.API_BEARER_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        tokenOwner: to,
        tokenId: parseInt(tokenId.toString())
      })
    });

    if (!response.ok) {
      throw new Error(`Error calling Backend: ${response.statusText}`);
    }
  } catch (error) {
    console.error(
      `Error in handleTransferEvent for tokenId ${tokenId}:`,
      error
    );
  }
};

export const handleWebSocketEvents = (websocket) => {
  let pingTimeout = null;
  let keepAliveInterval = null;

  websocket.on("open", () => {
    console.log("WebSocket connection successfully established");
    keepAliveInterval = setInterval(() => {
      console.log("Checking if the connection is alive, sending a ping");
      websocket.ping();

      pingTimeout = setTimeout(() => {
        websocket.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);
  });

  websocket.on("close", () => {
    console.error("The websocket connection was closed");
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startConnection();
  });

  websocket.on("pong", () => {
    console.log("Received pong, so connection is alive, clearing the timeout");
    clearTimeout(pingTimeout);
  });

  websocket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
};
