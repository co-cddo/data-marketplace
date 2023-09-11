import express, { Request, Response } from "express";
import { DateStep, ManageShareTableRow } from "../types/express";
import axios from "axios";
const router = express.Router();

const URL = `${process.env.API_ENDPOINT}/manage-shares/received-requests`

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateObject(dateObj: { day: string, month: string, year: string }): string {
  const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
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

router.get("/created-requests", async (req: Request, res: Response) => {
  const acquirerForms = req.session.acquirerForms || {};
  const backLink = req.headers.referer || "/";

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const allTableRows: {
    pending: ManageShareTableRow[][];
    submitted: ManageShareTableRow[][];
    completed: ManageShareTableRow[][];
  } = {
    pending: [],
    submitted: [
      [{ text: "There are no submitted data share requests.", colspan: 5 }],
    ],
    completed: [
      [{ text: "You have not completed any data share requests.", colspan: 5 }],
    ],
  };

  if (Object.values(acquirerForms).length === 0) {
    allTableRows.pending.push([
      { text: "There are no pending data share requests.", colspan: 5 },
    ]);
  } else {
    for (const [, formData] of Object.entries(acquirerForms)) {
      let formattedDate = "Unrequested";
      const dateValue = formData.steps.date.value as DateStep;

      if (dateValue.day && dateValue.month && dateValue.year) {
        const monthIndex = dateValue.month - 1;
        const monthName = monthNames[monthIndex];
        formattedDate = `${dateValue.day} ${monthName} ${dateValue.year}`;
      }

      const row: ManageShareTableRow[] = [
        {
          html: `<a href="/acquirer/${formData.dataAsset}/start">${formData.requestId}</a>`,
        },
        { text: formData.assetTitle },
        { text: formData.ownedBy },
        { text: formattedDate },
        {
          html: `<span class="govuk-tag ${getStatusClass(formData.status)}">${
            formData.status
          }</span>`,
        },
      ];

      allTableRows.pending.push(row);
    }
  }

  res.render("../views/supplier/created-requests.njk", {
    backLink,
    acquirerForms,
    getStatusClass,
    allTableRows: allTableRows,
  });
});


router.get("/received-requests", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/manage-shares";

  const response = await axios.get(URL, { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } });
  const receivedTableRows = [];
  // console.log(response)
  if (response.data && response.data.length > 0) {
    for (const request of response.data) {
      // Format the received date
      request.received = formatDate(request.received);
      
      // Format the "Needed by" date
      if (request.sharedata && request.sharedata.steps && request.sharedata.steps.date) {
        const dateObj = request.sharedata.steps.date.value;
        request.sharedata.steps.date.formattedValue = formatDateObject(dateObj);
      }
      
      const row = [
        { html: `<a href="/manage-shares/received-requests/${request.requestId}">${request.requestId}</a>` }, 
        { text: request.requesterEmail },
        { text: request.assetTitle },
        { text: request.received },
        { text: request.sharedata.steps.date.formattedValue },
        { html: `<span class="govuk-tag ${getStatusClass(request.status)}">${request.status}</span>` },
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

router.get("/received-requests/:resourceId", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/manage-shares/received-requests/";
  const resourceId = req.params.resourceId;
  
  try {
    const requestDetail = await axios.get(`${URL}/${resourceId}`, { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } });

    if (!requestDetail.data) {
        return res.status(404).send('Request not found');
    }

    requestDetail.data.received = formatDate(requestDetail.data.received);

    res.render("../views/supplier/review-summary.njk", {
      backLink,
      request: requestDetail.data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.post("/received-requests/:resourceId", async (req: Request, res: Response) => {
  const resourceId = req.params.resourceId;
  res.redirect(`/manage-shares/received-requests/${resourceId}/review-request`);
});

router.get("/received-requests/:resourceId/review-request", async (req: Request, res: Response) => { 
  const resourceId = req.params.resourceId;
  const requestDetail = await axios.get(`${URL}/${resourceId}`, { headers: { Authorization: `Bearer ${req.cookies.jwtToken}` } });

  if (!requestDetail.data) {
    return res.status(404).send('Request not found');
}

  res.render("../views/supplier/review-request.njk", {
    request: requestDetail.data
  });
});

router.post("/received-requests/:resourceId/review-request", async (req: Request, res: Response) => {
  const resourceId = req.params.resourceId;

  if (req.body.continueButton) {
    console.log("I CONTINUED")      // PAGE here doesnt render decision will need to check this out
    return res.redirect(`/manage-shares/received-requests/${resourceId}/decision`);
  } else if (req.body.returnButton) {
    return res.redirect("/manage-shares/review-summary");
  }
});

router.get("/received-requests/:resourceId/decision", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  const resourceId = req.params.resourceId;

  res.render("../views/supplier/decision.njk", {
    backLink,
    resourceId
  });
});

router.post("/received-requests/:resourceId/decision", async (req: Request, res: Response) => {
  const resourceId = req.params.resourceId;

  const decision = req.body.decision;

  if (decision === "return") {
    return res.redirect("/manage-shares/return-request");
  }

  if (decision === "approve") {
    return res.redirect(`/manage-shares/received-requests/${resourceId}/declaration`);
  }

  if (decision === "reject") {
    return res.redirect("/manage-shares/reject-request");
  }

  return res.redirect("/manage-shares/received-requests");
});

router.get("/received-requests/:resourceId/declaration", async (req: Request, res: Response) => {
  if (req.body.continueButton) {
    const resourceId = req.params.resourceId;
    return res.redirect(`/manage-shares/received-requests/${resourceId}/decision`);
  }
});

router.post("/received-requests/:resourceId/declaration", async (req: Request, res: Response) => {
  const resourceId = req.params.resourceId;

  if (req.body.acceptButton) {
    return res.redirect(`/manage-shares/received-requests/${resourceId}/accept-request`);
  }
  return res.redirect("/manage-shares/received-requests");
});

router.get("/request-accepted", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";

  res.render("../views/supplier/request-accepted.njk", {
    backLink
  });
});


router.get("/reject-request", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/return-request.njk", {
    backLink,
  });
});



router.post("/reject-request", async (req: Request, res: Response) => {
  return res.redirect("/manage-shares/received-requests");
});

router.get("/return-request", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/return-request.njk", {
    backLink,
  });
});

router.post("/return-request", async (req: Request, res: Response) => {
  return res.redirect("/manage-shares/received-requests");
});



router.get("/accept-request", async (req: Request, res: Response) => {
  const backLink = req.headers.referer || "/";
  res.render("../views/supplier/accept-request.njk", {
    backLink,
  });
});

router.post("/accept-request", async (req: Request, res: Response) => {
  return res.redirect("/manage-shares/received-requests");
});


export default router;
