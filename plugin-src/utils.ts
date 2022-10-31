export type HeadingSettings = {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
};

export const DEFAULT_HEADING_SETTINGS: HeadingSettings = {
  h1: 36,
  h2: 28,
  h3: 22,
  h4: 18,
};

export const isChildrenMixin = (node: any): node is ChildrenMixin => {
  return !!(node as any).children;
};

export const isRectNodeImage = (node: RectangleNode): boolean => {
  return (
    node.fills !== figma.mixed &&
    node.fills.length === 1 &&
    node.fills[0].type === "IMAGE"
  );
};

/**
 * Gets heading level number, e.g. font size 36 => heading 1
 */
export const getHeadingLevelNumber = (
  fontSize: number,
  settings: HeadingSettings
): number => {
  return fontSize < settings.h4
    ? 0
    : fontSize < settings.h3
    ? 4
    : fontSize < settings.h2
    ? 3
    : fontSize < settings.h1
    ? 2
    : 1;
};

export const sortNodeByPosition = (a: SceneNode, b: SceneNode) => {
  if (a.y !== b.y) {
    return a.y - b.y;
  } else {
    return a.x - b.x;
  }
};

export async function loadAllFonts(textNode: TextNode) {
  if (!textNode.characters.length) return;
  const fontNames = textNode.getRangeAllFontNames(
    0,
    textNode.characters.length
  );
  for (let index = 0; index < fontNames.length; index++) {
    const fontName = fontNames[index];
    await figma.loadFontAsync(fontName);
  }
}

export const replaceTextInTextNode = (
  textNode: TextNode,
  replaceStartIndex: number,
  lengthToBeReplaced: number,
  textToInsert: string
) => {
  textNode.insertCharacters(replaceStartIndex, textToInsert, "AFTER");
  textNode.deleteCharacters(
    replaceStartIndex + textToInsert.length,
    replaceStartIndex + textToInsert.length + lengthToBeReplaced
  );
};
