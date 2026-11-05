import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Auth API Endpoints", () => {
  const testUser = {
    name: "Aman Sharma",
    email: `aman_${Date.now()}@test.com`,
    password: "Password123!",
    address: {
      street: "123 Green Park",
      city: "New Delhi",
      pincode: "110016",
    },
  };

  it("POST /api/auth/signup - should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.accessToken).toBeDefined();
  });

  it("POST /api/auth/signup - should reject duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login - should authenticate user and return tokens", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("POST /api/auth/login - should reject invalid password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("GET /api/health - should return 200 OK", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });
});
