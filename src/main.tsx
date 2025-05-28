import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import { BrowserRouter as Router } from "react-router-dom"
import { CopilotKit } from "@copilotkit/react-core"
import "@copilotkit/react-ui/styles.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <CopilotKit runtimeUrl={RUNTIME_URL} >
        <App />
      </CopilotKit>
    </Router>
  </React.StrictMode>
)
