import { CsvNodeInfo } from '../../shared-src/messages';
import { getHeadingLevelNumber, HeadingSettings, loadAllFonts, replaceTextInTextNode, sortNodeByPosition } from '../utils';
import { CsvNodeInfoMap, iterate, iterateUpdate } from './iterate';
import { unparse, parse } from 'papaparse'

const getListOption = (node: TextNode): string => {
  const fullListOption = node.getRangeListOptions(0, node.characters.length - 1);
  if (fullListOption === figma.mixed) {
    return 'MIXED'
  }
  return fullListOption.type
}

const getHeadingLevel = (node: TextNode, settings: HeadingSettings) => {
  const fullFontSize = node.getRangeFontSize(0, node.characters.length - 1);
  if (fullFontSize === figma.mixed) {
    return 'MIXED'
  }
  return getHeadingLevelNumber(fullFontSize, settings).toString()
}

export const csvTextNodeProcess = (
  node: TextNode,
  settings: HeadingSettings
): CsvNodeInfo[] => {
  const listOption = getListOption(node);
  const headingLevel = getHeadingLevel(node, settings);
  const nodeInfo = {
    id: node.id,
    name: node.name,
    characters: node.characters,
    listOption,
    headingLevel
  };
  return [nodeInfo]
}

export const csvChildrenNodeProcess = (
  node: SceneNode & ChildrenMixin,
  settings: HeadingSettings,
  processors: any
): CsvNodeInfo[] => {
  return node.children.slice().sort(sortNodeByPosition)
    .reduce<CsvNodeInfo[]>((prev, child) => {
      return [
        ...prev,
        ...(iterate<CsvNodeInfo[]>(child, settings, processors) || [])
      ]
    }, [])
}

const emptyProcess = () => null;

export const csvNodeProcessor = async (node: SceneNode, settings: HeadingSettings = { h1: 50, h2: 30, h3: 20, h4: 15 }): Promise<CsvNodeInfo[]> => {
  return iterate<CsvNodeInfo[]>(node, settings, {
    image: emptyProcess,
    text: csvTextNodeProcess,
    children: csvChildrenNodeProcess
  }) || []
}

export const csvResultTransformer = async (
  resultsPerNode: { results: CsvNodeInfo[]; topLvlNode: SceneNode }[]
): Promise<string> => {
  const rows = resultsPerNode.flatMap(x => x.results);
  const rowsString = unparse(rows, { header: true });
  return "data:text/csv;charset=utf-8," + encodeURIComponent(rowsString);
}

export const parseCsvString = (input: string) => {
  const parseResult = parse<CsvNodeInfo>(input, {
    header: true
  })

  if (parseResult.errors.length) {
    console.error('Error: parseCsvString', parseResult.errors);
    return null
  }
  console.log("parseCsvString success", parseResult.data)
  return parseResult.data
}

export const getNodeInfoMap = (nodeInfos: CsvNodeInfo[]): CsvNodeInfoMap => {
  let map: CsvNodeInfoMap = {};
  nodeInfos.forEach(x => map[x.id] = x);
  return map
}

export const csvTextNodeUpdater = async (
  node: TextNode,
  nodeInfoMap: CsvNodeInfoMap,
  settings: HeadingSettings
): Promise<string[]> => {
  const nodeInfo = nodeInfoMap[node.id];
  if (!nodeInfo) {
    return []; //  false; // Not updated
  }
  const {
    id,
    name,
    characters,
    listOption,
    headingLevel
  } = nodeInfo;

  // TODO: also check other info updates
  if (node.characters === nodeInfo.characters) {
    return []; //  false; // Not updated
  } else {
    await loadAllFonts(node);
    replaceTextInTextNode(node, 0, node.characters.length, characters)
    return [node.id];
  }
}

export const csvChildrenNodeUpdater = async (
  node: SceneNode & ChildrenMixin,
  nodeInfoMap: CsvNodeInfoMap,
  settings: HeadingSettings,
  processors: any
) => {
  const results = [];
  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index];

    results.push(... (await iterateUpdate<string[]>(child, nodeInfoMap, settings, processors) || []));
  }
  return results;
}


export const csvNodeUpdater = async (node: SceneNode, nodeInfoMap: CsvNodeInfoMap, settings: HeadingSettings = { h1: 50, h2: 30, h3: 20, h4: 15 }) => {
  const results = await iterateUpdate(node, nodeInfoMap, settings, {
    text: csvTextNodeUpdater,
    children: csvChildrenNodeUpdater
  })
  console.log('csvNodeUpdater results', results)
}
