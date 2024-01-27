import { ethers } from "ethers";
import { contractAddress, contractABI } from "../constants/constants.js";

export const initializeProvider = () => {
  return new ethers.providers.WebSocketProvider(
    process.env.POLYGON_MUMBAI_WEBSOCKET_PROVIDER
  );
};

export const createContract = (provider) => {
  return new ethers.Contract(contractAddress, contractABI, provider);
};
