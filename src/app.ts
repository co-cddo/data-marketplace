import express from "express";
import nunjucks from "nunjucks";
import helmet from "helmet";
import homeRoute from "./routes/homeRoute";
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

// Configure Nunjucks
nunjucks.configure(["node_modules/govuk-frontend/", "src/views"], {
  autoescape: true, // prevents cross-site scripting attacks (XSS)
  express: app,
  watch: true,
});

// Set Nunjucks as the Express view engine
app.set("view engine", "njk");

app.use("/", homeRoute);

export default app;
