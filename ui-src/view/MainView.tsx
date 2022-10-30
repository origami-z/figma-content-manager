import { Button, StackLayout } from "@jpmorganchase/uitk-core";
import { FileDropZone } from "@jpmorganchase/uitk-lab";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PostToFigmaMessage, PostToUIMessage } from "../../shared-src";
import { downloadDataUri } from "../components/utils";

export const MainView = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState<boolean | undefined>(undefined);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleWindowMessage = useCallback(
    (event: {
      data: {
        pluginMessage: PostToUIMessage;
      };
    }) => {
      if (event.data.pluginMessage) {
        const { pluginMessage } = event.data;
        switch (pluginMessage.type) {
          case "file-generated": {
            const { data, defaultFileName } = pluginMessage;
            downloadDataUri(data, defaultFileName);
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

  const onExportCsv = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: "export-csv-file",
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  const onUpdateCsv = () => {
    if (csvFile !== null) {
      var reader = new FileReader();
      reader.readAsText(csvFile, "UTF-8");
      reader.onload = function (evt) {
        const fileReadString = evt.target?.result as any;
        console.log({ fileReadString });
        parent.postMessage(
          {
            pluginMessage: {
              type: "update-content-with-csv-file",
              csvString: fileReadString,
            } as PostToFigmaMessage,
          },
          "*"
        );
      };
      reader.onerror = function (evt) {
        console.error("error reading file");
        setCsvFile(null);
      };
    }
  };

  const onFileAccepted = (files: readonly File[]) => {
    if (files.length) {
      setCsvFile(files[0]);
    } else {
      setCsvFile(null);
    }
  };

  return (
    <StackLayout className="appRoot" align="center">
      <Button onClick={onExportCsv}>Export CSV</Button>
      {csvFile === null ? (
        <FileDropZone
          accept="csv"
          onFilesRejected={() => setCsvFile(null)}
          onFilesAccepted={onFileAccepted}
        />
      ) : (
        <p>{csvFile.name}</p>
      )}
      <Button onClick={onUpdateCsv} disabled={csvFile === null}>
        Update
      </Button>
    </StackLayout>
  );
};
