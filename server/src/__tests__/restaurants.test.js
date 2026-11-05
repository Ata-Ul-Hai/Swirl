import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Restaurants & Menus API", () => {
  it("GET /api/restaurants - should return paginated restaurants", async () => {
    const res = await request(app).get("/api/restaurants");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.pagination).toBeDefined();
  });

  it("GET /api/restaurants?search=Subway - should filter by name or cuisine", async () => {
    const res = await request(app).get("/api/restaurants?search=Subway");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const names = res.body.data.map((r) => r.info.name.toLowerCase());
    expect(names.some((n) => n.includes("subway"))).toBe(true);
  });

  it("GET /api/restaurants/:id/menu - should return menu categories and items", async () => {
    // Fetch first restaurant to get valid id
    const listRes = await request(app).get("/api/restaurants");
    const firstResId = listRes.body.data[0].info.id;

    const res = await request(app).get(`/api/restaurants/${firstResId}/menu`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.restaurantInfo).toBeDefined();
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });
});
