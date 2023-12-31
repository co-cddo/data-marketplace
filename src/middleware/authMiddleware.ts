/* eslint-disable  @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { Strategy as JwtStrategyPassport, ExtractJwt } from "passport-jwt";
import jwksRsa from "jwks-rsa";
import passport from "passport";
import { UserData } from "../types/express";

if (
  !process.env.SSO_AUTH_URL ||
  !process.env.SSO_CLIENT_ID ||
  !process.env.SSO_CLIENT_SECRET ||
  !process.env.SSO_CALLBACK_URL
) {
  throw new Error(
    "Missing required environment variables for OAuth configuration.",
  );
}

export const oauth2Options = {
  authorizationURL: `${process.env.SSO_AUTH_URL}/auth/oidc`!,
  tokenURL: `${process.env.SSO_AUTH_URL}/auth/token`!,
  clientID: process.env.SSO_CLIENT_ID!,
  clientSecret: process.env.SSO_CLIENT_SECRET!,
  callbackURL: process.env.SSO_CALLBACK_URL!,
  scope: ["openid", "profile", "email"],
};
export const oAuthStrategy = new OAuth2Strategy(
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
);

export const JwtStrategy = new JwtStrategyPassport(
  {
    secretOrKeyProvider: jwksRsa.passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://sso.service.security.gov.uk/.well-known/jwks.json`,
    }),
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
  },
  (jwtPayload, done) => {
    try {
      const user = jwtPayload;
      return done(null, user);
    } catch (error) {
      console.log("failed auth in strategy");
      return done(error, false);
    }
  },
);

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.clearCookie("returnTo");

  passport.authenticate(
    "jwt",
    { session: false },
    (err: Error, user: UserData) => {
      if (err || !user) {
        const returnTo = req.originalUrl || "/";
        res.cookie("returnTo", returnTo);
        return res.redirect("/login");
      }
      req.user = user;
      next();
    },
  )(req, res, next);
}

export const loadJwtFromCookie = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.isAuthenticated()) {
    const jwtToken = req.cookies.jwtToken;

    if (jwtToken) {
      req.headers.authorization = `JWT ${jwtToken}`;
    }
  } else {
    res.clearCookie("jwtToken");
  }
  next();
};

export function modifyApplicationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
}
