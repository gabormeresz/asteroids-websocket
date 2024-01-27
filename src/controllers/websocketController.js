import { initializeProvider, createContract } from "../config/ethersConfig.js";
import {
  handleTransferEvent,
  handleWebSocketEvents
} from "../utils/websocketUtils.js";

export const startConnection = () => {
  const provider = initializeProvider();
  const contract = createContract(provider);

  contract.on("Transfer", (from, to, tokenId, event) =>
    handleTransferEvent(from, to, tokenId)
  );

  handleWebSocketEvents(provider._websocket);
};
