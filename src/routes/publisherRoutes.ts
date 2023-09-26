import express, { Request, Response } from "express";
import multer from "multer";
import { IFile } from "../types/express";
import axios from "axios";
import FormData from "form-data";

const upload = multer();
const verifyUrl = `${process.env.API_ENDPOINT}/publish/verify`;
const publishUrl = `${process.env.API_ENDPOINT}/publish`;

const router = express.Router();

router.get("/publish-dashboard", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/publisher/publish-dashboard.njk", {
    backLink,
  });
});

router.get("/csv/start", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/publisher/csv_start.njk", {
    backLink,
  });
});

router.get("/csv/upload", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/publish";
  res.render("../views/publisher/csv_upload.njk", {
    backLink,
  });
});

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
      console.log(response.data)
      const errs = response.data.errors;
      const data = response.data.data;
      req.session.uploadData = data;
      req.session.uploadErrors = errs;
      return res.redirect("/publish/csv/upload-summary");
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  },
);

router.get("/csv/upload-summary", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const data = req.session.uploadData || [];

  const uploadSummary = data.map((dataset, index) => [
    { html: `<a class="govuk-link" href="/publish/csv/preview/${index}">${dataset.title}</a>` },
    { text: dataset.type },
    { text: dataset.status }
  ]);

  res.render("../views/publisher/upload-summary.njk", {
      backLink,
      uploadSummary
  });
});

router.get("/csv/preview/:id", async (req: Request, res: Response) => {
  const assetId = Number(req.params.id);

  if (!req.session.uploadData) {
    return res.status(400).send("Invalid asset ID or data is not available");
  }

  const dataset = req.session.uploadData[assetId];

  console.log("/publish/csv/preview specific asset", dataset)
  if (!dataset) {
    return res.status(404).send("Asset not found");
  }

  res.render("../views/publisher/preview.njk", {
    dataset
  });
});

// router.get("/preview/", async (req: Request, res: Response) => {
//   let fileError: UploadError | null = null;
//   const rowErrors: UploadError[] = [];
//   if (req.session.uploadErrors) {
//     req.session.uploadErrors.forEach((e) => {
//       if (e.scope == "FILE") {
//         fileError = e;
//       } else {
//         rowErrors.push(e);
//       }
//     });
//   }
//   if (fileError) {
//     console.log(JSON.stringify(fileError));
//     res.render("../views/publisher/file_error.njk", {
//       error: JSON.stringify(fileError, null, 2),
//     });
//   } else if (rowErrors.length > 0) {
//     console.log(JSON.stringify(rowErrors));
//     res.render("../views/publisher/preview.njk", {
//       data: req.session.uploadData,
//       errors: rowErrors,
//       hasError: true,
//     });
//   } else {
//     res.render("../views/publisher/preview.njk", {
//       data: req.session.uploadData,
//       errors: rowErrors,
//       hasError: false,
//     });
//   }
// });

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
