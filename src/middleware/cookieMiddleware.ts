import { NextFunction, Request, Response } from "express";

export function handleCookies(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies.cookie_policy) {
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    res.cookie(
      "cookie_policy",
      encodeURIComponent(JSON.stringify({ essential: true, extra: false })),
      { expires: expirationDate },
    );
  }

  const userInteracted = req.cookies.user_interacted === "true";
  res.locals.showCookieBanner = !userInteracted;

  next();
}
