import React, { useCallback, useEffect, useState } from "react";
import { Button, FlexLayout, StackLayout } from "@salt-ds/core";
import { Checkbox, Input } from "@salt-ds/lab";
import {
  PostToFigmaMessage,
  PostToUIMessage,
  TextNodeInfo,
} from "../../shared-src";
import { CloseSmallIcon, TargetIcon, WarningIcon } from "@salt-ds/icons";

import "./AdvancedView.css";
import { NodeKeyInput } from "../components/NodeKeyInput";

export const AdvancedView = () => {
  const [textNodesInfo, setTextNodesInfo] = useState<TextNodeInfo[]>([
    // {
    //   id: "101:4",
    //   key: "Heading",
    //   characters: "Heading v2",
    // },
  ]);

  const handleWindowMessage = useCallback(
    (event: {
      data: {
        pluginMessage: PostToUIMessage;
      };
    }) => {
      if (event.data.pluginMessage) {
        const { pluginMessage } = event.data;
        switch (pluginMessage.type) {
          case "scan-text-node-info-result": {
            const { textNodesInfo } = pluginMessage;
            setTextNodesInfo(textNodesInfo);
            break;
          }
          case "partial-update-text-node-info-result": {
            const { partialTextNodesInfo: updatedInfo } = pluginMessage;
            setTextNodesInfo((prev) =>
              prev.map((info) => {
                const matchedInfo = updatedInfo.find((x) => x.id === info.id);
                if (matchedInfo) {
                  return { ...info, ...matchedInfo };
                } else {
                  return info;
                }
              })
            );
            break;
          }
          default:
        }
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("message", handleWindowMessage);
    return () => {
      window.removeEventListener("message", handleWindowMessage);
    };
  }, [handleWindowMessage]);

  const onScanClick = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "scan-text-node-info",
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  // Auto scan on UI load
  useEffect(() => {
    onScanClick();
  }, []);

  const onFocusTextNode = (id: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "focus-node",
          id,
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  const onUpdateNodeKey = (id: string, key: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "update-node-key",
          nodeId: id,
          key,
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  return (
    <StackLayout className="advanced-view">
      <FlexLayout>
        <Button onClick={onScanClick}>Scan</Button>
        <Checkbox label="Hide duplicate" disabled />
      </FlexLayout>
      <table>
        <thead>
          <tr>
            <th>
              <Checkbox className="tableCheckbox" />
            </th>
            <th>Key</th>
            <th>Characters</th>
            <th>{/* Button column */}</th>
          </tr>
        </thead>
        <tbody>
          {/* Each row */}
          {textNodesInfo.map((nodeInfo) => {
            return (
              <tr>
                <th>
                  <Checkbox className="tableCheckbox" />
                </th>
                <td>
                  <NodeKeyInput
                    nodeInfo={nodeInfo}
                    onUpdateNodeKey={onUpdateNodeKey}
                  />
                </td>
                <td>
                  <Input value={nodeInfo.characters} readOnly />
                </td>
                <td>
                  <Button onClick={() => onFocusTextNode(nodeInfo.id)}>
                    <TargetIcon />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </StackLayout>
  );
};
