/**
 * Pure reducer function to apply validated design actions to the design state.
 */

export function applyActionsToDesign(currentDesign, actions) {
  if (!actions || actions.length === 0) return currentDesign;

  // Deep clone to ensure immutability
  const nextDesign = JSON.parse(JSON.stringify(currentDesign));

  for (const action of actions) {
    const { type, element } = action;

    if (type === 'move' && nextDesign.elements[element]) {
      nextDesign.elements[element].x = action.x;
      nextDesign.elements[element].y = action.y;
    } else if (type === 'resize' && nextDesign.elements[element]) {
      nextDesign.elements[element].width = action.width;
      nextDesign.elements[element].height = action.height;
    } else if (type === 'style') {
      if (element === 'card') {
        const { type: _, element: __, ...styles } = action;
        Object.assign(nextDesign.card, styles);
      } else if (nextDesign.elements[element]) {
        const { type: _, element: __, ...styles } = action;
        Object.assign(nextDesign.elements[element], styles);
      }
    } else if (type === 'visibility' && nextDesign.elements[element]) {
      nextDesign.elements[element].visible = action.visible;
    } else if (type === 'rotate' && nextDesign.elements[element]) {
      nextDesign.elements[element].rotation = action.rotation;
    } else if (type === 'reorder' && nextDesign.elements[element]) {
      const allZIndexes = Object.values(nextDesign.elements).map((el) => el.zIndex || 10);
      const maxZ = Math.max(...allZIndexes, 10);
      const minZ = Math.min(...allZIndexes, 10);
      const currentZ = nextDesign.elements[element].zIndex || 10;

      if (action.zIndex !== undefined) {
        nextDesign.elements[element].zIndex = action.zIndex;
      } else if (action.direction === 'bringToFront' || action.direction === 'foreground') {
        nextDesign.elements[element].zIndex = Math.max(maxZ + 2, 40);
      } else if (action.direction === 'sendToBack' || action.direction === 'background') {
        nextDesign.elements[element].zIndex = 2; // In background behind all text elements (which are zIndex 15)
      } else if (action.direction === 'bringForward') {
        nextDesign.elements[element].zIndex = currentZ + 2;
      } else if (action.direction === 'sendBackward') {
        nextDesign.elements[element].zIndex = Math.max(2, currentZ - 2);
      }
    } else if (type === 'theme') {
      if (action.background) nextDesign.card.background = action.background;
      if (action.headerBg) nextDesign.card.headerBg = action.headerBg;
      if (action.borderColor) nextDesign.card.borderColor = action.borderColor;
      if (action.accentColor) nextDesign.card.accentColor = action.accentColor;
      if (action.themeId) nextDesign.card.themeId = action.themeId;
    }
  }

  return nextDesign;
}
