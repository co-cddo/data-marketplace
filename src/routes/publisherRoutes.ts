import express, { Request, Response } from "express";
import multer from 'multer'
import {
    IFile,
    UploadError,
    NestedJSON
} from "../types/express";
import axios from "axios";
import FormData from "form-data";

const upload = multer();
const verifyUrl = `${process.env.API_ENDPOINT}/publish/verify`;
const publishUrl = `${process.env.API_ENDPOINT}/publish`;


const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    res.render("../views/publisher/home.njk", {
        backLink,
    });
});

router.get("/csv", async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/publish";
    res.render("../views/publisher/csv.njk", {
        backLink,
    });
});


// TODO!!!! The user doesn't actually end up at the API at all!
async function checkPermissionToAdd(assets: NestedJSON[]) {
    const errs: UploadError[] = [];

    await Promise.all(assets.map(async (asset) => {
        const org = asset.organisationID;
        const url = `${process.env.API_ENDPOINT}/users/permission/organisation/${org}/CREATE_ASSET`;

        try {
            const response = await axios.get(url);
            if (response.data !== true) {
                const assetID = asset.externalIdentifier != null ? asset.externalIdentifier.toString() : 'identifier not found';

                const err: UploadError = {
                    scope: 'ASSET',
                    message: `Not authorised to add asset for {org}`,
                    location: assetID,
                    extras: {},
                    sub_errors: [],
                };

                errs.push(err);
                console.log('Added error:', err);
            }
        } catch (error) {
            // Handle errors
            console.error('There was a problem with the Axios request:', error);
        }
    }));
    return errs;
}

router.post("/csv/upload",
            upload.fields([{name: 'datasetsCSV', maxCount: 1},
                           {name: 'servicesCSV', maxCount: 1}]),
            async (req: Request, res: Response) => {
    try {
        const files = req.files as { [fieldname: string]: IFile[] };

        const datasets = files['datasetsCSV'][0];
        const dataservices = files['servicesCSV'][0];
        const fd = new FormData();
        fd.append('datasets', datasets.buffer, {filename: 'datasets.csv'});
        fd.append('dataservices', dataservices.buffer, {filename: 'dataservices.csv'});
        const response = await axios.post(verifyUrl, fd, {
            headers: {
                ...fd.getHeaders(),
            },
        });
        const data = response.data.data;

        const accessErrs = await checkPermissionToAdd(data);
        console.log("access errors");
        console.log(accessErrs);
        const errs = accessErrs.concat(response.data.errors);
        console.log("all errors");
        console.log(errs);
        req.session.uploadData = data;
        req.session.uploadErrors = errs;
        return res.redirect("/publish/preview");
    } catch (err) {
        console.error(err);
        res.sendStatus(400);
    }
});

router.get("/preview", async (req: Request, res: Response) => {
    var fileError: UploadError | null = null;
    const rowErrors: UploadError[] = [];
    if (req.session.uploadErrors) {

        req.session.uploadErrors.forEach((e) => {
            if
                (e.scope == "FILE") {
                fileError = e;
            } else {
                rowErrors.push(e);
            }

        });
    }
    if (fileError) {
        console.log(JSON.stringify(fileError));
        res.render("../views/publisher/file_error.njk", {error: JSON.stringify(fileError, null, 2)})
    } else if (rowErrors.length > 0) {
        console.log(JSON.stringify(rowErrors));
        res.render("../views/publisher/preview.njk", {data: req.session.uploadData,
                                                      errors: rowErrors,
                                                      hasError: true})
    } else {
        res.render("../views/publisher/preview.njk", {data: req.session.uploadData,
                                                      errors: rowErrors,
                                                      hasError: false})
    }
});

router.post("/commit", async (req: Request, res: Response) => {
        const body = {"data": req.session.uploadData};
        axios.post(publishUrl, body, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                req.session.uploadData = response.data.data;
                req.session.uploadErrors = response.data.errors;
                return res.redirect("/publish/result");
            })
            .catch((error) => {
                console.error(error);
                res.sendStatus(400);
            });
});

router.get("/result", async (req: Request, res: Response) => {
    if (req.session.uploadErrors && req.session.uploadData) {
        if (req.session.uploadErrors.length > 0) {
            res.render("../views/publisher/post_publish.njk", {error: JSON.stringify(req.session.uploadErrors),
                                                               hasError: true})
        } else {
            res.render("../views/publisher/post_publish.njk", {hasError: false,
                                                               numPublished: req.session.uploadData.length})
        }
    } else {
        console.error("Something went wrong - no upload data present");
        res.sendStatus(400);
    }

})

export default router;
