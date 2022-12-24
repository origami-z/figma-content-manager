import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@salt-ds/lab";
import { TextNodeInfo } from "../../shared-src";
import { Button } from "@salt-ds/core";
import { CloseSmallIcon, WarningIcon } from "@salt-ds/icons";

export const NodeKeyInput = ({
  nodeInfo,
  onUpdateNodeKey,
}: {
  nodeInfo: TextNodeInfo;
  onUpdateNodeKey: (id: string, key: string) => void;
}) => {
  // TODO: update key when blur out of the input or hit "Enter" key
  return (
    <Input
      value={nodeInfo.key || nodeInfo.name}
      endAdornment={
        nodeInfo.key ? (
          <Button onClick={() => onUpdateNodeKey(nodeInfo.id, "")}>
            <CloseSmallIcon />
          </Button>
        ) : (
          <WarningIcon />
        )
      }
    />
  );
};
