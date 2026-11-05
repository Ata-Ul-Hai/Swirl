// good practice to name all the constants in capital letter snake case

export const CDN_URL = "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

export const LOGO_URL =
  "https://www.logodesign.net/logo/smoking-burger-with-lettuce-3624ld.png";

export const MENU_API =
  "https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=28.5488579&lng=77.2900505&restaurantId=";

// API base URL configured via VITE_API_BASE_URL (points to Render in production, relative fallback in local/Vercel)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const RESTAURANTS_API = `${API_BASE_URL}/api/restaurants`;

