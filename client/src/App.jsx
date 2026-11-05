import { createBrowserRouter, RouterProvider } from "react-router";
import React, { lazy, Suspense } from "react";
import AppLayout from "./components/AppLayout.jsx";
import RestaurantMenu from "./components/RestaurantMenu.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Cart from "./components/Cart.jsx";
import Error from "./components/Error.jsx";
import Shimmer from "./components/Shimmer.jsx";
import Body from "./components/Body.jsx";
import LandingPage from "./components/LandingPage.jsx";
import RestaurantPanel from "./components/RestaurantPanel.jsx";
import OrderTracker from "./components/OrderTracker.jsx";

const Grocery = lazy(() => import("./components/Grocery.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/restaurants",
        element: <Body />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/restaurants/:resId",
        element: <RestaurantMenu />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/orders/:id",
        element: <OrderTracker />,
      },
      {
        path: "/restaurant",
        element: <RestaurantPanel />,
      },
      {
        path: "/restaurant/*",
        element: <RestaurantPanel />,
      },
      {
        path: "/grocery",
        element: (
          <Suspense fallback={<Shimmer />}>
            <Grocery />
          </Suspense>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
