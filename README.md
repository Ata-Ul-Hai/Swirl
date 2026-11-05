# Swirl

> 🍔 **A Modern, Full-Stack MERN Food Delivery & Restaurant Management Platform**

Swirl is a complete food ordering and delivery ecosystem built with the **MERN Stack** (MongoDB, Express, React 19, Node.js) in a clean monorepo architecture. It features a consumer-facing ordering flow with distance-based pricing, real-time live order tracking via Socket.io, and a dedicated Restaurant Partner control panel with role-based access control (RBAC).

> 📘 **Looking for Deep Architecture Details?**  
> Check out [ARCHITECTURE.md](ARCHITECTURE.md) for full Architecture Decision Records (ADRs), system sequence diagrams, data models, edge-case mitigations, and the phased implementation roadmap.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **High-Converting Landing Page**: Modern hero section, dynamic food search with URL query forwarding, trending cuisine filters, trust statistics, and customer favorites preview.
- **Restaurant Catalog & Smart Search**: Real-time restaurant search by name, cuisine, locality, and rating filter with smooth pagination.
- **Interactive Restaurant Menus**: Nested category accordions, dietary badges (Veg/Non-Veg), item descriptions, and pricing.
- **Server-Synced Persistent Cart**: Cart state synchronizes seamlessly across page reloads and devices, keyed to the user in MongoDB. Automatic cart reset when switching restaurants.
- **Haversine Distance Delivery Pricing**: Checkout dynamically computes delivery charges based on the exact Haversine distance between restaurant and delivery address, plus 5% GST and frozen item pricing.
- **Real-Time Live Order Tracker**: Follow orders in real time at `/orders/:id` powered by bidirectional WebSockets (Socket.io) with stage progression (`placed` → `confirmed` → `preparing` → `out_for_delivery` → `delivered`).

### 🔐 Authentication & Security
- **Dual-Token JWT Authentication**: Short-lived access tokens (15m) paired with secure HTTP-only refresh cookies (7d).
- **Silent Token Rotation**: Axios request/response interceptors automatically refresh expired access tokens transparently in the background without interrupting the user.
- **User Profiles & Embedded Addresses**: MongoDB user documents with encrypted passwords (bcrypt) and multiple saved delivery addresses.

### 🏪 Restaurant Partner Panel (`/restaurant`)
- **Dedicated Kitchen Dashboard**: Restaurant owners log in to manage incoming orders in real time.
- **Live Dispatch Alerts**: Immediate Socket.io audio/visual alerts when a new customer order arrives.
- **Order Action Workflow**: Accept orders, reject orders, update kitchen preparation timers (`prepTimeMinutes`), and push live status changes to customer screens.
- **Live Menu Availability**: Toggle item in-stock/out-of-stock status instantly.
- **Strict RBAC & Resource Ownership**: Enforces role hierarchy (`User`, `RestaurantOwner`, `Admin`). Owner A is cryptographically and logically prohibited from viewing or altering Owner B's orders or menus.

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 19** & **Vite 8**
- **React Router v7** (declarative routing and nested layouts)
- **Redux Toolkit** (global cart and UI state management)
- **Tailwind CSS v4** (modern utility-first styling)
- **Socket.io Client** (real-time order dispatch updates)
- **Axios** (custom instance with automatic token refresh interceptor)
- **Vitest** & **React Testing Library** (component and integration tests)

### Backend (`server/`)
- **Node.js** & **Express**
- **MongoDB** & **Mongoose** (schema validation, indexing, and GeoJSON coordinates)
- **Socket.io** (authenticated WebSocket connections with room partitioning)
- **JSON Web Tokens (JWT)** & **bcryptjs**
- **Zod** (runtime schema validation for requests)
- **Haversine Formula** (geodesic distance calculations)

### Deployment & Serverless Fallback
- **Vercel Monorepo Deployment**: Root `vercel.json` and package workspace integration.
- **Cross-Platform Native Rolldown Bindings**: Pre-configured Linux/macOS binary bindings for reliable Vite 8 production builds on cloud CI.
- **Resilient Serverless API Fallback**: Root `/api` handlers serving seed data if an external database instance is unlinked during edge deployments.

---

## 📁 Repository Structure

