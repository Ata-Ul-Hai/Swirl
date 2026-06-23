import Header from "./header";
import { Outlet } from "react-router";
import useOnlineStatus from "../utils/useOnlineState"
import UserContext from "../utils/UserContext";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import appStore from "../utils/AppStore";

function AppLayout() {
  const isOnline = useOnlineStatus()
  const [userName, setUserName] = useState()

  useEffect(()=>{
    setTimeout(() => {
      const data = {name: 'Ata Ul Hai'} 
      setUserName(data.name);
    },1000)
  },[])

  return (
    <Provider store={appStore}>
    <UserContext.Provider value={{loggedInUser: userName, setUserName}}>
      <div className="app">
        <Header isOnline = {isOnline}/>
        {
          isOnline ? (
            <Outlet />
        ):( 
          <h1>You Are Offline, lets do something else which is Cool!</h1>)
        }
      </div>
    </UserContext.Provider>
    </Provider>
  )
}

export default AppLayout