import express, { Request, Response } from "express";
import multer from "multer";
import { IFile, NestedJSON, UploadError } from "../types/express";
import axios from "axios";
import FormData from "form-data";
import { createAbacMiddleware } from "../middleware/ABACMiddleware";

const upload = multer();
const verifyUrl = `${process.env.API_ENDPOINT}/publish/verify`;
const publishUrl = `${process.env.API_ENDPOINT}/publish`;

const router = express.Router();

const publishDataAbacMiddleware = createAbacMiddleware(
  "organisation", "CREATE_ASSET", "publish data descriptions"
)

router.use(publishDataAbacMiddleware)

router.get("/publish-dashboard", async (req: Request, res: Response) => {
  res.render("../views/publisher/publish-dashboard.njk");
});

router.get("/csv/start", async (req: Request, res: Response) => {
  res.render("../views/publisher/csv_start.njk");
});

router.get("/csv/upload", async (req: Request, res: Response) => {
  res.render("../views/publisher/csv_upload.njk");
});

async function checkPermissionToAdd(assets: NestedJSON[], jwt: string) {
  const errs: UploadError[] = [];

  await Promise.all(assets.map(async (asset) => {
    const org = asset.organisationID;
    const url = `${process.env.API_ENDPOINT}/users/permission/organisation/${org}/CREATE_ASSET`;

    try {
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${jwt}` } });
      if (response.data !== true) {
        const assetID = asset.externalIdentifier != null ? asset.externalIdentifier.toString() : 'identifier not found';

        const err: UploadError = {
          scope: 'ASSET',
          message: `Not authorised to add asset for ${org}`,
          location: assetID,
          extras: {},
          sub_errors: [],
        };

        errs.push(err);
      }
    } catch (error) {
      // Handle errors
      console.error('There was a problem with the Axios request:', error);
    }
  }));
  return errs;
}

router.post(
  "/csv/upload",
  upload.fields([
    { name: "datasetsCSV", maxCount: 1 },
    { name: "servicesCSV", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: IFile[] };

      const datasets = files["datasetsCSV"][0];
      const dataservices = files["servicesCSV"][0];
      const fd = new FormData();
      fd.append("datasets", datasets.buffer, { filename: "datasets.csv" });
      fd.append("dataservices", dataservices.buffer, {
        filename: "dataservices.csv",
      });
      const response = await axios.post(verifyUrl, fd, {
        headers: {
          ...fd.getHeaders(),
        },
      });
      const errs = response.data.errors;
      const data = response.data.data;
      const accessErrors = await checkPermissionToAdd(data, req.cookies.jwtToken)
      const allErrs = accessErrors.concat(errs)
      console.log(allErrs)
      req.session.uploadData = data;
      req.session.uploadErrors = allErrs;
      return res.redirect("/publish/csv/upload-summary");
    } catch (err) {
        return res.redirect("/publish/csv/upload/error");
    }
  },
);

router.get("/csv/upload/error", async (req: Request, res: Response) => {
    res.render("../views/publisher/total_error.njk");
})

function errorSummaryMessage(err: UploadError): string {
    let msg: string = err.message;
    if (err.sub_errors && err.sub_errors.length === 1) {
        msg = `${err.sub_errors[0].location}: ${err.sub_errors[0].message}`;
    } else if (err.sub_errors && err.sub_errors.length > 1) {
        msg = "Multiple errors";
    }
    return msg;
}

router.get("/csv/upload-summary", async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const data = req.session.uploadData || [];
    const errors = req.session.uploadErrors || [];
    const rowErrors: UploadError[] = [];
    const fileErrors: UploadError[] = [];
    errors.forEach((e) => {
        if (e.scope == "FILE") {
            fileErrors.push(e);
        } else {
            rowErrors.push(e);
        }
    });
    if (fileErrors.length > 0) {
        res.render("../views/publisher/file_error.njk", {
            errors: fileErrors
        });
    } else {
        const uploadSummaries = data.map((dataset, index) => ({
            link: `/publish/csv/preview/${index}`,
            linkText: dataset.title,
            assetType: dataset.type
        }));
        const errorSummaries = rowErrors.map((err, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const input_data: any = err.extras?.input_data || {};
          return {
              link: `/publish/csv/error/${index}`,
              linkText: input_data.title || err.location,
              assetType: input_data.type || "Undefined",
              msg: errorSummaryMessage(err)
          };
        });
        const hasErrors: boolean = rowErrors.length > 0;

        res.render("../views/publisher/upload-summary.njk", {
            backLink,
            uploadSummaries,
            errorSummaries,
            hasErrors
        });
    };
});

router.get("/csv/preview/:assetIndex", async (req: Request, res: Response) => {
  const assetIndex = Number(req.params.assetIndex);

  if (!req.session.uploadData) {
    return res.status(400).send("Invalid asset ID or data is not available");
  }

  const dataset = req.session.uploadData[assetIndex];

  console.log("/publish/csv/preview specific asset", dataset)
  if (!dataset) {
    return res.status(404).send("Asset not found");
  }

  res.render("../views/publisher/preview.njk", {
    dataset
  });
});

router.get("/csv/error/:errorIndex", async (req: Request, res: Response) => {
    const errorIndex = Number(req.params.errorIndex);

    if (!req.session.uploadErrors) {
        return res.status(400).send("Data is not available - please return to home screen");
    }

    const assetErr = req.session.uploadErrors[errorIndex];

    if (!assetErr) {
        return res.status(404).send("Error not found");
    }

    res.render("../views/publisher/asset-error.njk", {
        assetErr
    });
});

router.post("/commit", async (req: Request, res: Response) => {
  const body = { data: req.session.uploadData };
  axios
    .post(publishUrl, body, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      req.session.uploadData = response.data.data;
      req.session.uploadErrors = response.data.errors;
      return res.redirect("/publish/csv/confirmation");
    })
    .catch((error) => {
      console.error(error);
      res.sendStatus(400);
    });
});

router.get("/csv/confirmation", async (req: Request, res: Response) => {
  if (req.session.uploadErrors && req.session.uploadData) {
    if (req.session.uploadErrors.length > 0) {
      res.render("../views/publisher/post_publish.njk", {
        error: JSON.stringify(req.session.uploadErrors),
        hasError: true,
      });
    } else {
      res.render("../views/publisher/post_publish.njk", {
        hasError: false,
        numPublished: req.session.uploadData.length,
      });
    }
  } else {
    console.error("Something went wrong - no upload data present");
    res.sendStatus(400);
  }
});

export default router;
