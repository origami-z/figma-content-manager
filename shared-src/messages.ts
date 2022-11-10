type Id = string;

type StoredCopyVersion = {
  name: string;
  characters: string;
};

// We need to keep an array so that additional headers being added by the user can be detected
export const CSV_HEADER_FIELDS = [
  "id",
  "page",
  "name",
  "characters",
  "listOption",
  "headingLevel",
];
export type CsvNodeInfo = {
  /**
   * Figma node.id prefixed with $.
   * This is to prevent Excel interpret id like "1:2" to time, which will have additional 0 after save.
   */
  id: `${Id}`;
  /** Top level selected frame name */
  page: string;
  /** Text node name  */
  name: string;
  characters: string;
  listOption: string;
  headingLevel: string;
};
export type CsvNodeInfoWithProperId = Omit<CsvNodeInfo, "id"> & {
  id: Id;
} & {
  [version: string]: string;
};
export const DEFAULT_LANG = "Default";

export type CsvNodeInfoWithLang = CsvNodeInfo & {
  [lang: string]: string;
};

export type FileGeneratedToUIMessage = {
  type: "file-generated";
  data: string;
  defaultFileName: string;
};

export type AvailableLangFromCsvToUIMessage = {
  type: "available-lang-from-csv";
  langs: string[];
};

export type PostToUIMessage =
  | FileGeneratedToUIMessage
  | AvailableLangFromCsvToUIMessage;

// This is useful to run some code when react is finished to get new information from Figma
export type UiFinishLoadingToFigmaMessage = {
  type: "ui-finish-loading";
};

export type ExportCsvFileToFigmaMessage = {
  type: "export-csv-file";
};

export type DetectAvailableLangFromCSVToFigmaMessage = {
  type: "detect-available-lang-from-csv";
  csvString: string;
};

export type UpdateContentWithLangToFigmaMessage = {
  type: "update-content-with-lang";
  lang: string;
  persistInFigma: boolean;
};

export type PostToFigmaMessage =
  | UiFinishLoadingToFigmaMessage
  | ExportCsvFileToFigmaMessage
  | DetectAvailableLangFromCSVToFigmaMessage
  | UpdateContentWithLangToFigmaMessage;
