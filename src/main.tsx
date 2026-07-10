import "./polyfills";
import { installKytInspectFetchGuard } from "@/shared/lib/privacy-sdk/install-kyt-inspect-fetch-guard";
import { createRoot } from "react-dom/client";
import "@/shared/config/i18n-instance";
import App from "./app/app";
import "./styles/index.css";

installKytInspectFetchGuard();

createRoot(document.querySelector("#root")!).render(<App />);
