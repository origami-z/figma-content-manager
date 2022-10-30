export type CreatedNodesResultToUIMessage = {
  type: "created-nodes-result";
  success: boolean;
};

export type PostToUIMessage = CreatedNodesResultToUIMessage;

// This is useful to run some code when react is finished to get new information from Figma
export type UiFinishLoadingToFigmaMessage = {
  type: "ui-finish-loading";
};

export type CreateTriangleToFigmaMessage = {
  type: "create-rectangles";
  count: number;
};

export type CancelToFigmaMessage = {
  type: "cancel";
};

export type PostToFigmaMessage =
  | UiFinishLoadingToFigmaMessage
  | CreateTriangleToFigmaMessage
  | CancelToFigmaMessage;
