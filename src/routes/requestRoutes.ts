import express, { Request, Response } from "express";
import template from "../models/requestTemplate.json";

// console.log(template)

const router = express.Router();

router.get("/find/:resourceID/request/start", async (req: Request, res: Response) => {
    const resourceID = req.params.resourceID;
    if (!req.session.requests) {
        console.log("Creating empty requests holder")
        req.session.requests = {}
    }

    if (!req.session.requests[resourceID]) {
        console.log("creating new request")
        req.session["requests"][resourceID] = template;
    }

    console.log(req.session)
    res.send({ "status": "ok" });
});


export default router;