import Header from "./components/header"
import Body from "./components/Body"
import { Outlet } from "react-router"

function App() {
return (
  <div className="app">
    <Header />
    <Outlet />
  </div>
  )
}

export default App
