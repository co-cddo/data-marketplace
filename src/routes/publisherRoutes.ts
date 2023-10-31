import express, { Request, Response } from "express";
import multer from "multer";
import {
  NestedJSON,
  UploadError,
  UploadedDataService,
  UploadedDataset,
  UploadedDistribution,
} from "../types/express";
import axios from "axios";
import FormData from "form-data";
import * as XLSX from "xlsx";
import { createAbacMiddleware } from "../middleware/ABACMiddleware";
import * as _ from "lodash";
import { formatDate } from "../helperFunctions/stringHelpers";

const upload = multer();
const verifyUrl = `${process.env.API_ENDPOINT}/publish/verify`;
const publishUrl = `${process.env.API_ENDPOINT}/publish`;

const router = express.Router();

const publishDataAbacMiddleware = createAbacMiddleware(
  "organisation",
  "CREATE_ASSET",
  "publish data descriptions",
);

router.use(publishDataAbacMiddleware);

type AssetCountsResponse = {
  Dataset: number;
  DataService: number;
};

router.get("/publish-dashboard", async (req: Request, res: Response) => {
  const url = `${process.env.API_ENDPOINT}/asset-counts`;
  let numDatasets = 0;
  let numDataServices = 0;
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
    });
    const assetCounts = response.data as AssetCountsResponse;
    numDatasets = assetCounts["Dataset"];
    numDataServices = assetCounts["DataService"];
  } catch (error: unknown) {
    console.error(error);
    return res.render("../views/error.njk", {
      messageTitle: "API Error",
      messageBody:
        "Failed to retrive the publish dashboard statistics. See the API logs for details.",
    });
  }
  res.render("../views/publisher/publish-dashboard.njk", {
    organisation: req.user.organisation?.title,
    numDatasets,
    numDataServices,
  });
});

router.get("/csv/start", async (req: Request, res: Response) => {
  res.render("../views/publisher/csv_start.njk");
});

router.get("/csv/upload", async (req: Request, res: Response) => {
  res.render("../views/publisher/csv_upload.njk");
});

async function checkPermissionToAdd(
  assets: Array<UploadedDataset | UploadedDataService>,
  jwt: string,
) {
  const errs: UploadError[] = [];
  const validAssets: Array<UploadedDataset | UploadedDataService> = [];

  await Promise.all(
    assets.map(async (asset) => {
      const org = asset.organisationID;
      const url = `${process.env.API_ENDPOINT}/users/permission/organisation/${org}/CREATE_ASSET`;

      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        if (response.data === true) {
          validAssets.push(asset);
        } else {
          const assetID =
            asset.externalIdentifier != null
              ? asset.externalIdentifier.toString()
              : "identifier not found";

          const err: UploadError = {
            scope: "ASSET",
            message: `Not authorised to add asset for ${org}`,
            location: assetID,
            extras: { input_data: asset },
            sub_errors: [],
          };

          errs.push(err);
        }
      } catch (error) {
        // Handle errors
        console.error("There was a problem with the Axios request:", error);
      }
    }),
  );
  return {
    errors: errs,
    data: validAssets,
  };
}

router.post(
  "/csv/upload",
  upload.single("spreadsheet"),
  async (req: Request, res: Response) => {
    try {
      const xlsx = XLSX.read(req.file?.buffer);

      const missingSheets = [];
      const sheets = xlsx.SheetNames;
      if (!sheets.includes("Dataset")) {
        missingSheets.push("Dataset");
      }
      if (!sheets.includes("DataService")) {
        missingSheets.push("DataService");
      }
      if (missingSheets.length > 0) {
        return res.render("../views/publisher/bad_spreadsheet.njk", {
          missingSheets: missingSheets.join(", "),
        });
      }

      const datasetCSV = XLSX.utils.sheet_to_csv(xlsx.Sheets["Dataset"], {
        blankrows: false,
      });
      const datasetBuffer = Buffer.from(datasetCSV, "utf8");

      const dataserviceCSV = XLSX.utils.sheet_to_csv(
        xlsx.Sheets["DataService"],
        { blankrows: false },
      );
      const dataServiceBuffer = Buffer.from(dataserviceCSV, "utf8");

      const fd = new FormData();
      fd.append("datasets", datasetBuffer, { filename: "datasets.csv" });
      fd.append("dataservices", dataServiceBuffer, {
        filename: "dataservices.csv",
      });

      const response = await axios.post(verifyUrl, fd, {
        headers: {
          ...fd.getHeaders(),
        },
      });

      const errs = response.data.errors;
      const data = response.data.data;
      const accessControlResults = await checkPermissionToAdd(
        data,
        req.cookies.jwtToken,
      );
      const allErrs = accessControlResults.errors.concat(errs);
      req.session.uploadData = accessControlResults.data;
      req.session.uploadErrors = allErrs;
      req.session.uploadFilename = req.file?.originalname;
      return res.redirect("/publish/csv/upload-summary");
    } catch (err) {
      return res.redirect("/publish/csv/upload/error");
    }
  },
);

