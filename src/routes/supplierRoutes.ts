import express, { NextFunction, Request, Response } from "express";
import {
  FormData,
  ShareRequestResponse,
  ShareRequestTable,
} from "../types/express";
import axios from "axios";
import { checkAnswer } from "../helperFunctions/formHelper";
const router = express.Router();
const URL = `${process.env.API_ENDPOINT}/manage-shares`;

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function formatDateObject(dateObj: {
  day: string;
  month: string;
  year: string;
}): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndex = parseInt(dateObj.month, 10) - 1; // Convert month string to number and subtract 1 for zero-based index
  const monthName = monthNames[monthIndex];

  return `${dateObj.day} ${monthName} ${dateObj.year}`;
}

router.get("/", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/manage-shares.njk", {
    backLink,
  });
});

// Function to get the tag class based on the status value
function getStatusClass(status: string): string {
  switch (status) {
    case "NOT STARTED":
      return "govuk-tag--grey";
    case "IN PROGRESS":
      return "govuk-tag--blue";
    case "RETURNED":
      return "govuk-tag--red";
    default:
      return "govuk-tag--grey";
  }
}

router.get(
  "/created-requests",
  async (req: Request, res: Response, next: NextFunction) => {
    let createdRequests;
    try {
      createdRequests = await axios.get(`${URL}/created-requests`, {
        headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API ERROR - ${error.response?.status}: ${error.response?.statusText}`,
        );
        console.error(error.response?.data.detail);
      } else {
        console.error(error);
      }
      next(error);
    }
    const response = createdRequests?.data as ShareRequestResponse[];

    const acquirerForms = response.reduce(
      (acc: Record<string, FormData>, val: ShareRequestResponse) => ({
        ...acc,
        [val.sharedata.dataAsset]: val.sharedata,
      }),
      {},
    );
    req.session.acquirerForms = acquirerForms;

    const backLink = req.headers.referer || "/";

    const pendingRequests = response.filter((r) =>
      ["IN PROGRESS", "RETURNED"].includes(r.status),
    );
    let pendingRows: ShareRequestTable = pendingRequests.map((r) => [
      {
        html: `<a href="/acquirer/${r.sharedata.dataAsset
          }/start">${r.requestId.substring(0, 8)}...</a>`,
      },
      { text: r.assetTitle },
      { text: r.assetPublisher.title },
      {
        text:
          r.neededBy === "UNREQUESTED" ? "Unrequested" : formatDate(r.neededBy),
      },
      {
        html: `<span class="govuk-tag ${getStatusClass(r.status)}">${r.status
          }</span>`,
      },
    ]);
    if (pendingRows.length === 0) {
      pendingRows = [
        [{ text: "There are no pending data share requests", colspan: 5 }],
      ];
    }

    const submittedRequests = response.filter((r) =>
      ["AWAITING REVIEW", "IN REVIEW"].includes(r.status),
    );
    let submittedRows: ShareRequestTable = submittedRequests.map((r) => [
      {
        html: `<a href="/acquirer/${r.sharedata.dataAsset
          }/start">${r.requestId.substring(0, 8)}...</a>`,
      },
      { text: r.assetTitle },
      { text: r.assetPublisher.title },
      { text: formatDate(r.received) },
      {
        text:
          r.neededBy === "UNREQUESTED" ? "Unrequested" : formatDate(r.neededBy),
      },
      {
        html: `<span class="govuk-tag ${getStatusClass(r.status)}">${r.status
          }</span>`,
      },
    ]);
    if (submittedRows.length === 0) {
      submittedRows = [
        [{ text: "There are no submitted data share requests", colspan: 6 }],
      ];
    }

    const completedRequests = response.filter((r) =>
      ["ACCEPTED", "REJECTED"].includes(r.status),
    );
    let completedRows: ShareRequestTable = completedRequests.map((r) => [
      {
        html: `<a href="/acquirer/${r.sharedata.dataAsset
          }/start">${r.requestId.substring(0, 8)}...</a>`,
      },
      { text: r.assetTitle },
      { text: r.assetPublisher.title },
      {
        text:
          r.neededBy === "UNREQUESTED" ? "Unrequested" : formatDate(r.neededBy),
      },
      { text: formatDate(r.decisionDate as string) },
      {
        html: `<span class="govuk-tag ${getStatusClass(r.status)}">${r.status
          }</span>`,
      },
    ]);
    if (completedRows.length === 0) {
      completedRows = [
        [{ text: "There are no completed data share requests", colspan: 5 }],
      ];
    }

    const allTableRows = {
      pending: pendingRows,
      submitted: submittedRows,
      completed: completedRows,
    };

    res.render("../views/supplier/created-requests.njk", {
      backLink,
      allTableRows: allTableRows,
    });
  },
);

