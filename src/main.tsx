import "./polyfills";
import React from "react";
import { createRoot } from "react-dom/client";
import "@/shared/config/i18n-instance";
import App from "./app/app";
import "./styles/index.css";

createRoot(document.querySelector("#root")!).render(<App />);
