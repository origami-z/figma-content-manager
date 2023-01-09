import { Button, FlexItem, FlexLayout, StackLayout } from "@salt-ds/core";
import { ExportIcon, RefreshIcon, TargetIcon } from "@salt-ds/icons";
import { Checkbox, Dropdown, Input } from "@salt-ds/lab";
import React, { useCallback, useEffect, useState } from "react";
import {
  PostToFigmaMessage,
  PostToUIMessage,
  SelectableTextNodeInfo,
} from "../../shared-src";
import {
  convertToCsvDataUri,
  convertToJsonDataUri,
} from "../../shared-src/export-utils";
import { NodeKeyInput } from "../components/NodeKeyInput";
import { downloadDataUri } from "../components/utils";

import "./AdvancedView.css";

const EXPORT_FORMATS = ["CSV", "JSON"] as const;

export const AdvancedView = () => {
  const [textNodesInfo, setTextNodesInfo] = useState<SelectableTextNodeInfo[]>([
    // {
    //   id: "101:4",
    //   key: "Heading",
    //   characters: "Heading v2",
    // },
  ]);

  const [selectedExportFormat, setSelectedExportFormat] = useState<
    typeof EXPORT_FORMATS[number]
  >(EXPORT_FORMATS[0]);

  const handleWindowMessage = useCallback(
    (event: {
      data: {
        pluginMessage: PostToUIMessage;
      };
    }) => {
      if (event.data.pluginMessage) {
        const { pluginMessage } = event.data;
        console.log("handleWindowMessage pluginMessage", pluginMessage);
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

  const scanTextNodeInfo = (autoTrigger: boolean) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "scan-text-node-info",
          autoTrigger,
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  // Auto scan on UI load
  useEffect(() => {
    scanTextNodeInfo(true);
  }, []);

  const onScanClick = () => scanTextNodeInfo(false);

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

  const onUpdateRowChecked = (id: string, checked: boolean) => {
    // setTextNodesInfo((infos) => {
    //   const newInfos = [...infos];
    //   const oldRow = newInfos[rowIndex];
    //   newInfos[rowIndex] = { ...oldRow, checked };
    //   return newInfos;
    // });
    parent.postMessage(
      {
        pluginMessage: {
          type: "update-node-selected",
          nodeId: id,
          checked,
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  // Every checked row should have key filled in
  const exportButtonDisabled = textNodesInfo
    .filter((x) => x.checked)
    .some((x) => !!!x.key);

  const onExportButtonClicked = () => {
    const exportContent = textNodesInfo
      .filter((x) => x.checked)
      .map((node) => ({ key: node.key, characters: node.characters }));
    if (selectedExportFormat === "CSV") {
      downloadDataUri(convertToCsvDataUri(exportContent), "Figma Export.csv");
    } else if (selectedExportFormat === "JSON") {
      downloadDataUri(convertToJsonDataUri(exportContent), "Figma Export.json");
    } else {
      throw new Error("Unsupported export format: " + selectedExportFormat);
    }
  };

  return (
    <StackLayout className="advanced-view" gap={1}>
      {/* <FlexLayout> */}
      {/* <Checkbox label="Hide duplicate" disabled /> */}
      {/* </FlexLayout> */}
      <FlexItem className="tableWrapper" grow={1}>
        <table>
          <thead>
            <tr>
              <th className="checkbox-col">
                {/* <Checkbox className="tableCheckbox headerCheckbox" /> */}
              </th>
              <th>Key</th>
              <th>Characters</th>
              <th className="button-col">{/* Button column */}</th>
            </tr>
          </thead>
          <tbody>
            {/* Each row */}
            {textNodesInfo.map((nodeInfo, nodeInfoIndex) => {
              return (
                <tr key={`table-row-${nodeInfoIndex}`}>
                  <th className="checkbox-col">
                    <Checkbox
                      className="tableCheckbox"
                      checked={nodeInfo.checked}
                      onChange={(_, c) => onUpdateRowChecked(nodeInfo.id, c)}
                    />
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
                  <td className="button-col">
                    <Button onClick={() => onFocusTextNode(nodeInfo.id)}>
                      <TargetIcon />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </FlexItem>
      <FlexLayout justify="space-between">
        <FlexItem>
          <Button onClick={onScanClick}>
            <RefreshIcon />
          </Button>
        </FlexItem>

        <FlexItem>
          <Dropdown
            source={EXPORT_FORMATS}
            selected={selectedExportFormat}
            onSelectionChange={(_, selected) =>
              selected && setSelectedExportFormat(selected)
            }
            width={72}
          />
          <Button
            disabled={exportButtonDisabled}
            onClick={onExportButtonClicked}
          >
            Export <ExportIcon />
          </Button>
        </FlexItem>
      </FlexLayout>
    </StackLayout>
  );
};
