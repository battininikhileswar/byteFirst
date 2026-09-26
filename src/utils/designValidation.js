/**
 * Security and Schema Validation for AI Design Actions
 * Validates, sanitizes, and bounds-checks any instructions returned from the AI.
 */

const ALLOWED_ACTION_TYPES = new Set([
  'move',
  'resize',
  'style',
  'visibility',
  'rotate',
  'reorder',
  'theme'
]);

// Strip out HTML tags or JavaScript protocols from string values
function sanitizeString(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/<[^>]*>?/gm, '').replace(/javascript:/gi, '').trim();
}

export function validateAndSanitizeActions(actions, currentDesign) {
  if (!Array.isArray(actions)) return [];

  const orientation = currentDesign?.card?.orientation || 'horizontal';
  const cardWidth = orientation === 'horizontal' ? 600 : 380;
  const cardHeight = orientation === 'horizontal' ? 380 : 600;

  const validActions = [];

  for (const action of actions) {
    if (!action || typeof action !== 'object') continue;
    const type = action.type?.toLowerCase();

    if (!ALLOWED_ACTION_TYPES.has(type)) {
      console.warn(`[Validation] Rejected unknown action type: ${type}`);
      continue;
    }

    const elementKey = action.element;
    const isCardElement = elementKey === 'card';
    const elementExists = isCardElement || (currentDesign?.elements && currentDesign.elements[elementKey]);

    if (!elementExists && type !== 'theme') {
      console.warn(`[Validation] Element "${elementKey}" not found in current design.`);
      continue;
    }

    // Process specific action types
    if (type === 'move') {
      let x = Number(action.x);
      let y = Number(action.y);

      if (isNaN(x) || isNaN(y)) continue;

      // Bound checks
      x = Math.max(0, Math.min(cardWidth - 20, Math.round(x)));
      y = Math.max(0, Math.min(cardHeight - 20, Math.round(y)));

      validActions.push({ type: 'move', element: elementKey, x, y });
    } else if (type === 'resize') {
      let width = Number(action.width);
      let height = Number(action.height);

      if (isNaN(width) || isNaN(height)) continue;

      width = Math.max(20, Math.min(cardWidth, Math.round(width)));
      height = Math.max(15, Math.min(cardHeight, Math.round(height)));

      validActions.push({ type: 'resize', element: elementKey, width, height });
    } else if (type === 'style') {
      const sanitizedStyles = {};

      if (isCardElement) {
        if (action.background) sanitizedStyles.background = sanitizeString(action.background);
        if (action.headerBg) sanitizedStyles.headerBg = sanitizeString(action.headerBg);
        if (action.borderColor) sanitizedStyles.borderColor = sanitizeString(action.borderColor);
        if (action.accentColor) sanitizedStyles.accentColor = sanitizeString(action.accentColor);
        if (action.borderRadius !== undefined) {
          sanitizedStyles.borderRadius = Math.max(0, Math.min(32, Number(action.borderRadius) || 18));
        }
      } else {
        if (action.fontSize !== undefined) {
          sanitizedStyles.fontSize = Math.max(8, Math.min(48, Math.round(Number(action.fontSize))));
        }
        if (action.fontWeight !== undefined) {
          sanitizedStyles.fontWeight = String(action.fontWeight);
        }
        if (action.color) sanitizedStyles.color = sanitizeString(action.color);
        if (action.fontStyle) sanitizedStyles.fontStyle = action.fontStyle === 'italic' ? 'italic' : 'normal';
        if (action.textAlign) {
          sanitizedStyles.textAlign = ['left', 'center', 'right'].includes(action.textAlign) ? action.textAlign : 'left';
        }
        if (action.borderColor) sanitizedStyles.borderColor = sanitizeString(action.borderColor);
        if (action.opacity !== undefined) {
          sanitizedStyles.opacity = Math.max(0.05, Math.min(1, Number(action.opacity)));
        }
      }

      if (Object.keys(sanitizedStyles).length > 0) {
        validActions.push({ type: 'style', element: elementKey, ...sanitizedStyles });
      }
    } else if (type === 'visibility') {
      validActions.push({
        type: 'visibility',
        element: elementKey,
        visible: Boolean(action.visible)
      });
    } else if (type === 'rotate') {
      let rotation = Number(action.rotation);
      if (!isNaN(rotation)) {
        rotation = Math.max(-360, Math.min(360, Math.round(rotation)));
        validActions.push({ type: 'rotate', element: elementKey, rotation });
      }
    } else if (type === 'reorder') {
      validActions.push({
        type: 'reorder',
        element: elementKey,
        direction: action.direction,
        zIndex: action.zIndex !== undefined ? Number(action.zIndex) : undefined
      });
    } else if (type === 'theme') {
      validActions.push({
        type: 'theme',
        themeId: sanitizeString(action.themeId),
        background: sanitizeString(action.background),
        headerBg: sanitizeString(action.headerBg),
        borderColor: sanitizeString(action.borderColor),
        accentColor: sanitizeString(action.accentColor)
      });
    }
  }

  return validActions;
}
