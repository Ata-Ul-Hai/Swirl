import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Cart, Orders & Partner RBAC API", () => {
  let customerToken = "";
  let ownerToken = "";
  let otherOwnerToken = "";
  let restaurantId = "368180";

  beforeAll(async () => {
    // 1. Setup Customer
    const custRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test Customer",
        email: `cust_${Date.now()}@test.com`,
        password: "Password123!",
        role: "User",
        address: {
          street: "Connaught Place",
          city: "New Delhi",
          pincode: "110001",
          location: { type: "Point", coordinates: [77.2167, 28.6328] },
        },
      });
    customerToken = custRes.body.accessToken;

    // 2. Setup Restaurant Owner for restaurantId
    const ownerRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Owner A",
        email: `ownerA_${Date.now()}@test.com`,
        password: "Password123!",
        role: "RestaurantOwner",
        restaurantId,
      });
    ownerToken = ownerRes.body.accessToken;

    // 3. Setup Different Restaurant Owner
    const otherOwnerRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Owner B",
        email: `ownerB_${Date.now()}@test.com`,
        password: "Password123!",
        role: "RestaurantOwner",
        restaurantId: "999999",
      });
    otherOwnerToken = otherOwnerRes.body.accessToken;
  });

  it("PUT /api/cart - should sync items to cart with price snapshot", async () => {
    const res = await request(app)
      .put("/api/cart")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        restaurantId,
        items: [
          {
            itemId: "item_1",
            name: "Paneer Tikka",
            price: 250,
            quantity: 2,
            isVeg: true,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].priceSnapshotted).toBe(250);
  });

  it("POST /api/orders - should create an order with Haversine distance pricing and 5% GST", async () => {
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        restaurant: {
          id: restaurantId,
          name: "Pizza HutAmar Colony",
        },
        items: [
          {
            itemId: "item_1",
            name: "Paneer Tikka",
            priceSnapshotted: 250,
            quantity: 2,
            variant: "Regular",
          },
        ],
        deliveryAddress: {
          street: "12 Connaught Place",
          city: "New Delhi",
          pincode: "110001",
          location: {
            type: "Point",
            coordinates: [77.2167, 28.6328],
          },
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemTotal).toBe(500);
    expect(res.body.data.taxes).toBe(25); // 5% of 500
    expect(res.body.data.deliveryFee).toBeGreaterThanOrEqual(30);
    expect(res.body.data.status).toBe("placed");
  });

  it("GET /api/restaurant/:restaurantId/orders - should reject unauthorized customer with 403", async () => {
    const res = await request(app)
      .get(`/api/restaurant/${restaurantId}/orders`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it("GET /api/restaurant/:restaurantId/orders - should reject wrong owner (Owner B querying Owner A) with 403", async () => {
    const res = await request(app)
      .get(`/api/restaurant/${restaurantId}/orders`)
      .set("Authorization", `Bearer ${otherOwnerToken}`);

    expect(res.status).toBe(403);
  });

  it("GET /api/restaurant/:restaurantId/orders - should permit legitimate owner to fetch live orders", async () => {
    const res = await request(app)
      .get(`/api/restaurant/${restaurantId}/orders`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
