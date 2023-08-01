import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import nunjucks from "nunjucks";
import helmet from "helmet";
import homeRoute from "./routes/homeRoute";
import findRoutes from "./routes/findRoutes";
import shareRoutes from "./routes/shareRoutes";
import path from "path";

export const app = express();
// Set up security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "http://localhost:3000"],
        "style-src": ["'self'", "'unsafe-inline'"],
      },
    },
  }),
);

// Set static folder middleware
app.use(
  "/assets",
  express.static(
    path.join(__dirname, "../node_modules/govuk-frontend/govuk/assets"),
  ),
);

app.use(express.static("public"));

// use dotenv for env variables
dotenv.config();

// Configure Nunjucks
const isTesting = process.env.NODE_ENV === "test";
nunjucks.configure(["node_modules/govuk-frontend/", "src/views"], {
  autoescape: true, // prevents cross-site scripting attacks (XSS)
  express: app,
  watch: !isTesting,
});

// Set Nunjucks as the Express view engine
app.set("view engine", "njk");

// Routes
app.use("/", homeRoute);
app.use("/find", findRoutes);
app.use("/share", shareRoutes);

// Error handling
// Catch all route to handle errors
app.use("*", (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  console.error(`Error: Page not found: ${req.originalUrl}`);
  res.status(404).render("error", {
    status: 404,
    messageTitle: "Page not found",
    messageBody:
      "If you typed the web address, check it is correct. If you pasted the web address, check you copied the entire address.",
    backLink: backLink,
  });
});

// Error-handling middleware function placed after all routes. Error-handling middleware requires all 4 arguments, so we can disable the ESlint warning.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const backLink = req.headers.referer || "/";
  console.error(err);
  res.status(500).render("error", {
    status: 500,
    messageTitle: "Sorry, there is a problem with the service",
    messageBody: "Try again later.",
    backLink: backLink,
  });
});

export default app;
