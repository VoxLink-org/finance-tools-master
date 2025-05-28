import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isDev = process.env.NODE_ENV === "development";
const PAYMENT_LINK = isDev? "https://buy.stripe.com/test_8wM6qe22K5Op7PG146" : "https://buy.stripe.com/cNicN50wVd1Agm0czo1B606";
const RUNTIME_URL = isDev? "http://localhost:3001/api/copilotkit" : "/api/copilotkit";

export default defineConfig({
	plugins: [react()],
	define: {
		PAYMENT_LINK: JSON.stringify(PAYMENT_LINK),	
		RUNTIME_URL: JSON.stringify(RUNTIME_URL),
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@server": path.resolve(__dirname, "./server"),
		},
	},
})
