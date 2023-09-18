import axios from "axios";
import { NextFunction, Request, Response } from "express";

export const createAbacMiddleware =
  (target_type: string, action: string, errorMessage: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    let target_id;
    if (target_type === "organisation") {
      target_id = req.user.organisation?.slug || "";
    } else {
      // The only target_types are organisation or asset.
      // If it's asset, get the ID from the path params
      target_id = req.params.resourceID;
    }
    if (!target_id) {
      return res.render("error.njk", {
        messageTitle: "Permissions error",
        messageBody: `ID: ${target_id} for target_type: ${target_type} is not valid.`,
      });
    }

    try {
      const abacResponse = await axios.get(
        `${process.env.API_ENDPOINT}/users/permission/${target_type}/${target_id}/${action}`,
        {
          headers: { Authorization: `Bearer ${req.cookies.jwtToken}` },
        },
      );
      const isAllowed: boolean = abacResponse.data;
      if (!isAllowed) {
        return res.render("error.njk", {
          messageTitle: "Permissions error",
          messageBody: errorMessage,
        });
      }
      next();
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
  };
