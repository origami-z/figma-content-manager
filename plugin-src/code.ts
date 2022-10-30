import { CsvNodeInfo, PostToFigmaMessage, PostToUIMessage } from "../shared-src/messages";
import { csvNodeProcessor, csvNodeUpdater, csvResultTransformer, getNodeInfoMap, parseCsvString } from "./processers/csvProcessor";
import { sortNodeByPosition } from "./utils";

figma.showUI(__html__, { themeColors: true, height: 340 });

figma.ui.onmessage = async (msg: PostToFigmaMessage) => {
  if (msg.type === "export-csv-file") {
    await exportCsvFile();
  } else if (msg.type === 'update-content-with-csv-file') {
    await updateWithCsvFile(msg.csvString);
  }
};

async function updateWithCsvFile(csvString: string) {
  if (figma.currentPage.selection.length === 0) {
    figma.notify(
      "Please select something to export 😅"
    )
    return
  }

  const topLvlNodes = figma.currentPage.selection.slice().sort(sortNodeByPosition);

  const totalTopLvlNodes = topLvlNodes.length;
  const parsed = parseCsvString(csvString);

  if (parsed === null) { return; }

  let notificationHandle: NotificationHandler = figma.notify('Update start...');

  const infoMap = getNodeInfoMap(parsed);

  // We want to send figma.notify message between frame processing
  async function processFirstNode(nodes: SceneNode[]) {
    const firstNode = nodes[0];

    const notifyMessage = `Updating frame: ${firstNode.name} (${totalTopLvlNodes - nodes.length + 1}/${totalTopLvlNodes})`;
    notificationHandle?.cancel();
    notificationHandle = figma.notify(notifyMessage);
    console.log(notifyMessage);

    await csvNodeUpdater(firstNode, infoMap);

    if (nodes.length > 1) {
      setTimeout(() => {
        processFirstNode(nodes.slice(1))
      }, 20);
    } else {
      notificationHandle?.cancel();
      notificationHandle = figma.notify("Update finished");
    }
  }

  processFirstNode(topLvlNodes)
}

async function exportCsvFile() {
  if (figma.currentPage.selection.length === 0) {
    figma.notify(
      "Please select something to export 😅"
    )
    return
  }

  const topLvlNodes = figma.currentPage.selection.slice().sort(sortNodeByPosition);

  const totalTopLvlNodes = topLvlNodes.length;

  let notificationHandle: NotificationHandler = figma.notify('Export start...');

  const processedInfo: {
    results: CsvNodeInfo[];
    topLvlNode: SceneNode;
  }[] = [];

  // We want to send figma.notify message between frame processing
  async function processFirstNode(nodes: SceneNode[]) {
    const firstNode = nodes[0];

    const notifyMessage = `Processing frame: ${firstNode.name} (${totalTopLvlNodes - nodes.length + 1}/${totalTopLvlNodes})`;
    notificationHandle?.cancel();
    notificationHandle = figma.notify(notifyMessage);
    console.log(notifyMessage);

    const processResult = {
      results: await csvNodeProcessor(firstNode),
      topLvlNode: firstNode
    }
    processedInfo.push(processResult);

    if (nodes.length > 1) {
      setTimeout(() => {
        processFirstNode(nodes.slice(1))
      }, 20);
    } else {
      notificationHandle?.cancel();
      notificationHandle = figma.notify("Generating final document to download");

      setTimeout(async () => {
        const dataReturn = await csvResultTransformer(processedInfo);

        figma.ui.postMessage({
          type: 'file-generated',
          data: dataReturn,
          defaultFileName: figma.root.name + '.csv'
        } as PostToUIMessage)

        notificationHandle?.cancel();
        notificationHandle = figma.notify("Done", { timeout: 1000 })
      }, 20)
    }
  }
  processFirstNode(topLvlNodes)
}

