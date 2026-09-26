/**
 * Client-side image analysis & palette extraction.
 * Extracts dominant colors from an uploaded image to auto-theme the ID card.
 */

export function processUploadedImage(file, maxDimension = 800) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        const palette = extractPaletteFromCanvas(canvas);

        resolve({
          dataUrl: resizedDataUrl,
          palette,
          width,
          height,
          aspectRatio: width / height
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function rgbToHex(r, g, b) {
  const toHex = (c) => ('0' + Math.max(0, Math.min(255, Math.round(c))).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function extractPaletteFromCanvas(canvas) {
  try {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 40;
    sampleCanvas.height = 40;
    const ctx = sampleCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 40, 40);

    const imgData = ctx.getImageData(0, 0, 40, 40).data;
    const colorBuckets = {};

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue; // Skip transparent
      // Skip pure black and pure white for primary detection
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness > 245 || brightness < 15) continue;

      // Quantize to 32 steps
      const qr = Math.round(r / 32) * 32;
      const qg = Math.round(g / 32) * 32;
      const qb = Math.round(b / 32) * 32;
      const key = `${qr},${qg},${qb}`;
      colorBuckets[key] = (colorBuckets[key] || 0) + 1;
    }

    const sortedBuckets = Object.entries(colorBuckets).sort((a, b) => b[1] - a[1]);

    if (sortedBuckets.length > 0) {
      const [r1, g1, b1] = sortedBuckets[0][0].split(',').map(Number);
      const primary = rgbToHex(r1, g1, b1);

      let accent = '#38bdf8';
      if (sortedBuckets.length > 1) {
        const [r2, g2, b2] = sortedBuckets[1][0].split(',').map(Number);
        accent = rgbToHex(r2, g2, b2);
      }

      return {
        primary,
        accent,
        headerGradient: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
        background: '#ffffff'
      };
    }
  } catch (err) {
    console.warn('Failed to extract palette:', err);
  }

  return {
    primary: '#1e3a8a',
    accent: '#38bdf8',
    headerGradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    background: '#ffffff'
  };
}
