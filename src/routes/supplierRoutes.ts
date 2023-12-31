import express, { NextFunction, Request, Response } from "express";
import {
  FormData,
  ShareRequestResponse,
  ShareRequestTable,
} from "../types/express";
import axios from "axios";
import { createAbacMiddleware } from "../middleware/ABACMiddleware";
import { shareRequestDetailMiddleware } from "../middleware/apiMiddleware";
import { replace } from "../helperFunctions/checkhelper";
import { capitalise, formatDate } from "../helperFunctions/stringHelpers";
import { checkAnswer } from "../helperFunctions/formHelper";
const router = express.Router();
const URL = `${process.env.API_ENDPOINT}/manage-shares`;

router.get("/", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/manage-shares.njk", {
    backLink,
  });
});

// Function to get the tag class based on the status value
function getCreatedRequestStatusClass(status: string): string {
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

const getReceivedRequestStatusClass = (status: string) => {
  switch (status) {
    case "AWAITING REVIEW":
      return "govuk-tag--red";
    case "IN REVIEW":
      return "govuk-tag--blue";
    default:
      return "govuk-tag--grey";
  }
};

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

    const acquirerForms: { [key: string]: FormData } = {};
    for (const s of response) {
      acquirerForms[s.sharedata.dataAsset] = s.sharedata;
    }

    const backLink = req.headers.referer || "/";

    const pendingRequests = response.filter((r) =>
      ["IN PROGRESS", "RETURNED", "NOT STARTED"].includes(r.status),
    );
    let pendingRows: ShareRequestTable = pendingRequests.map((r) => [
      {
        html:
          r.status === "RETURNED"
            ? `<a class="govuk-link" href="/acquirer/${
                r.sharedata.dataAsset
              }/check">${r.requestId.substring(0, 8)}... - View</a>`
            : `<a class="govuk-link" href="/acquirer/${
                r.sharedata.dataAsset
              }/start">${r.requestId.substring(0, 8)}... - View</a>`,
      },
      { text: r.assetTitle },
      { text: r.assetPublisher.title },
      {
        text: formatDate(r.neededBy),
      },
      {
        html: `<span class="govuk-tag ${getCreatedRequestStatusClass(
          r.status,
        )}">${r.status}</span>`,
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
        html: `${r.requestId.substring(0, 8)}... - View`,
      },
      { text: r.assetTitle },
      { text: r.assetPublisher.title },
      { text: formatDate(r.received) },
      { text: formatDate(r.neededBy) },
      {
        html: `<span class="govuk-tag ${getCreatedRequestStatusClass(
          r.status,
        )}">${r.status}</span>`,
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
        html: `<a class="govuk-link" href="/manage-shares/created-requests/${
          r.requestId
        }">${r.requestId.substring(0, 8)}... - View</a>`,
      },
      { text: r.assetTitle },
      { text: r.assetPublisher.title },
      {
        text:
          r.neededBy === "UNREQUESTED" ? "Unrequested" : formatDate(r.neededBy),
      },
      { text: formatDate(r.decisionDate as string) },
      {
        html: `<span class="govuk-tag ${getCreatedRequestStatusClass(
          r.status,
        )}">${r.status}</span>`,
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

router.get(
  "/created-requests/:requestId",
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/manage-shares/created-requests/";

    try {
      const requestDetail = req.shareRequest!;

      res.render("../views/acquirer/created-request-outcome.njk", {
        backLink,
        request: requestDetail,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

router.get(
  "/created-requests/:requestId/view-answers",
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || `/manage-shares/created-requests/`;

    try {
      const requestDetail = req.shareRequest!;

      res.render("../views/acquirer/created-request-view-full-request.njk", {
        request: requestDetail,
        sharedata: checkAnswer(requestDetail.sharedata),
        backLink,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

const reviewRequestAbacMiddleware = createAbacMiddleware(
  "organisation",
  "REVIEW_SHARE_REQUESTS",
  "review data share requests",
);

router.get(
  "/received-requests",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const backLink = req.headers.referer || "/manage-shares";

    let receivedRequests;
    try {
      receivedRequests = await axios.get(`${URL}/received-requests`, {
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
    const response = receivedRequests?.data as ShareRequestResponse[];
    const currentRequests = response.filter((r) =>
      ["AWAITING REVIEW", "IN REVIEW", "RETURNED"].includes(r.status),
    );

    let currentRows: ShareRequestTable = currentRequests.map((r) => [
      {
        html:
          r.status === "RETURNED"
            ? `<a class="govuk-link" href="/manage-shares/received-requests/${
                r.requestId
              }/outcome">${r.requestId.substring(0, 8)}... - View</a>`
            : `<a class="govuk-link" href="/manage-shares/received-requests/${
                r.requestId
              }">${r.requestId.substring(0, 8)}... - View</a>`,
      },
      { text: r.requestingOrg },
      { text: r.assetTitle },
      { text: formatDate(r.received) },
      { text: formatDate(r.neededBy) },
      {
        html: `<span class="govuk-tag ${getReceivedRequestStatusClass(
          r.status,
        )}">${r.status}</span>`,
      },
    ]);
    if (currentRows.length === 0) {
      currentRows = [
        [{ text: "There are no data share requests", colspan: 6 }],
      ];
    }

    const completedRequests = response.filter((r) =>
      ["ACCEPTED", "REJECTED"].includes(r.status),
    );
    let completedRows: ShareRequestTable = completedRequests.map((r) => [
      {
        html: `<a class="govuk-link" href="/manage-shares/received-requests/${
          r.requestId
        }/outcome">${r.requestId.substring(0, 8)}... - View</a>`,
      },
      { text: r.requestingOrg },
      { text: r.assetTitle },
      { text: formatDate(r.received) },
      { text: formatDate(r.decisionDate) },
      {
        html: `${capitalise(r.status)}`,
      },
    ]);
    if (completedRows.length === 0) {
      completedRows = [
        [{ text: "There are no data completed share requests", colspan: 6 }],
      ];
    }

    res.render("../views/supplier/received-requests.njk", {
      backLink,
      currentRows,
      completedRows,
    });
  },
);

router.get(
  "/received-requests/:requestId",
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/manage-shares/received-requests/";

    try {
      const requestDetail = req.shareRequest!;

      res.render("../views/supplier/review-summary.njk", {
        backLink,
        request: requestDetail,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

router.post(
  "/received-requests/:requestId",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;
    res.redirect(
      `/manage-shares/received-requests/${requestId}/review-request`,
    );
  },
);

router.get(
  "/received-requests/:requestId/review-request",
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  (req: Request, res: Response) => {
    const requestDetail = req.shareRequest!;

    res.render("../views/supplier/review-request.njk", {
      request: requestDetail,
      replacements: replace,
    });
  },
);

router.post(
  "/received-requests/:requestId/review-request",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.requestId;

    if (req.body.notes) {
      try {
        await axios.put(
          `${URL}/received-requests/${requestId}/review`,
          { notes: req.body.notes },
          {
            headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
          },
        );
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            `API ERROR - ${error.response?.status}: ${error.response?.statusText}`,
          );
          console.error(error.response?.data.detail);
        } else {
          console.error(error);
        }
        return next(error);
      }
    }

    if (req.body.continueButton) {
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/decision`,
      );
    } else if (req.body.returnButton) {
      return res.redirect(`/manage-shares/received-requests/${requestId}`);
    }
  },
);

router.get(
  "/received-requests/:requestId/decision",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;

    res.render("../views/supplier/decision.njk", {
      backLink,
      requestId,
      errorMessage: req.session.decisionErrors,
      selectedDecisionStatus: req.session.decision?.status,
      selectedDecisionNotes: req.session.decision?.notes,
    });
  },
);

router.post(
  "/received-requests/:requestId/decision",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.requestId;
    const decision = req.body.decision;

    const decisionErrors: { [key: string]: { text: string } } = {};

    if (!decision) {
      decisionErrors["decision"] = { text: "Select one option." };
    }

    if (decision === "return" && !req.body["return-with-comments"]) {
      decisionErrors["return-with-comments"] = { text: "Enter comments." };
    }

    if (Object.keys(decisionErrors).length > 0) {
      req.session.decisionErrors = decisionErrors;
      req.session.decision = {
        status: decision,
        notes: req.body["return-with-comments"] || "",
      };

      return res.redirect(
        `/manage-shares/received-requests/${requestId}/decision`,
      );
    }

    if (decision === "approve") {
      // This needs to be stored in the session so that we can access it again
      // after the Declaration page:
      req.session.decision = { status: "ACCEPTED", notes: req.body.approve };
      return res.redirect(
        `/manage-shares/received-requests/${requestId}/declaration`,
      );
    }

    let status, decisionNotes, redirectUrl;

    if (decision === "return") {
      status = "RETURNED";
      decisionNotes = req.body["return-with-comments"];
      redirectUrl = `/manage-shares/received-requests/${requestId}/return-request`;
    } else if (decision === "reject") {
      status = "REJECTED";
      decisionNotes = req.body.reject;
      redirectUrl = `/manage-shares/received-requests/${requestId}/reject-request`;
    } else {
      redirectUrl = "/manage-shares/received-requests";
    }

    try {
      await axios.put(
        `${URL}/received-requests/${requestId}/decision`,
        { status, decisionNotes },
        { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } },
      );
      // Clear the session data related to the decision to stop appearing when a decision has to be re-submitted
      delete req.session.decision;
      delete req.session.decisionErrors;
      return res.redirect(redirectUrl);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API ERROR - ${error.response?.status}: ${error.response?.statusText}`,
        );
        console.error(error.response?.data.detail);
      } else {
        console.error(error);
      }
      return next(error);
    }
  },
);

router.get(
  "/received-requests/:requestId/declaration",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;
    const backLink = `/manage-shares/received-requests/${requestId}/decision`;
    res.render("../views/supplier/declaration.njk", {
      backLink,
      requestId,
    });
  },
);

router.post(
  "/received-requests/:requestId/declaration",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.requestId;

    try {
      await axios.put(
        `${URL}/received-requests/${requestId}/decision`,
        {
          status: req.session.decision?.status,
          decisionNotes: req.session.decision?.notes,
        },
        { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } },
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `API ERROR - ${error.response?.status}: ${error.response?.statusText}`,
        );
        console.error(error.response?.data.detail);
      } else {
        console.error(error);
      }
      return next(error);
    }

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
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;

    res.render("../views/supplier/accept-request.njk", {
      backLink,
      requestId,
      requestingOrg: req.shareRequest?.requestingOrg,
      requesterEmail: req.shareRequest?.requesterEmail,
    });
  },
);

router.post(
  "/received-requests/:requestId/accept-request",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/reject-request",
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;

    res.render("../views/supplier/reject-request.njk", {
      backLink,
      requestId,
      requestingOrg: req.shareRequest?.requestingOrg,
    });
  },
);

router.post(
  "/received-requests/:requestId/reject-request",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/return-request",
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/";
    const requestId = req.params.requestId;

    res.render("../views/supplier/return-request.njk", {
      backLink,
      requestId,
      requestingOrg: req.shareRequest?.requestingOrg,
    });
  },
);

router.post(
  "/received-requests/:requestId/return-request",
  reviewRequestAbacMiddleware,
  async (req: Request, res: Response) => {
    return res.redirect("/manage-shares/received-requests");
  },
);

router.get(
  "/received-requests/:requestId/outcome",
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const backLink = req.headers.referer || "/manage-shares/received-requests/";

    try {
      const requestDetail = req.shareRequest!;

      res.render("../views/supplier/received-request-outcome.njk", {
        backLink,
        request: requestDetail,
        replacements: replace,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

router.get(
  "/received-requests/:requestId/view-answers",
  reviewRequestAbacMiddleware,
  shareRequestDetailMiddleware,
  async (req: Request, res: Response) => {
    const requestId = req.params.requestId;
    const backLink =
      req.headers.referer || `/manage-shares/received-requests/${requestId}`;

    try {
      const requestDetail = req.shareRequest!;

      res.render("../views/supplier/received-request-view-full-request.njk", {
        request: requestDetail,
        replacements: replace,
        backLink,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  },
);

export default router;
