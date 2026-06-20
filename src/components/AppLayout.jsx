import Header from "./header";
import { Outlet } from "react-router";
import useOnlineStatus from "../utils/useOnlineState"

function AppLayout() {

  const isOnline = useOnlineStatus()

  return (
    <div className="app">
      <Header isOnline = {isOnline}/>
      {
      isOnline ? <Outlet /> : <h1>You Are Offline, lets do something else which is Cool!</h1>
      }
    </div>
    )
}

export default AppLayout