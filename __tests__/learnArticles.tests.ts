import request from "supertest";
import app from "../src/app";

describe("GET /learn/articles", () => {

  it('should respond as expected', async () => {
    const response = await request(app).get("/learn/articles/sign-in-process");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Sign-in process");
  });

  it('should respond as expected when accessing data-sharing-arrangements', async () => {
    const response = await request(app).get("/learn/articles/data-sharing-arrangements");
    expect(response.status).toBe(200);
    expect(response.text).toContain("data share request");
  });

  it('should respond as expected when accessing data-sharing-questions', async () => {
    const response = await request(app).get("/learn/articles/data-sharing-questions");
    expect(response.status).toBe(200);
    expect(response.text).toContain("questions for a data share request");
  });

  it('should respond as expected when accessing publish-data-descriptions-questions', async () => {
    const response = await request(app).get("/learn/articles/publish-data-descriptions-questions");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Questions you will be asked");
  });

  it('should respond as expected when accessing adding-a-single-data-asset', async () => {
    const response = await request(app).get("/learn/articles/adding-a-single-data-asset");
    expect(response.status).toBe(200);
    expect(response.text).toContain("add a data description");
  });

  it('should respond as expected when accessing guidance-on-publish', async () => {
    const response = await request(app).get("/learn/articles/guidance-on-publish");
    expect(response.status).toBe(200);
    expect(response.text).toContain("publish descriptions of data");
  });
  
  it('should respond as expected when accessing adding-a-CSV-file', async () => {
    const response = await request(app).get("/learn/articles/adding-a-CSV-file");
    expect(response.status).toBe(200);
    expect(response.text).toContain("CSV file");
  });
  
   it('should respond as expected when accessing about Essential-Shared-Data-Assets', async () => {
    const response = await request(app).get("/learn/articles/esda");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Using metadata to describe Essential");
  });

  it('should respond as expected when accessing dcat', async () => {
    const response = await request(app).get("/learn/articles/dcat");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Using metadata to describe data assets");
  });
});
