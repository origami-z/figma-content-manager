import React, { useState } from "react";
import { FlexItem, StackLayout } from "@jpmorganchase/uitk-core";
import { Tab, Tabstrip } from "@jpmorganchase/uitk-lab";
import { SimpleView } from "./SimpleView";
import { AdvancedView } from "./AdvancedView";

export const TabsView = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(1);

  const handleTabSelection = (index: number) => {
    setSelectedTabIndex(index);
    // parent.postMessage(
    //   {
    //     pluginMessage: {
    //       type: "ui-view-changed",
    //       view: index === 0 ? "select" : index === 1 ? "scan" : "advanced",
    //     } as PostToFigmaMessage,
    //   },
    //   "*"
    // );
  };

  const renderView = () => {
    switch (selectedTabIndex) {
      case 0:
        return <SimpleView />;
      case 1:
        return <AdvancedView />;
      default:
        return null;
    }
  };

  return (
    <StackLayout className="tabs-view" gap={0}>
      <FlexItem grow={0} shrink={0}>
        <Tabstrip
          activeTabIndex={selectedTabIndex}
          onActiveChange={handleTabSelection}
          className="tab"
        >
          <Tab label="Simple" />
          <Tab label="Advanced" />
        </Tabstrip>
      </FlexItem>
      {renderView()}
    </StackLayout>
  );
};
