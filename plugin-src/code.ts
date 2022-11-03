import { ParseResult } from "papaparse";
import {
  CsvNodeInfo,
  CsvNodeInfoWithLang,
  CSV_HEADER_FIELDS,
  DEFAULT_LANG,
  PostToFigmaMessage,
  PostToUIMessage,
} from "../shared-src/messages";
import {
  csvNodeProcessor,
  csvNodeUpdater,
  csvResultTransformer,
  getNodeInfoMap,
  parseCsvString,
} from "./processors/csvProcessor";
import { DEFAULT_HEADING_SETTINGS, sortNodeByPosition } from "./utils";

let parsedCsv: ParseResult<CsvNodeInfoWithLang> | null = null;

figma.showUI(__html__, { themeColors: true, height: 340 });

figma.ui.onmessage = async (msg: PostToFigmaMessage) => {
  if (msg.type === "export-csv-file") {
    await exportCsvFile();
  } else if (msg.type === "detect-available-lang-from-csv") {
    await parseCsvAndDetectLangs(msg.csvString);
  } else if (msg.type === "update-content-with-lang") {
    await updateWithLang(msg.lang);
  }
};

async function updateWithLang(lang: string) {
  if (figma.currentPage.selection.length === 0) {
    figma.notify("Please select something to update 😅");
    return;
  }

  if (parsedCsv === null) {
    figma.notify("Parsed CSV cannot be found, please report a bug", {
      error: true,
    });
    return;
  }

  const topLvlNodes = figma.currentPage.selection
    .slice()
    .sort(sortNodeByPosition);

  const totalTopLvlNodes = topLvlNodes.length;

  const { data, meta } = parsedCsv;

  let notificationHandle: NotificationHandler = figma.notify("Update start...");

  const infoMap = getNodeInfoMap(data);

  let updatedLayersCount = 0;

  // We want to send figma.notify message between frame processing
  async function processFirstNode(nodes: SceneNode[]) {
    const firstNode = nodes[0];

    const notifyMessage = `Updating frame: ${firstNode.name} (${
      totalTopLvlNodes - nodes.length + 1
    }/${totalTopLvlNodes})`;
    notificationHandle?.cancel();
    notificationHandle = figma.notify(notifyMessage);
    console.log(notifyMessage);

    updatedLayersCount +=
      (await csvNodeUpdater(firstNode, infoMap, {
        ...DEFAULT_HEADING_SETTINGS,
        selectedLang: lang,
      })) || 0;

    if (nodes.length > 1) {
      setTimeout(() => {
        processFirstNode(nodes.slice(1));
      }, 20);
    } else {
      notificationHandle?.cancel();
      if (updatedLayersCount) {
        notificationHandle = figma.notify(
          `Updated ${updatedLayersCount} layer` +
            (updatedLayersCount > 1 ? "s" : "" + " 🌟")
        );
      } else {
        notificationHandle = figma.notify("Nothing updated");
      }
    }
  }

  processFirstNode(topLvlNodes);
}

async function parseCsvAndDetectLangs(csvString: string) {
  const parsed = parseCsvString<CsvNodeInfoWithLang>(csvString);
  if (parsed === null) {
    figma.notify("Can not parse CSV, check your file and try again?", {
      error: true,
    });
    return;
  }

  const allFields = parsed.meta.fields;

  if (allFields === undefined) {
    figma.notify("Can not parse CSV available fields, check your file", {
      error: true,
    });
    return;
  }

  parsedCsv = parsed;

  const additionalLangs = allFields.filter(
    (x) => !CSV_HEADER_FIELDS.includes(x)
  );
  console.log({ allFields, additionalLangs });

  figma.ui.postMessage({
    type: "available-lang-from-csv",
    langs: [DEFAULT_LANG, ...additionalLangs],
  } as PostToUIMessage);
}

async function exportCsvFile() {
  if (figma.currentPage.selection.length === 0) {
    figma.notify("Please select something to export 😅");
    return;
  }

  const topLvlNodes = figma.currentPage.selection
    .slice()
    .sort(sortNodeByPosition);

  const totalTopLvlNodes = topLvlNodes.length;

  let notificationHandle: NotificationHandler = figma.notify("Export start...");

  const processedInfo: {
    results: CsvNodeInfo[];
    topLvlNode: SceneNode;
  }[] = [];

  // We want to send figma.notify message between frame processing
  async function processFirstNode(nodes: SceneNode[]) {
    const firstNode = nodes[0];

    const notifyMessage = `Processing frame: ${firstNode.name} (${
      totalTopLvlNodes - nodes.length + 1
    }/${totalTopLvlNodes})`;
    notificationHandle?.cancel();
    notificationHandle = figma.notify(notifyMessage);
    console.log(notifyMessage);

    const processResult = {
      results: await csvNodeProcessor(firstNode, {
        ...DEFAULT_HEADING_SETTINGS,
        topLvlNodeName: firstNode.name,
      }),
      topLvlNode: firstNode,
    };
    processedInfo.push(processResult);

    if (nodes.length > 1) {
      setTimeout(() => {
        processFirstNode(nodes.slice(1));
      }, 20);
    } else {
      notificationHandle?.cancel();
      notificationHandle = figma.notify(
        "Generating final document to download"
      );

      setTimeout(async () => {
        const dataReturn = await csvResultTransformer(processedInfo);

        figma.ui.postMessage({
          type: "file-generated",
          data: dataReturn,
          defaultFileName: figma.root.name + ".csv",
        } as PostToUIMessage);

        notificationHandle?.cancel();
        notificationHandle = figma.notify("Done", { timeout: 1000 });
      }, 20);
    }
  }
  processFirstNode(topLvlNodes);
}
