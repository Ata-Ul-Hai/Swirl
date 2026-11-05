# Swirl: k6 High-Concurrency Load Testing

This directory contains automated stress and load testing scripts built with [k6](https://k6.io/) to evaluate Swirl's high-concurrency order flow, rate limiting, and response latency.

## 🎯 Simulated User Scenario (`order-flow.js`)
The test executes a realistic end-to-end customer journey:
1. `GET /api/restaurants`: Browse restaurant catalog.
2. `GET /api/restaurants?search=Subway`: Search restaurants and cuisines.
3. `GET /api/restaurants/:id/menu`: Fetch categories and items (tests Redis caching).
4. `POST /api/auth/signup`: Dynamic customer registration and token generation.
5. `PUT /api/cart`: Synchronize persistent cart state.
6. `POST /api/orders`: Create order with Haversine distance-based delivery fee and 5% GST computation.
7. `GET /api/orders/:id`: Real-time order tracker status polling.

## 📊 Default Thresholds
- **Latency (p95)**: < 500ms
- **Failure Rate**: < 1%

---

## 🚀 Running the Load Test

### 1. Install k6
- **macOS (Homebrew)**:
  ```bash
  brew install k6
  ```
- **Linux (Debian/Ubuntu)**:
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update && sudo apt-get install k6
  ```

### 2. Run Locally against Express Backend
Make sure your backend is running (`npm run server:dev` on port 5000):
```bash
k6 run load-tests/order-flow.js
```

### 3. Run against Remote Deployment (e.g. Render / Production)
Pass the `BASE_URL` environment flag:
```bash
k6 run -e BASE_URL=https://swirl-api.onrender.com load-tests/order-flow.js
```

### 4. Custom Virtual Users & Duration
Override stages from the CLI:
```bash
k6 run --vus 50 --duration 1m load-tests/order-flow.js
```
