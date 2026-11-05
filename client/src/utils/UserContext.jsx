import { createContext } from "react";

const UserContext = createContext({
  loggedInUser: "Default user",
  user: null,
  isAuthenticated: false,
  setUserName: () => {},
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export default UserContext;
