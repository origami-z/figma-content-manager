import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import React, { useEffect } from "react";
import { PostToFigmaMessage } from "../shared-src";
import { useFigmaPluginTheme } from "./components/useFigmaPluginTheme";
import { MainView } from "./view/MainView";

import "./App.css";

function App() {
  const [theme] = useFigmaPluginTheme();

  useEffect(() => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "ui-finish-loading",
        } as PostToFigmaMessage,
      },
      "*"
    );
  }, []);

  return (
    <ToolkitProvider mode={theme}>
      <MainView />
    </ToolkitProvider>
  );
}

export default App;
