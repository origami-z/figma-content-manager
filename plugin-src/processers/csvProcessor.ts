import { CsvNodeInfo } from "../../shared-src/messages";
import {
  DEFAULT_HEADING_SETTINGS,
  getHeadingLevelNumber,
  HeadingSettings,
  loadAllFonts,
  replaceTextInTextNode,
  sortNodeByPosition,
} from "../utils";
import {
  CsvExportSettings,
  CsvNodeInfoMap,
  iterate,
  iterateUpdate,
} from "./iterate";
import { unparse, parse } from "papaparse";

const getListOption = (node: TextNode): string => {
  const fullListOption = node.getRangeListOptions(0, node.characters.length);
  if (fullListOption === figma.mixed) {
    return "MIXED";
  }
  return fullListOption.type;
};

const getHeadingLevel = (node: TextNode, settings: HeadingSettings) => {
  const fullFontSize = node.getRangeFontSize(0, node.characters.length);
  if (fullFontSize === figma.mixed) {
    return "MIXED";
  }
  return getHeadingLevelNumber(fullFontSize, settings).toString();
};

export const csvTextNodeProcess = (
  node: TextNode,
  settings: CsvExportSettings
): CsvNodeInfo[] => {
  // console.log("textProcessor", node);
  const listOption = getListOption(node);
  const headingLevel = getHeadingLevel(node, settings);
  const nodeInfo = {
    id: "$" + node.id,
    page: settings.topLvlNodeName,
    name: node.name,
    characters: node.characters,
    listOption,
    headingLevel,
  };
  return [nodeInfo];
};

export const csvChildrenNodeProcess = (
  node: SceneNode & ChildrenMixin,
  settings: CsvExportSettings,
  processors: any
): CsvNodeInfo[] => {
  return node.children
    .slice()
    .sort(sortNodeByPosition)
    .reduce<CsvNodeInfo[]>((prev, child) => {
      return [
        ...prev,
        ...(iterate<CsvNodeInfo[]>(child, settings, processors) || []),
      ];
    }, []);
};

const emptyProcess = () => null;

export const csvNodeProcessor = async (
  node: SceneNode,
  settings: CsvExportSettings
): Promise<CsvNodeInfo[]> => {
  return (
    iterate<CsvNodeInfo[]>(node, settings, {
      image: emptyProcess,
      text: csvTextNodeProcess,
      children: csvChildrenNodeProcess,
    }) || []
  );
};

export const csvResultTransformer = async (
  resultsPerNode: { results: CsvNodeInfo[]; topLvlNode: SceneNode }[]
): Promise<string> => {
  const rows = resultsPerNode.flatMap((x) => x.results);
  console.log("csvResultTransformer rows", rows);
  const rowsString = unparse(rows, { header: true });
  return "data:text/csv;charset=utf-8," + encodeURIComponent(rowsString);
};

export const parseCsvString = (input: string) => {
  const parseResult = parse<CsvNodeInfo>(input, {
    header: true,
  });

  if (parseResult.errors.length) {
    console.error("Error: parseCsvString", parseResult.errors);
    return null;
  }
  console.log("parseCsvString success", parseResult.data);
  return parseResult.data;
};

export const getNodeInfoMap = (nodeInfos: CsvNodeInfo[]): CsvNodeInfoMap => {
  let map: CsvNodeInfoMap = {};
  nodeInfos.forEach((x) => {
    const nodeInfoWithNormalId = {
      ...x,
      id: x.id.replace(/^\$/, ""), // Replace leading $. See `CsvNodeInfo.id`.
    };
    map[nodeInfoWithNormalId.id] = nodeInfoWithNormalId;
  });
  return map;
};

/**
 * Update characters if necessary, returns true if made update to node
 */
const updateCharacters = async (
  node: TextNode,
  nodeInfo: CsvNodeInfo
): Promise<boolean> => {
  if (node.characters === nodeInfo.characters) {
    return false;
  }

  await loadAllFonts(node);
  replaceTextInTextNode(node, 0, node.characters.length, nodeInfo.characters);
  return true;
};

const updateListOption = async (
  node: TextNode,
  nodeInfo: CsvNodeInfo
): Promise<boolean> => {
  if (getListOption(node) === nodeInfo.listOption) {
    return false;
  }
  if (["ORDERED", "UNORDERED", "NONE"].includes(nodeInfo.listOption)) {
    await loadAllFonts(node);
    node.setRangeListOptions(0, node.characters.length, {
      type: nodeInfo.listOption as any,
    });
    return true;
  } else {
    console.warn("Ignoring unknown list option:", nodeInfo.listOption);
    return false;
  }
};

export const csvTextNodeUpdater = async (
  node: TextNode,
  nodeInfoMap: CsvNodeInfoMap,
  settings: HeadingSettings
): Promise<string[]> => {
  const nodeInfo = nodeInfoMap[node.id];
  if (!nodeInfo) {
    console.warn("Skip un-found node in map: ", node.id, node.name);
    return []; //  false; // Not updated
  }

  const updated = [
    await updateCharacters(node, nodeInfo),
    await updateListOption(node, nodeInfo),
  ].some((x) => !!x);

  if (updated) {
    return [node.id];
  } else {
    return [];
  }
};

export const csvChildrenNodeUpdater = async (
  node: SceneNode & ChildrenMixin,
  nodeInfoMap: CsvNodeInfoMap,
  settings: HeadingSettings,
  processors: any
) => {
  const results = [];
  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];

    results.push(
      ...((await iterateUpdate<string[]>(
        child,
        nodeInfoMap,
        settings,
        processors
      )) || [])
    );
  }
  return results;
};

export const csvNodeUpdater = async (
  node: SceneNode,
  nodeInfoMap: CsvNodeInfoMap,
  settings: HeadingSettings = DEFAULT_HEADING_SETTINGS
) => {
  const results = await iterateUpdate(node, nodeInfoMap, settings, {
    text: csvTextNodeUpdater,
    children: csvChildrenNodeUpdater,
  });
  console.log("csvNodeUpdater updated nodes", results);
  return results?.length;
};
