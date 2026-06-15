import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import App from './App.jsx'
import Menu from './components/Menu.jsx'
import Body from "./components/Body.jsx";
import About from './components/About.jsx'
import Contact from './components/Contact.jsx'
import Cart from "./components/Cart.jsx";
import Error from "./components/Error.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
      path: '/menu',
      element: <Menu />
    },
    {
      path: '/contact',
      element: <Contact />
    },
    {
      path : '/cart',
      element : <Cart />
    }
  
  ]
  }
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <RouterProvider router={router} />,
);
