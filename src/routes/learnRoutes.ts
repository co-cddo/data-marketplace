import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", async(req: Request, res: Response) => {
    res.render("../views/learn/main.njk")
})

router.get("/data-sharing-arrangements", async(req: Request, res: Response) => {
    res.render("../views/learn/data-sharing-arrangements.njk")
})

export default router;