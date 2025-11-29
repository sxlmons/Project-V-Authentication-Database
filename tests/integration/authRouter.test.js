/**
 * Auth Router Integration Tests
 * - Verifies that all auth endpoints are reachable
 * - Confirms routing is correctly configured for signup, login, refreshToken, and me
 * - Ensures endpoints return valid HTTP status codes when hit
 */

import express from "express";
import router from "../../api_endpoints/controllers/auth_router.js";
import request from "supertest";

const app = express();
app.use(express.json());
app.use("/auth", router);

describe("Auth Router Integration", () => {
  it("POST /auth/signup → should exist", async () => {
    const res = await request(app).post("/auth/signup").send({});
    expect([200, 400, 500]).toContain(res.statusCode);
  });

  it("POST /auth/login → should exist", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect([200, 400, 500]).toContain(res.statusCode);
  });

  it("POST /auth/refreshToken → should exist", async () => {
    const res = await request(app).post("/auth/refreshToken").send({});
    expect([200, 400, 500]).toContain(res.statusCode);
  });

  it("GET /auth/me → should exist", async () => {
    const res = await request(app).get("/auth/me").set("Authorization", "Bearer mockToken");
    expect([200, 401]).toContain(res.statusCode);
  });
});
