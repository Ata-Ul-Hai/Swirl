import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import React, { lazy, Suspense } from "react";
import AppLayout from "./components/AppLayout.jsx";
import RestaurantMenu from './components/RestaurantMenu.jsx'
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Cart from "./components/Cart.jsx";
import Error from "./components/Error.jsx";
import Shimmer from "./components/Shimmer.jsx";
import Header from "./components/Header.jsx"
import Body from "./components/Body.jsx"
// import Grocery from "./components/Grocery.jsx";

// Chunking
// Lazy Loading
// Code Splitting
// Dynamic Bundling
// Dynamic Loading
// On Deman Loading

const Grocery = lazy(() => import("./components/Grocery.jsx"))


const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <Error />,
    children: [ {
      path: "/",
      element: <Body />,
    },
    {
      path: '/about',
      element: <About />
    },
    {
      path: '/restaurants/:resId',
      element: <RestaurantMenu />
    },
    {
      path: '/contact',
      element: <Contact />
    },
    {
      path : '/cart',
      element : <Cart />
    },
    {
      path : '/grocery',
      element : (
      <Suspense fallback={<Shimmer />}><Grocery /></Suspense>
     )
    }
  
  ]
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App
