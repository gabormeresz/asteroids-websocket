import http from "http";
import app from "./src/app.js";
import { startConnection } from "./src/controllers/websocketController.js";
import "dotenv/config";

const PORT = process.env.PORT || 8090;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  startConnection(); // Start WebSocket connection
});
