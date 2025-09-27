import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { Web3Provider } from "./lib/web3-provider";

createRoot(document.getElementById("root")!).render(
	<Web3Provider>
		<App />
	</Web3Provider>
);
