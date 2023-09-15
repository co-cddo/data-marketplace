import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import nunjucks from "nunjucks";
import { authenticateJWT } from "./middleware/authMiddleware";
import markdown from "nunjucks-markdown";
import marked from "marked";
import helmet from "helmet";
import homeRoute from "./routes/homeRoute";
import learnRoutes from "./routes/learnRoutes";
import adminRoutes from "./routes/adminRoutes";
import findRoutes from "./routes/findRoutes";
import shareRoutes from "./routes/shareRoutes";
import acquirerRoutes from "./routes/acquirerRoutes";
import cookieRoutes from "./routes/cookieRoutes";
import loginRoutes from "./routes/loginRoutes";
import authRoutes from "./routes/authRoutes";
import profileRoutes from "./routes/profileRoutes";
import manageRoutes from "./routes/supplierRoutes";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import { handleCookies } from "./middleware/cookieMiddleware";
import passport from "passport";
import {
  loadJwtFromCookie,
  oAuthStrategy,
  JwtStrategy,
  modifyApplicationMiddleware,
} from "./middleware/authMiddleware";

export const app = express();
// Set up security headers with Helmet
const upgradeDirective = process.env.NODE_ENV === "production" ? [] : null;
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", "'unsafe-inline'", "http://localhost:3000"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "upgrade-insecure-requests": upgradeDirective,
      },
    },
  }),
);
app.use(cookieParser());

app.use(
  "/assets",
  express.static(
    path.join(__dirname, "../node_modules/govuk-frontend/govuk/assets"),
  ),
);

app.use("/javascripts",
 express.static(
  path.join(__dirname, "../node_modules/govuk-frontend/govuk")
  )
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "super-secretoken",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
  }),
);

passport.use("custom-sso", oAuthStrategy);
passport.use(JwtStrategy);

// Initialize Passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

// Serialize user into the session
passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});
app.use((req, res, next) => {
  modifyApplicationMiddleware(req, res, next);
});
app.use(loadJwtFromCookie);

app.use(express.static("public"));

app.use(handleCookies);

// use dotenv for env variables
dotenv.config();

// Configure Nunjucks
const isTesting = process.env.NODE_ENV === "test";
// Set up Nunjucks environment
const env = nunjucks.configure(["node_modules/govuk-frontend/", "src/views"], {
  autoescape: true, // prevents cross-site scripting attacks (XSS)
  express: app,
  watch: !isTesting,
});
// Configure Nunjucks Markdown
markdown.register(env, marked.parse);

// Add a custom filter for date formatting
env.addFilter("formatDate", function (date: string | number | Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString("en-GB", options);
});

// Set Nunjucks as the Express view engine
app.set("view engine", "njk");

app.use("/", loginRoutes);
app.use("/auth", authRoutes);
app.use("/", homeRoute);
app.use("/profile", authenticateJWT, profileRoutes);
app.use("/find", findRoutes);
app.use("/share", authenticateJWT, shareRoutes);
app.use("/acquirer", authenticateJWT, acquirerRoutes);
app.use("/manage-shares", authenticateJWT, manageRoutes);
app.use("/cookie-settings", cookieRoutes);
app.use("/learn", learnRoutes);
app.use("/admin", adminRoutes);

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
  res.status(500).render("error", {
    status: 500,
    messageTitle: "Sorry, there is a problem with the service",
    messageBody: "Try again later.",
    backLink: backLink,
  });
});

export default app;
