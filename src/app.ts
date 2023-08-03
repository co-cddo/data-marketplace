import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import nunjucks from "nunjucks";
import helmet from "helmet";
import homeRoute from "./routes/homeRoute";
import findRoutes from "./routes/findRoutes";
import shareRoutes from "./routes/shareRoutes";
import cookieRoutes from "./routes/cookieRoutes";
import path from "path";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import session from "express-session";
import { handleCookies } from "./middleware/cookieMiddleware";
import passport from "passport";
import axios from "axios";
// import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

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
app.use(cookieParser());

const loadJwtFromCookie = (req: Request, res: Response, next: NextFunction) => {
  const jwtToken = req.cookies.jwtToken;

  if (jwtToken) {
    req.headers.authorization = `JWT ${jwtToken}`;
  }
  next();
};

app.use(loadJwtFromCookie);
// Set static folder middleware
app.use(
  "/assets",
  express.static(
    path.join(__dirname, "../node_modules/govuk-frontend/govuk/assets"),
  ),
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "sausage",
    resave: false,
    saveUninitialized: false,
  }),
);
const oauth2Options = {
  authorizationURL: process.env.SSO_AUTH_URL!,
  tokenURL: process.env.SSO_TOKEN_URL!,
  clientID: process.env.SSO_CLIENT_ID!,
  clientSecret: process.env.SSO_CLIENT_SECRET!,
  callbackURL: process.env.SSO_CALLBACK_URL!,
  scope: ["openid", "profile", "email"],
};
passport.use(
  "custom-sso",
  new OAuth2Strategy(
    oauth2Options,
    async (
      accessToken: string,
      data: any,
      extraParams: any,
      profile: any,
      done: any,
    ) => {
      const user = {
        idToken: extraParams.id_token,
        accessToken,
      };
      done(null, user);
    },
  ),
);
passport.use(
  new JwtStrategy(
    {
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://sso.service.security.gov.uk/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
    },
    async (jwtPayload, done) => {
      console.log(jwtPayload);
      try {
        const user = jwtPayload.display_name;
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    },
  ),
);

// Initialize Passport and session middleware
app.use(passport.initialize());
app.use(passport.session());

// Serialize user into the session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user: any, done) => {
  done(null, user);
});

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

app.get("/login", passport.authenticate("custom-sso"), (req, res, done) => {
  done();
});
app.get(
  "/auth/callback",
  passport.authenticate("custom-sso", { session: false }),
  async (req: Request, res: Response) => {
    interface User {
      idToken: string;
    }
    const user: User = req.user as User;
    if (!req.user) {
      res.redirect("/");
    } else {
      res.cookie("jwtToken", user.idToken, { httpOnly: true });
      res.redirect("/profile");
    }
  },
);

app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("here");
    res.render("page.njk", {
      heading: "Authed",
    });
  },
);

app.use("/", homeRoute);
app.use("/find", findRoutes);
app.use("/share", shareRoutes);
app.use("/cookie-settings", cookieRoutes);

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
