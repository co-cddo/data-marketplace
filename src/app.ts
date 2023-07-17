import express, { Request, Response } from "express";
import Helmet from "helmet";

const app = express();
app.use(Helmet());

app.get("/", (req: Request, res: Response) => {
  res.send("TS auto changes through docker");
});

export default app;