router.get("/csv/upload/error", async (req: Request, res: Response) => {
  res.render("../views/publisher/total_error.njk");
});

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
      errors: fileErrors,
    });
  } else {
    const uploadSummaries = (data as NestedJSON[]).map((dataset, index) => ({
      link: `/publish/csv/preview/${index}`,
      linkText: dataset.title,
      assetType: dataset.type,
    }));
    const errorSummaries = rowErrors.map((err, index) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const input_data: any = err.extras?.input_data || {};
      return {
        link: `/publish/csv/error/${index}`,
        linkText: input_data.title || err.location,
        assetType: input_data.type || "Undefined",
        msg: errorSummaryMessage(err),
      };
    });
    const hasErrors: boolean = errors.length > 0;

    res.render("../views/publisher/upload-summary.njk", {
      uploadSummaries,
      errorSummaries,
      hasErrors,
      filename: req.session.uploadFilename,
    });
  }
});

type UploadDescriptionRow = {
  key: {
    text: string;
  };
  value: {
    text?: string;
    html?: string;
  };
};

type rowSpecType = {
  name: string;
  op?: string;
  nested?: Array<{ name: string; path: string }>;
  // eslint-disable-next-line
  formatter?: Function;
};
const datasetRowSpec = new Map<keyof UploadedDataset, rowSpecType>();
datasetRowSpec.set("title", { name: "Title" });
datasetRowSpec.set("alternativeTitle", {
  name: "Alternative titles",
  op: "join",
});
datasetRowSpec.set("description", { name: "Description" });
datasetRowSpec.set("summary", { name: "Summary" });
datasetRowSpec.set("keyword", { name: "Keywords", op: "join" });
datasetRowSpec.set("theme", { name: "Themes", op: "join" });
datasetRowSpec.set("contactPoint", {
  name: "Point of contact",
  op: "nest",
  nested: [
    { name: "Name: ", path: "contactPoint.name" },
    { name: "Email: ", path: "contactPoint.email" },
  ],
});
datasetRowSpec.set("organisationID", { name: "Publisher" });
datasetRowSpec.set("creatorID", { name: "Creator" });
datasetRowSpec.set("version", { name: "Version" });
datasetRowSpec.set("issued", {
  name: "Date issued",
  op: "format",
  formatter: formatDate,
});
datasetRowSpec.set("modified", {
  name: "Date modified",
  op: "format",
  formatter: formatDate,
});
datasetRowSpec.set("created", {
  name: "Date created",
  op: "format",
  formatter: formatDate,
});
datasetRowSpec.set("updateFrequency", { name: "Update frequency" });
datasetRowSpec.set("licence", { name: "Licence" });
datasetRowSpec.set("accessRights", { name: "Access rights" });
datasetRowSpec.set("securityClassification", {
  name: "Security classification",
});
datasetRowSpec.set("externalIdentifier", { name: "Existing identifier" });
datasetRowSpec.set("relatedAssets", { name: "Related data", op: "join" });

const distributionRowSpec = new Map<keyof UploadedDistribution, rowSpecType>();
distributionRowSpec.set("title", { name: "Title" });
distributionRowSpec.set("accessService", { name: "Access service" });
distributionRowSpec.set("externalIdentifier", { name: "Existing identifier" });
distributionRowSpec.set("modified", {
  name: "Date modified",
  op: "format",
  formatter: formatDate,
});
distributionRowSpec.set("issued", {
  name: "Date issued",
  op: "format",
  formatter: formatDate,
});
distributionRowSpec.set("licence", { name: "Licence" });
distributionRowSpec.set("byteSize", { name: "Size in bytes" });
distributionRowSpec.set("mediaType", { name: "Media type" });

