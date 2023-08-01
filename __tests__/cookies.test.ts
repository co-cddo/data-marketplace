import request from "supertest";
import app from "../src/app";

describe("POST /cookie-settings", () => {
  test("should set cookie_policy and user_interacted cookies when accepting cookies", async () => {
    const response = await request(app)
      .post("/cookie-settings")
      .send({ cookies: "accept" });

    expect(response.status).toBe(200);
    expect(response.header["set-cookie"][0]).toContain(
      "cookie_policy=%257B%2522essential%2522%253Atrue%252C%2522extra%2522%253Afalse%257D",
    );
    expect(response.header["set-cookie"][1]).toContain(
      "cookie_policy=%257B%2522essential%2522%253Atrue%252C%2522extra%2522%253Atrue%257D",
    );
    expect(response.header["set-cookie"][2]).toContain("user_interacted=true");

    const response2 = await request(app)
      .post("/cookie-settings")
      .send({ cookies: "reject" });

    expect(response2.status).toBe(200);
    expect(response2.header["set-cookie"][0]).toContain(
      "cookie_policy=%257B%2522essential%2522%253Atrue%252C%2522extra%2522%253Afalse%257D",
    );
    expect(response2.header["set-cookie"][1]).toContain(
      "cookie_policy=%257B%2522essential%2522%253Atrue%252C%2522extra%2522%253Afalse%257D",
    );
    expect(response2.header["set-cookie"][2]).toContain("user_interacted=true");
  });
});
