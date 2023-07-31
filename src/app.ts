import express from "express";
import dotenv from "dotenv";
import nunjucks from "nunjucks";
import helmet from "helmet";
import homeRoute from "./routes/homeRoute";
import findRoutes from "./routes/findRoutes";
import shareRoutes from "./routes/shareRoutes";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { handleCookies } from "./middleware/cookieMiddleware";

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

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(handleCookies);

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

app.use("/", homeRoute);
app.use("/find", findRoutes);
app.use("/share", shareRoutes);

app.post("/cookie-settings", (req, res) => {
  const cookiesButtonValue = req.body.cookies;
  console.log(cookiesButtonValue);
  if (cookiesButtonValue === "accept") {
    res.cookie("cookie_policy", "{essential: true, extra: true}", {
      maxAge: 2592000000,
    });
    res.cookie("user_interacted", "true", { maxAge: 2592000000 });
    res.sendStatus(200);
  } else if (cookiesButtonValue === "reject") {
    res.cookie("cookie_policy", "{essential: true, extra: false}", {
      maxAge: 2592000000,
    });
    res.cookie("user_interacted", "true", { maxAge: 2592000000 });
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }

  const referer = req.headers.referer || "/";
  res.redirect(referer);
});

export default app;
