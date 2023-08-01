import express, { Request, Response } from "express";
const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  const cookiesButtonValue = req.body.cookies;
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  if (cookiesButtonValue === "accept") {
    res.cookie(
      "cookie_policy",
      encodeURIComponent(JSON.stringify({ essential: true, extra: true })),
      {
        expires: expirationDate,
      },
    );
    res.cookie("user_interacted", "true", { expires: expirationDate });
    res.sendStatus(200);
  } else if (cookiesButtonValue === "reject") {
    res.cookie(
      "cookie_policy",
      encodeURIComponent(JSON.stringify({ essential: true, extra: false })),
      {
        expires: expirationDate,
      },
    );
    res.cookie("user_interacted", "true", { expires: expirationDate });
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

export default router;
