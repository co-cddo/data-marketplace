import express, { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

const router = express.Router();

interface CatalogueItem {
  id: string;
  organisation: {
    title: string;
    id: string;
    acronym: string;
    homepage: string;
  };
  title: string;
  description: string;
  created: string;
  type: string;
  modified: string;
}

interface Facets {
  topics: Array<{ title: string; id: string }>;
  organisations: Array<{ title: string; id: string }>;
  assetTypes: Array<{ title: string; id: string }>;
}

interface CatalogueObject {
  data: CatalogueItem[];
  facets: Facets;
}

async function get_resource(resourceID: string) {
  const catalogueData = await fs.readFile(
    path.resolve(__dirname, "../data/catalogue.json"),
    "utf-8",
  );
  const catalogues: CatalogueObject[] = JSON.parse(catalogueData);
  return catalogues.find((catalogue) => catalogue.data[0].id === resourceID);
}

router.get("/:resourceID", async (req: Request, res: Response) => {
  const resourceID = req.params.resourceID;
  const resource = await get_resource(resourceID);
  res.render("resources.njk", { resource });
});
export default router;
