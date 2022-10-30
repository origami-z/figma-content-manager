import { CsvNodeInfo } from "../../shared-src";
import { HeadingSettings, isChildrenMixin, isRectNodeImage } from "../utils";

export type NodeProcessors<T> = {
  text: (node: TextNode, settings: HeadingSettings) => T | null;
  image: (node: RectangleNode) => T | null;
  children: (
    node: SceneNode & ChildrenMixin,
    settings: HeadingSettings,
    processors: NodeProcessors<T>
  ) => T | null;
};

export const iterate = <T>(
  node: SceneNode,
  settings: HeadingSettings,
  processors: NodeProcessors<T>
): T | null => {
  // Ignore invisible nodes
  if (!node.visible) return null;

  if (node.type === "TEXT") {
    return processors.text(node, settings);
  } else if (node.type === "RECTANGLE") {
    if (isRectNodeImage(node)) {
      return processors.image(node);
    } else {
      return null;
    }
  } else if (isChildrenMixin(node)) {
    return processors.children(node, settings, processors);
  } else {
    return null;
  }
};

export type CsvNodeInfoMap = {
  [id: string]: CsvNodeInfo;
};

export type NodeUpdater<T> = {
  text: (
    node: TextNode,
    nodeInfoMap: CsvNodeInfoMap,
    settings: HeadingSettings
  ) => Promise<T | null>;
  children: (
    node: SceneNode & ChildrenMixin,
    nodeInfoMap: CsvNodeInfoMap,
    settings: HeadingSettings,
    updaters: NodeUpdater<T>
  ) => Promise<T | null>;
};

export const iterateUpdate = async <T>(
  node: SceneNode,
  nodeInfoMap: CsvNodeInfoMap,
  settings: HeadingSettings,
  updaters: NodeUpdater<T>
): Promise<T | null> => {
  // Ignore invisible nodes
  if (!node.visible) return null;

  if (node.type === "TEXT") {
    return await updaters.text(node, nodeInfoMap, settings);
  } else if (isChildrenMixin(node)) {
    return await updaters.children(node, nodeInfoMap, settings, updaters);
  } else {
    return null;
  }
};
