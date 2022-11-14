import {
  Button,
  FlexItem,
  FlexLayout,
  Input,
  StackLayout,
} from "@jpmorganchase/uitk-core";
import { RefreshIcon } from "@jpmorganchase/uitk-icons";
import { LabelCaption, List, ListItem } from "@jpmorganchase/uitk-lab";
import React, { useState } from "react";

export const AdvancedView = () => {
  const [filterInput, setFilterInput] = useState("");
  const [selectedItem, setSelectedItem] = useState<null | string>(null);
  const [selectedTextNodeInfo, setSelectedTextNodeInfo] = useState(null);
  const [listSource, setListSource] = useState<string[]>([]);

  const onStore = () => {};
  const onClear = () => {};
  const onSync = () => {};
  const onLink = () => {};
  const onUnlink = () => {};
  const onUpdate = () => {};
  return (
    <StackLayout gap={1} className="advanced-view">
      <FlexLayout style={{ flexShrink: 0 }} justify="space-between">
        <FlexLayout align="center" gap={1}>
          <Button onClick={onStore}>Store</Button>
          <Button onClick={onClear}>Clear</Button>
        </FlexLayout>
        <FlexLayout align="center" gap={1}>
          <Button onClick={onSync} variant="secondary">
            Sync <RefreshIcon />
          </Button>

          {/* <Button onClick={onMoreDetail} disabled={!selectedGlobalLib}>
            <InfoSecondaryIcon size={12} />
          </Button> */}
        </FlexLayout>
      </FlexLayout>
      <Input
        className="filterListInput"
        value={filterInput}
        aria-label="Filter list"
        onChange={(_, value) => setFilterInput(value)}
        inputProps={{ placeholder: "Filter list" }}
      />
      {listSource.length === 0 ? (
        <div className="text-source-placeholder">
          <LabelCaption>
            No copy source available. Use store button above in source library.
          </LabelCaption>
        </div>
      ) : (
        <List
          className="text-source-list"
          source={["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]}
          selected={selectedItem}
          onSelectionChange={(_, selected) => setSelectedItem(selected)}
        />
      )}
      <FlexLayout style={{ flexShrink: 0 }} justify="space-between">
        <FlexLayout gap={1}>
          {/* Disabled && selectedTextNodeInfo === null */}
          <Button onClick={onLink} disabled={selectedItem === null}>
            Link
          </Button>
          <Button onClick={onUnlink} disabled={selectedTextNodeInfo === null}>
            Unlink
          </Button>
        </FlexLayout>
        <Button onClick={onUpdate}>Update</Button>
      </FlexLayout>
    </StackLayout>
  );
};
