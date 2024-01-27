import express from "express";
import rootRoute from "./routes/rootRoute.js";

const app = express();

app.use("/", rootRoute);

export default app;
