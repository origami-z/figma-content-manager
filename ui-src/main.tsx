import React from "react";
import { createRoot } from "react-dom/client";
import "@jpmorganchase/uitk-theme/css/global.css";
import "@jpmorganchase/uitk-theme/css/theme.css";

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
