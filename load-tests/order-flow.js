import http from "k6/http";
import { check, sleep, group } from "k6";

// Target host can be passed via: k6 run -e BASE_URL=http://localhost:5000 load-tests/order-flow.js
const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export const options = {
  stages: [
    { duration: "15s", target: 10 }, // Warm-up
    { duration: "30s", target: 30 }, // Peak sustained load
    { duration: "15s", target: 0 },  // Cool-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests under 500ms
    http_req_failed: ["rate<0.01"],   // Error rate under 1%
  },
};

export default function () {
  const uniqueId = `${Date.now()}_${__VU}_${__ITER}`;
  let token = "";
  let restaurantId = "250900"; // Subway from seed data

  // 1. BROWSE CATALOG
  group("01_Browse_Catalog", () => {
    const res = http.get(`${BASE_URL}/api/restaurants`);
    check(res, {
      "status is 200": (r) => r.status === 200,
      "restaurants returned": (r) => r.json("data.length") > 0,
    });
    sleep(1);
  });

  // 2. SEARCH CUISINES
  group("02_Search_Restaurants", () => {
    const res = http.get(`${BASE_URL}/api/restaurants?search=Subway`);
    check(res, {
      "status is 200": (r) => r.status === 200,
      "search found matches": (r) => r.json("data.length") > 0,
    });
    sleep(1);
  });

  // 3. FETCH MENU
  group("03_Fetch_Restaurant_Menu", () => {
    const res = http.get(`${BASE_URL}/api/restaurants/${restaurantId}/menu`);
    check(res, {
      "menu status is 200": (r) => r.status === 200,
      "has categories": (r) => r.json("data.categories.length") > 0,
    });
    sleep(1);
  });

  // 4. AUTHENTICATE CUSTOMER
  group("04_Customer_Auth", () => {
    const payload = JSON.stringify({
      name: `K6 User ${uniqueId}`,
      email: `k6_${uniqueId}@swirlload.test`,
      password: "TestPassword123!",
      role: "User",
      address: {
        street: "42 Lodhi Road",
        city: "New Delhi",
        pincode: "110003",
        location: { type: "Point", coordinates: [77.2285, 28.5916] },
      },
    });

    const headers = { "Content-Type": "application/json" };
    const res = http.post(`${BASE_URL}/api/auth/signup`, payload, { headers });

    check(res, {
      "auth status is 201": (r) => r.status === 201,
      "token received": (r) => r.json("accessToken") !== undefined,
    });

    if (res.status === 201) {
      token = res.json("accessToken");
    }
  });

  // 5. SYNC CART & PLACE ORDER (Authenticated)
  if (token) {
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    group("05_Sync_Cart", () => {
      const cartPayload = JSON.stringify({
        restaurantId,
        restaurantName: "Subway",
        items: [
          {
            itemId: "99807126",
            name: "Classic Sub",
            priceSnapshotted: 220,
            quantity: 2,
            variant: "6 inch",
          },
        ],
      });

      const res = http.put(`${BASE_URL}/api/cart`, cartPayload, { headers: authHeaders });
      check(res, {
        "cart synced": (r) => r.status === 200,
      });
      sleep(1);
    });

    group("06_Checkout_Place_Order", () => {
      const orderPayload = JSON.stringify({
        restaurant: {
          id: restaurantId,
          name: "Subway",
        },
        items: [
          {
            itemId: "99807126",
            name: "Classic Sub",
            priceSnapshotted: 220,
            quantity: 2,
            variant: "6 inch",
          },
        ],
        deliveryAddress: {
          street: "42 Lodhi Road",
          city: "New Delhi",
          pincode: "110003",
          location: {
            type: "Point",
            coordinates: [77.2285, 28.5916],
          },
        },
      });

      const res = http.post(`${BASE_URL}/api/orders`, orderPayload, { headers: authHeaders });
      check(res, {
        "order created 201": (r) => r.status === 201,
        "pricing calculated": (r) => r.json("data.itemTotal") === 440,
        "order status is placed": (r) => r.json("data.status") === "placed",
      });

      if (res.status === 201) {
        const orderId = res.json("data.id");
        // Poll order status
        const trackRes = http.get(`${BASE_URL}/api/orders/${orderId}`, { headers: authHeaders });
        check(trackRes, {
          "order tracking 200": (r) => r.status === 200,
        });
      }
    });
  }

  sleep(1);
}
