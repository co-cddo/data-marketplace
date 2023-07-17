import express from "express";
import Helmet from "helmet";
import homeRoute from "./routes/homeRoute";

export const app = express();
app.use(Helmet());

app.use("/", homeRoute);

export default app;
