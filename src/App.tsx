import { SiteHeader } from "@/components/site-header"
import { useRoutes } from "react-router-dom"
import { TailwindIndicator } from "./components/tailwind-indicator"
import { Home } from "@/pages/home"
import { Demo } from "./pages/demo"


const routes = [
  { path: "/", element: <Home /> },
  { path: "/playground", element: <Demo /> },
]


function App() {
  const children = useRoutes(routes)

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </div>
      <TailwindIndicator />
    </>
  )
}

export default App
