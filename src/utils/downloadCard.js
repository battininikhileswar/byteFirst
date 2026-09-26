import { toPng } from 'html-to-image';

/**
 * Downloads the Digital ID Card as a high-resolution PNG image in its natural,
 * flat, un-mirrored orientation.
 *
 * Strips away any selection rings, resize handles, floating toolbars, and alignment guides.
 *
 * @param {HTMLElement} element - The DOM element of the ID card or its front face
 * @param {string} fileName - The desired download filename
 * @returns {Promise<boolean>}
 */
export const downloadCardAsImage = async (element, fileName = 'student-id-card.png') => {
  if (!element) {
    throw new Error('ID card element not found');
  }

  // Identify the canonical front card element (single source of truth)
  const target = element.id === 'downloadable-id-card'
    ? element
    : (element.querySelector('#downloadable-id-card') || element);

  const isHorizontal = target.style.width === '600px' ||
    target.classList.contains('face-horizontal') ||
    target.classList.contains('horizontal') ||
    (target.closest && target.closest('.orientation-horizontal') !== null);

  // Exact standard dimensions matching design ratio
  const cardWidth = isHorizontal ? 600 : 380;
  const cardHeight = isHorizontal ? 380 : 600;

  // Create temporary export clone
  const exportClone = target.cloneNode(true);

  // Strip away any 3D back-face elements that might have been cloned
  exportClone.querySelectorAll('.id-card-back, .rotate-y-180').forEach((el) => el.remove());

  // Strip away selection outlines, resize handles, toolbars, and alignment guides
  exportClone.querySelectorAll('[class*="ring-2"], [class*="ring-1"]').forEach((el) => {
    el.className = el.className.replace(/ring-[^\s]+/g, '').replace(/shadow-[^\s]+/g, '');
  });
  exportClone.querySelectorAll('[class*="cursor-nwse-resize"], [class*="cursor-nesw-resize"]').forEach((el) => el.remove());
  exportClone.querySelectorAll('[class*="z-\\[100\\]"]').forEach((el) => el.remove());
  exportClone.querySelectorAll('[class*="pointer-events-none absolute inset-0"]').forEach((el) => el.remove());

  // Apply dedicated export-safe class
  exportClone.classList.add('id-card-export');

  // Explicitly enforce flat, un-mirrored layout on the clone
  exportClone.style.transform = 'none';
  exportClone.style.perspective = 'none';
  exportClone.style.transformStyle = 'flat';
  exportClone.style.backfaceVisibility = 'visible';
  exportClone.style.webkitBackfaceVisibility = 'visible';
  exportClone.style.position = 'relative';
  exportClone.style.inset = 'auto';
  exportClone.style.width = `${cardWidth}px`;
  exportClone.style.height = `${cardHeight}px`;
  exportClone.style.boxShadow = 'none';
  exportClone.style.margin = '0';
  exportClone.style.animation = 'none';
  exportClone.style.transition = 'none';

  // Inherit all active theme CSS variables from the live element
  const computed = window.getComputedStyle(target);
  const themeVars = [
    '--theme-primary',
    '--theme-secondary',
    '--theme-accent',
    '--theme-header-bg',
    '--theme-light-bg',
    '--theme-badge-bg',
    '--theme-border'
  ];
  themeVars.forEach((varName) => {
    const val = computed.getPropertyValue(varName);
    if (val) {
      exportClone.style.setProperty(varName, val.trim());
    }
  });

  // Create off-screen sandbox container attached to DOM
  const container = document.createElement('div');
  container.className = 'id-card-export-sandbox';
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = `${cardWidth}px`;
  container.style.height = `${cardHeight}px`;
  container.style.overflow = 'hidden';
  container.style.zIndex = '-99999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';
  container.style.background = 'transparent';

  container.appendChild(exportClone);
  document.body.appendChild(container);

  try {
    // Generate high-resolution image with 3x pixel ratio
    const dataUrl = await toPng(exportClone, {
      quality: 0.98,
      pixelRatio: 3,
      cacheBust: true,
      skipFonts: true,
      width: cardWidth,
      height: cardHeight,
      style: {
        transform: 'none',
        margin: '0',
        boxShadow: 'none',
        borderRadius: '16px'
      }
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error generating card image:', error);
    throw error;
  } finally {
    // Always clean up the temporary export clone
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};

/**
 * Trigger print dialog specifically configured for ID card print
 */
export const printCard = () => {
  window.print();
};
