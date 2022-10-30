import { PostToFigmaMessage, PostToUIMessage } from "../shared-src/messages";
import { times150 } from "./utils";

figma.showUI(__html__, { themeColors: true, height: 340 });

figma.ui.onmessage = (msg: PostToFigmaMessage) => {
  if (msg.type === "create-rectangles") {
    const nodes = [];

    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = times150(i);
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }

    figma.ui.postMessage({
      type: "created-nodes-result",
      success: msg.count > 0,
    } as PostToUIMessage);

    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  } else if (msg.type === "cancel") {
    figma.closePlugin();
  }
};
