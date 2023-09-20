import request from "supertest";
import app from "../src/app";

describe("GET /learn", () => {
  it('should respond as expected"', async () => {
    const response = await request(app).get("/learn");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Data Marketplace");
  });

  it('should respond as expected when accessing data-sharing-arrangements"', async () => {
    const response = await request(app).get("/learn/data-sharing-arrangements");
    expect(response.status).toBe(200);
    expect(response.text).toContain("data share request");
  });

  it('should respond as expected when accessing data-sharing-questions"', async () => {
    const response = await request(app).get("/learn/data-sharing-questions");
    expect(response.status).toBe(200);
    expect(response.text).toContain("questions for a data share request");
  });

  it('should respond as expected when accessing publish-data-descriptions-questions"', async () => {
    const response = await request(app).get("/learn/articles/publish-data-descriptions-questions");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Questions you will be asked");
  });

  it('should respond as expected when accessing adding-a-single-data-asset"', async () => {
    const response = await request(app).get("/learn/articles/adding-a-single-data-asset");
    expect(response.status).toBe(200);
    expect(response.text).toContain("add a data description");
  });

  it('should respond as expected when accessing guidance-on-publish"', async () => {
    const response = await request(app).get("/learn/guidance-on-publish");
    expect(response.status).toBe(200);
    expect(response.text).toContain("publish descriptions of data");
  });

  it('should respond as expected when accessing adding-a-CSV-file"', async () => {
    const response = await request(app).get("/learn/articles/adding-a-CSV-file");
    expect(response.status).toBe(200);
    expect(response.text).toContain("CSV file");
  });
  
});