const dataServiceRowSpec = new Map<keyof UploadedDataService, rowSpecType>();
dataServiceRowSpec.set("title", { name: "Title" });
dataServiceRowSpec.set("alternativeTitle", {
  name: "Alternative titles",
  op: "join",
});
dataServiceRowSpec.set("description", { name: "Description" });
dataServiceRowSpec.set("summary", { name: "Summary" });
dataServiceRowSpec.set("keyword", { name: "Keywords", op: "join" });
dataServiceRowSpec.set("theme", { name: "Themes", op: "join" });
dataServiceRowSpec.set("contactPoint", {
  name: "Point of contact",
  op: "nest",
  nested: [
    { name: "Name: ", path: "contactPoint.name" },
    { name: "Email: ", path: "contactPoint.email" },
  ],
});
dataServiceRowSpec.set("organisationID", { name: "Publisher" });
dataServiceRowSpec.set("creatorID", { name: "Creator" });
dataServiceRowSpec.set("version", { name: "Version" });
dataServiceRowSpec.set("issued", {
  name: "Date issued",
  op: "format",
  formatter: formatDate,
});
dataServiceRowSpec.set("modified", {
  name: "Date modified",
  op: "format",
  formatter: formatDate,
});
dataServiceRowSpec.set("created", {
  name: "Date created",
  op: "format",
  formatter: formatDate,
});
dataServiceRowSpec.set("licence", { name: "Licence" });
dataServiceRowSpec.set("accessRights", { name: "Access rights" });
dataServiceRowSpec.set("securityClassification", {
  name: "Security classification",
});
dataServiceRowSpec.set("externalIdentifier", { name: "Existing identifier" });
dataServiceRowSpec.set("relatedAssets", { name: "Related data", op: "join" });
dataServiceRowSpec.set("serviceType", { name: "Service type" });
dataServiceRowSpec.set("serviceStatus", { name: "Service status" });
dataServiceRowSpec.set("endpointURL", { name: "Endpoint URL" });
dataServiceRowSpec.set("endpointDescription", { name: "Endpoint description" });
dataServiceRowSpec.set("servesDataset", { name: "Serves data", op: "join" });

function rowValues<T>(
  rowSpec: Map<keyof T, rowSpecType>,
  dataset: T,
): UploadDescriptionRow[] {
  const assetRows: UploadDescriptionRow[] = [];

  for (const [rowId, spec] of rowSpec) {
    let value;
    const data = dataset[rowId];
    if (!data) {
      assetRows.push({
        key: { text: spec["name"] },
        value: { text: "" },
      });
      continue;
    }

    if (spec["op"] === "join") {
      const vals = data as string[];
      value = { text: vals.join(", ") };
    } else if (spec["op"] === "nest") {
      let val = '<ul class="govuk-list">';
      for (const nestedObj of spec["nested"]!) {
        val += `<li><strong>${nestedObj["name"]}</strong>${_.get(
          dataset,
          nestedObj["path"],
        )}</li>`;
      }
      val += "<ul>";
      value = { html: val };
    } else if (spec["op"] === "format") {
      value = { text: spec["formatter"] ? spec["formatter"](data) : data };
    } else {
      value = { text: data };
    }

    assetRows.push({
      key: { text: spec["name"] },
      value: value,
    });
  }
  return assetRows;
}

router.get("/csv/preview/:assetIndex", async (req: Request, res: Response) => {
  const assetIndex = Number(req.params.assetIndex);

  if (!req.session.uploadData) {
    return res.status(400).send("Invalid asset ID or data is not available");
  }

  const dataset = req.session.uploadData[assetIndex];
  if (!dataset) {
    return res.status(404).send("Asset not found");
  }

  let assetRows: UploadDescriptionRow[] = [];
  const distributionRows: UploadDescriptionRow[][] = [];
  let title = "";

  if (dataset.type === "Dataset") {
    title = "Dataset";
    const d = dataset as UploadedDataset;
    assetRows = rowValues<UploadedDataset>(datasetRowSpec, d);
    for (const distribution of d["distributions"]) {
      distributionRows.push(
        rowValues<UploadedDistribution>(distributionRowSpec, distribution),
      );
    }
  } else {
    title = "Data Service";
    const d = dataset as UploadedDataService;
    assetRows = rowValues<UploadedDataService>(dataServiceRowSpec, d);
  }

  res.render("../views/publisher/preview.njk", {
    title,
    assetRows,
    distributionRows,
  });
});

router.get("/csv/error/:errorIndex", async (req: Request, res: Response) => {
  const errorIndex = Number(req.params.errorIndex);

  if (!req.session.uploadErrors) {
    return res
      .status(400)
      .send("Data is not available - please return to home screen");
  }

  const assetErr = req.session.uploadErrors[errorIndex];

  if (!assetErr) {
    return res.status(404).send("Error not found");
  }

  res.render("../views/publisher/asset-error.njk", {
    assetErr,
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
