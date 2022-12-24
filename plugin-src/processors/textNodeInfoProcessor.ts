import { TextNodeInfo } from "../../shared-src";
import { getNodeKey } from "../pluginDataUtils";
import { sortNodeByPosition } from "../utils";
import { iterate } from "./iterate";

export const textNodeInfoTextNodeProcess = (
  node: TextNode,
  settings: any
): TextNodeInfo[] => {
  if (!node.visible || node.characters.length === 0) {
    return [];
  }

  const key = getNodeKey(node);

  const nodeInfo = {
    id: node.id,
    key,
    name: node.name,
    characters: node.characters,
  };
  return [nodeInfo];
};

export const textNodeInfoChildrenNodeProcess = (
  node: SceneNode & ChildrenMixin,
  settings: any,
  processors: any
): TextNodeInfo[] => {
  return node.children
    .slice()
    .sort(sortNodeByPosition)
    .reduce<TextNodeInfo[]>((prev, child) => {
      return [
        ...prev,
        ...(iterate<TextNodeInfo[]>(child, settings, processors) || []),
      ];
    }, []);
};

const emptyProcess = () => null;

export const textNodeInfoProcessor = async (
  node: SceneNode,
  settings: any
): Promise<TextNodeInfo[]> => {
  return (
    iterate<TextNodeInfo[]>(node, settings, {
      image: emptyProcess,
      text: textNodeInfoTextNodeProcess,
      children: textNodeInfoChildrenNodeProcess,
    }) || []
  );
};