router.get("/received-requests", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/manage-shares";

  const response = await axios.get(`${URL}/received-requests`, {
    headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
  });
  const receivedTableRows = [];
  if (response.data && response.data.length > 0) {
    for (const request of response.data) {
      // Format the received date
      request.received = formatDate(request.received);

      // Format the "Needed by" date on the
      if (
        request.sharedata &&
        request.sharedata.steps &&
        request.sharedata.steps.date
      ) {
        const dateObj = request.sharedata.steps.date.value;
        request.sharedata.steps.date.formattedValue = formatDateObject(dateObj);
      }

      const row = [
        {
          html: `<a href="/manage-shares/received-requests/${request.requestId}">${request.requestId}</a>`,
        },
        { text: request.requesterEmail },
        { text: request.assetTitle },
        { text: request.received },
        { text: request.sharedata.steps.date.formattedValue },
        {
          html: `<span class="govuk-tag ${getStatusClass(request.status)}">${request.status
            }</span>`,
        },
      ];
      receivedTableRows.push(row);
    }
  } else {
    receivedTableRows.push([{ text: "No received requests.", colspan: 6 }]);
  }

  res.render("../views/supplier/received-requests.njk", {
    backLink,
    receivedTableRows: receivedTableRows,
  });
});

router.get(
  "/received-requests/:requestId",
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/manage-shares/received-requests/";
    const requestId = req.params.requestId;

    try {
      const requestDetail = await axios.get(
        `${URL}/received-requests/${requestId}`,
        {
          headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
        },
      );

      if (!requestDetail.data) {
        return res.status(404).send("Request not found");
      }

      // Format the received date
      requestDetail.data.received = formatDate(requestDetail.data.received);

      // Format the neededBy date
      const dateObj = requestDetail.data.sharedata.steps.date.value;
      requestDetail.data.sharedata.steps.date.formattedValue =
        formatDateObject(dateObj);

      req.session.acquirerForms = requestDetail.data;

      res.render("../views/supplier/review-summary.njk", {
        backLink,
        request: requestDetail.data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

router.post(
  "/received-requests/:requestId",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;
    res.redirect(
      `/manage-shares/received-requests/${requestId}/review-request`,
    );
  },
);

router.get(
  "/received-requests/:requestId/review-request",
  (req: Request, res: Response) => {
    const requestDetail = req.session.acquirerForms;

    if (!requestDetail) {
      return res.status(404).send("Request data not found in session");
    }

    res.render("../views/supplier/review-request.njk", {
      request: requestDetail,
    });
  },
);

router.post(
  "/received-requests/:requestId/review-request",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;

    if (req.body.continueButton) {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/decision`,
      );
    } else if (req.body.returnButton) {
      return res.redirect("/manage-shares/review-summary");
    }
  },
);

router.get(
  "/received-requests/:requestId/decision",
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;

    res.render("../views/supplier/decision.njk", {
      backLink,
      requestId,
    });
  },
);

router.post(
  "/received-requests/:requestId/decision",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;

    const decision = req.body.decision;

    if (decision === "return") {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/return-request`,
      );
    }

    if (decision === "approve") {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/declaration`,
      );
    }

    if (decision === "reject") {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/reject-request`,
      );
    }

    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/declaration",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;
    res.render("../views/supplier/declaration.njk", {
      requestId,
    });
  },
);

router.post(
  "/received-requests/:requestId/declaration",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;

    if (req.body.acceptButton) {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/accept-request`,
      );
    }
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/accept-request",
  (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;
    const requestData = req.session.acquirerForms;

    if (!requestData) {
      return res.status(404).send("Request data not found");
    }

    res.render("../views/supplier/accept-request.njk", {
      backLink,
      requestId,
      requestingOrg: requestData.requestingOrg,
      requesterEmail: requestData.requesterEmail,
    });
  },
);

router.post(
  "/received-requests/:requestId/accept-request",
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

router.post(
  "/received-requests/:requestId/decision",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;

    const decision = req.body.decision;

    if (decision === "return") {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/return-request`,
      );
    }

    if (decision === "approve") {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/declaration`,
      );
    }

    if (decision === "reject") {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/reject-request`,
      );
    }

    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/declaration",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;
    res.render("../views/supplier/declaration.njk", {
      requestId,
    });
  },
);

router.post(
  "/received-requests/:requestId/declaration",
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;

    if (req.body.acceptButton) {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/accept-request`,
      );
    }
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/accept-request",
  (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;
    const requestData = req.session.acquirerForms;

    if (!requestData) {
      return res.status(404).send("Request data not found");
    }

    res.render("../views/supplier/accept-request.njk", {
      backLink,
      requestId,
      requestingOrg: requestData.requestingOrg,
      requesterEmail: requestData.requesterEmail,
    });
  },
);

router.post(
  "/received-requests/:requestId/accept-request",
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/reject-request",
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;
    const requestData = req.session.acquirerForms;

    if (!requestData) {
      return res.status(404).send("Request data not found");
    }

    res.render("../views/supplier/reject-request.njk", {
      backLink,
      requestId,
      requestingOrg: requestData.requestingOrg,
    });
  },
);

router.post(
  "/received-requests/:requestId/reject-request",
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/return-request",
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;
    const requestData = req.session.acquirerForms;

    if (!requestData) {
      return res.status(404).send("Request data not found");
    }

    res.render("../views/supplier/return-request.njk", {
      backLink,
      requestId,
      requestingOrg: requestData.requestingOrg,
    });
  },
);

router.post(
  "/received-requests/:requestId/return-request",
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

// Routes for request outcomes

router.get("/request-accepted", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/request-accepted.njk", {
    backLink,
  });
});

router.get("/request-rejected", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/request-rejected.njk", {
    backLink,
  });
});

export default router;
