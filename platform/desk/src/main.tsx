import "@/styles/base.css";
import "@spec/theme.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { primeHost } from "@/lib/providers/host";
import App from "@/render/app";

const root = document.getElementById("root");

if ( !root ) throw new Error("The document has no root element.");

await primeHost();

createRoot(root).render(<StrictMode><App /></StrictMode>);
