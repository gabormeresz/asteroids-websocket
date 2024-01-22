import express from "express";
import { createServer } from "http";
import { ethers } from "ethers";
import {
  contractAddress,
  contractABI,
  nullAddress,
  EXPECTED_PONG_BACK,
  KEEP_ALIVE_CHECK_INTERVAL
} from "./constants.js";
import "dotenv/config";

const app = express();
const server = createServer(app);

app.get("/", (req, res) => {
  res.send("WebSocket client is running");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

function startConnection() {
  const provider = new ethers.providers.WebSocketProvider(
    process.env.POLYGON_MUMBAI_WEBSOCKET_PROVIDER
  );

  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  contract.on("Transfer", async (from, to, tokenId, event) => {
    if (from === nullAddress) {
      console.log(`New Token Minted: ${tokenId.toString()}`);

      const response = await fetch(
        `https://asteroids-nft.vercel.app/api/tokenminted?tokenId=${tokenId.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.API_BEARER_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        console.error("Error calling Next.js API:", response.statusText);
      }
    }
  });

  let pingTimeout = null;
  let keepAliveInterval = null;

  provider._websocket.on("open", () => {
    console.log("WebSocket connection successfully established");
    keepAliveInterval = setInterval(() => {
      console.log("Checking if the connection is alive, sending a ping");

      provider._websocket.ping();

      // Use `WebSocket#terminate()`, which immediately destroys the connection,
      // instead of `WebSocket#close()`, which waits for the close timer.
      // Delay should be equal to the interval at which your server
      // sends out pings plus a conservative assumption of the latency.
      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, EXPECTED_PONG_BACK);
    }, KEEP_ALIVE_CHECK_INTERVAL);
  });

  provider._websocket.on("close", () => {
    console.error("The websocket connection was closed");
    clearInterval(keepAliveInterval);
    clearTimeout(pingTimeout);
    startConnection();
  });

  provider._websocket.on("pong", () => {
    console.log("Received pong, so connection is alive, clearing the timeout");
    clearInterval(pingTimeout);
  });

  provider._websocket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
}

// Initial setup
startConnection();
