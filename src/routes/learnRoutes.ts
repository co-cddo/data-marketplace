import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", async(req: Request, res: Response) => {
    res.render("../views/learn/main.njk")
})

export default router;