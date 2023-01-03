import { SaltProvider } from "@salt-ds/core";
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
    <SaltProvider mode={theme}>
      <TabsView />
    </SaltProvider>
  );
}

export default App;