```text
Swirl/
├── api/                             # Vercel serverless API handlers & fallbacks
│   ├── restaurants.js               # GET /api/restaurants handler (search, rating, pagination)
│   └── restaurants/[id]/menu.js     # GET /api/restaurants/:id/menu handler
├── client/                          # React 19 Frontend Workspace
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── LandingPage.jsx      # Home landing page with hero & popular cuisines
│   │   │   ├── Body.jsx             # Restaurant catalog browsing & filter bar
│   │   │   ├── RestaurantPanel.jsx  # Restaurant owner control panel (/restaurant)
│   │   │   ├── OrderTracker.jsx     # Live real-time order tracking stepper (/orders/:id)
│   │   │   ├── Cart.jsx             # Cart & checkout drawer with distance pricing
│   │   │   ├── AuthModal.jsx        # Login & signup modal
│   │   │   ├── Header.jsx           # Responsive navbar with cart count & partner link
│   │   │   └── ...                  # RestaurantCard, ItemList, Shimmer, Error, etc.
│   │   └── utils/                   # Utilities, context, API client, Redux store
│   │       ├── api.js               # Axios instance with refresh interceptor
│   │       ├── socket.js            # Socket.io connection helper
│   │       ├── cartSlice.jsx        # Redux cart slice with server sync thunks
│   │       └── UserContext.jsx      # Auth context (user, login, logout)
│   ├── package.json                 # Client dependencies & Vite configuration
│   └── vite.config.js               # Vite build configuration with proxy
├── server/                          # Express + Mongoose Backend Workspace
│   ├── data/
│   │   └── restaurants.json         # High-fidelity seed catalog
│   ├── scripts/
│   │   └── fetchSeedData.js         # Seed data extraction and normalization script
│   ├── src/
│   │   ├── controllers/             # Request handlers (auth, cart, order, restaurant, panel)
│   │   ├── middleware/              # requireAuth, requireRole, errorHandler, validate
│   │   ├── models/                  # Mongoose models (User, Restaurant, Menu, Cart, Order)
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/                # Business logic and database operations
│   │   ├── utils/                   # Haversine, ApiError, asyncHandler
│   │   ├── socket.js                # Socket.io server initialization & rooms
│   │   ├── app.js                   # Express app configuration & middlewares
│   │   └── index.js                 # HTTP server bootstrap & DB connection
│   └── package.json                 # Server dependencies
├── ARCHITECTURE.md                  # Detailed Architecture Decision Records (ADRs)
├── vercel.json                      # Vercel deployment configuration
└── package.json                     # Monorepo root workspace configuration
```

---

## 🚦 Main Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Brand homepage with search bar, popular food pills, and trust stats |
| `/restaurants` | `Body.jsx` | Restaurant catalog with instant search, top-rated filter, and cards |
| `/restaurants/:resId` | `RestaurantMenu.jsx` | Restaurant menu with accordion categories and item add/customization |
| `/cart` | `Cart.jsx` | Cart view, address selector, delivery fee breakdown, and checkout |
| `/orders/:id` | `OrderTracker.jsx` | Customer real-time order status stepper with live WebSocket updates |
| `/restaurant` | `RestaurantPanel.jsx` | Restaurant owner dashboard (live orders, prep time, menu toggling) |
| `/grocery` | `Grocery.jsx` | Lazy-loaded grocery store demo |
| `/about` | `About.jsx` | About Swirl platform |
| `/contact` | `Contact.jsx` | Customer support and contact information |

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

### 1. Clone & Install Dependencies
Clone the repository and install all workspace dependencies from the root:
```bash
git clone https://github.com/Ata-Ul-Hai/Swirl.git
cd Swirl
npm install
```

### 2. Environment Variables
Create a `.env` file in `server/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/swirl
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
CLIENT_URL=http://localhost:5173
```

*(Optional)* Create a `.env` in `client/` if using custom backend endpoints:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Seed Database
Populate your database with curated restaurants and menus:
```bash
npm run seed:fetch
```

### 4. Run the Development Servers
In separate terminal windows, start the backend and frontend:

**Start Express & Socket.io Server:**
```bash
npm run server:dev
```
*Backend runs at `http://localhost:5000`.*

**Start React/Vite Client:**
```bash
npm run client
```
*Frontend runs at `http://localhost:5173`.*

---

## 🧪 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run build` | Builds the React frontend application for production via root workspace |
| `npm run client` | Starts the Vite development server in `client/` |
| `npm run client:build` | Compiles the production build for the client |
| `npm run client:test` | Runs the Vitest test suite |
| `npm run server` | Starts the production Node.js server |
| `npm run server:dev` | Starts the server in development mode with auto-reload |
| `npm run seed:fetch` | Runs the seed data normalization and ingestion script |

---

## 🚢 Deployment (Vercel)

The repository is configured for automated Vercel deployment:
- **Build Command**: `npm run build --workspace=client`
- **Output Directory**: `client/dist`
- **Serverless API**: Handled automatically via `/api` routes with built-in seed fallback.
- **Rolldown Native Bindings**: Explicitly declared in `client/package.json` to prevent Linux x64 binding errors during Vite 8 builds.

---

## 📄 License
MIT © Ata-Ul-Hai
