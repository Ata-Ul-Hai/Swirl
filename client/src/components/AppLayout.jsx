import Header from "./Header.jsx";
import { Outlet } from "react-router";
import useOnlineStatus from "../utils/useOnlineState";
import UserContext from "../utils/UserContext";
import { useEffect, useState, useCallback, useRef, useContext } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import appStore from "../utils/appStore";
import api from "../utils/api";
import { setCart } from "../utils/cartSlice";

function CartSyncManager() {
  const dispatch = useDispatch();
  const cart = useSelector((store) => store.cart);
  const { user } = useContext(UserContext);
  const isInitialSync = useRef(true);

  // Load cart from server on mount / user login
  useEffect(() => {
    if (!user) return;

    api
      .get("/api/cart")
      .then((res) => {
        const serverCart = res.data?.data;
        if (serverCart && serverCart.items && serverCart.items.length > 0) {
          dispatch(setCart(serverCart));
        } else if (cart.items.length > 0) {
          api.put("/api/cart", cart).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        isInitialSync.current = false;
      });
  }, [user?.id, dispatch]);

  // Sync cart to server on state updates
  useEffect(() => {
    if (!user || isInitialSync.current) return;

    const timer = setTimeout(() => {
      api.put("/api/cart", cart).catch(() => {});
    }, 400);

    return () => clearTimeout(timer);
  }, [cart, user?.id]);

  return null;
}

function AppLayout() {
  const isOnline = useOnlineStatus();

  // Try restoring existing cached user
  const [user, setUser] = useState(() => {
    try {
      const cached = localStorage.getItem("authUser");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [userName, setUserName] = useState(() => {
    try {
      const cached = localStorage.getItem("authUser");
      return cached ? JSON.parse(cached).name : "Default user";
    } catch {
      return "Default user";
    }
  });

  const logout = useCallback(async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authUser");
      setUser(null);
      setUserName("Default user");
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    const { user: loggedInUser, accessToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("authUser", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setUserName(loggedInUser.name);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (name, email, password, address) => {
    const response = await api.post("/api/auth/signup", {
      name,
      email,
      password,
      address,
    });
    const { user: newUser, accessToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    setUser(newUser);
    setUserName(newUser.name);
    return newUser;
  }, []);

  // Sync session on mount with /api/auth/me (auto-refreshes if token expired)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    api
      .get("/api/auth/me")
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          setUserName(res.data.user.name);
          localStorage.setItem("authUser", JSON.stringify(res.data.user));
        }
      })
      .catch(() => {
        // Interceptor handles refresh failure
      });

    const handleAuthLogout = () => {
      setUser(null);
      setUserName("Default user");
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => {
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  return (
    <Provider store={appStore}>
      <UserContext.Provider
        value={{
          loggedInUser: userName,
          user,
          isAuthenticated: Boolean(user),
          setUserName,
          login,
          signup,
          logout,
        }}
      >
        <CartSyncManager />
        <div className="app">
          <Header isOnline={isOnline} />
          {isOnline ? (
            <Outlet />
          ) : (
            <h1>You Are Offline, lets do something else which is Cool!</h1>
          )}
        </div>
      </UserContext.Provider>
    </Provider>
  );
}

export default AppLayout;
