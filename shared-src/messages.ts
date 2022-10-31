type Id = string;

export type CsvNodeInfo = {
  /**
   * Figma node.id prefixed with $.
   * This is to prevent Excel interpret id like "1:2" to time, which will have additional 0 after save.
   */
  id: `${Id}`;
  name: string;
  characters: string;
  listOption: string;
  headingLevel: string;
};

export type FileGeneratedToUIMessage = {
  type: "file-generated";
  data: string;
  defaultFileName: string;
};

export type PostToUIMessage = FileGeneratedToUIMessage;

// This is useful to run some code when react is finished to get new information from Figma
export type UiFinishLoadingToFigmaMessage = {
  type: "ui-finish-loading";
};

export type ExportCsvFileToFigmaMessage = {
  type: "export-csv-file";
};

export type UpdateContentWithCsvFileToFigmaMessage = {
  type: "update-content-with-csv-file";
  csvString: string;
};

export type PostToFigmaMessage =
  | UiFinishLoadingToFigmaMessage
  | ExportCsvFileToFigmaMessage
  | UpdateContentWithCsvFileToFigmaMessage;
