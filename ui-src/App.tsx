import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import React, { useEffect } from "react";
import { PostToFigmaMessage } from "../shared-src";
import { useFigmaPluginTheme } from "./components/useFigmaPluginTheme";
import { TabsView } from "./view/TabsView";

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
      <TabsView />
    </ToolkitProvider>
  );
}

export default App;
