import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("WebSocket client is running");
});

export default router;
