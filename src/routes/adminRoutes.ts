import express, { NextFunction, Request, Response } from "express";
import axios from "axios";

const router = express.Router();

const API = (path: string) => `${process.env.API_ENDPOINT}/${path}`;

const apiKeyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let apiKey = req.headers["x-api-key"];
  if (Array.isArray(apiKey)) {
    apiKey = apiKey[0];
  }

  if (!apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.apiKey = apiKey;
  next();
};

router.use(apiKeyMiddleware);

const callApiAsAdmin = async (
  req: Request,
  res: Response,
  path: string,
  verb: "GET" | "PUT" = "GET",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any = {},
) => {
  const headers = { "x-api-key": req.apiKey };
  try {
    let response;
    if (verb === "GET") {
      response = await axios.get(API(path), { headers });
    } else {
      response = await axios.put(API(path), { ...data }, { headers });
    }
    return res.status(200).json(response.data);
  } catch (error: unknown) {
    console.error("Error getting users");
    if (axios.isAxiosError(error)) {
      return res
        .status(error.response?.status || 401)
        .send(error.response?.data.detail);
    } else {
      return res.status(401).send("Unauthorised");
    }
  }
};

router.get("/users", async (req: Request, res: Response) => {
  return await callApiAsAdmin(req, res, "users");
});

router.get("/users/:userId", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  return await callApiAsAdmin(req, res, `users/${userId}`);
});

router.put("/users/:userId/org", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  return await callApiAsAdmin(req, res, `users/${userId}/org`, "PUT", {
    ...req.body,
  });
});

router.put("/users/:userId/permissions", async (req: Request, res: Response) => {
  const userId = req.params.userId;
  return await callApiAsAdmin(req, res, `users/${userId}/permissions`, "PUT", {
    ...req.body,
  });
});

export default router;
