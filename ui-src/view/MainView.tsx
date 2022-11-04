import { Button, FormField, StackLayout } from "@jpmorganchase/uitk-core";
import { Dropdown, FileDropZone } from "@jpmorganchase/uitk-lab";
import React, { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LANG,
  PostToFigmaMessage,
  PostToUIMessage,
} from "../../shared-src";
import { downloadDataUri } from "../components/utils";

export const MainView = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvLangs, setCsvLangs] = useState<string[]>([DEFAULT_LANG]);
  const [selectedLang, setSelectedLang] = useState<string>(DEFAULT_LANG);

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
          case "available-lang-from-csv": {
            const { langs } = pluginMessage;
            setCsvLangs(langs);
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
    parent.postMessage(
      {
        pluginMessage: {
          type: "update-content-with-lang",
          lang: selectedLang,
        } as PostToFigmaMessage,
      },
      "*"
    );
  };

  const onFileAccepted = (files: readonly File[]) => {
    if (files.length && files[0] !== null) {
      const csv = files[0];
      setCsvFile(csv);
      var reader = new FileReader();
      reader.readAsText(csv, "UTF-8");
      reader.onload = function (evt) {
        const fileReadString = evt.target?.result as any;
        console.log({ fileReadString });
        parent.postMessage(
          {
            pluginMessage: {
              type: "detect-available-lang-from-csv",
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
        <StackLayout gap={1}>
          <p>{csvFile.name}</p>
          <FormField
            label="Version"
            className="uitkEmphasisHigh language-formField"
            fullWidth={false}
          >
            <Dropdown
              source={csvLangs}
              selected={selectedLang}
              onSelectionChange={(_, selected) =>
                selected && setSelectedLang(selected)
              }
              ListProps={{ displayedItemCount: 3 }}
            />
          </FormField>
        </StackLayout>
      )}
      <Button onClick={onUpdateCsv} disabled={csvFile === null}>
        Update
      </Button>
    </StackLayout>
  );
};
