import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';

// CR80 Card Dimensions (Standard Credit / ID Card Ratio: 85.60mm x 53.98mm = ~1.5858)
export const CR80_DIMENSIONS = {
  mm: { width: 85.60, height: 53.98 },
  landscape: { width: 640, height: 404 }, // High-clarity 1.584 aspect
  portrait: { width: 404, height: 640 }
};

// Generate QR Code Data URL
export async function generateQrDataUrl(text, options = {}) {
  try {
    const dataUrl = await QRCode.toDataURL(text || 'ID-0000', {
      width: options.width || 200,
      margin: options.margin !== undefined ? options.margin : 1,
      color: {
        dark: options.color || '#000000',
        light: options.bgColor || '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return null;
  }
}

// Generate Barcode Data URL via an offscreen canvas
export function generateBarcodeDataUrl(value, options = {}) {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, value || '12345678', {
      format: options.format || 'CODE128',
      width: options.barWidth || 2,
      height: options.height || 60,
      displayValue: options.displayValue !== false,
      font: 'JetBrains Mono',
      fontSize: 12,
      background: options.bgColor || '#ffffff',
      lineColor: options.color || '#000000',
      margin: options.margin !== undefined ? options.margin : 6
    });
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Error generating barcode:', err);
    return null;
  }
}

// Replace dynamic placeholders like {{name}} or {{rollNumber}} with real data
export function resolveDynamicValue(text, data = {}) {
  if (typeof text !== 'string') return text;
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, field) => {
    // Check direct match
    if (data[field] !== undefined && data[field] !== '') {
      return data[field];
    }
    // Check aliases
    const aliases = {
      name: data.fullName || data.name,
      employee_id: data.rollNumber || data.employee_id || data.id,
      rollNumber: data.rollNumber || data.id,
      department: data.branch || data.department,
      designation: data.year || data.designation || 'Student',
      company_name: data.collegeName || data.company_name || 'Institution',
      collegeName: data.collegeName,
      phone: data.phone,
      email: data.email,
      dob: data.dob,
      bloodGroup: data.bloodGroup,
      address: data.address,
      joining_date: data.joining_date || '2023-08-01',
      expiry_date: data.expiry_date || '2027-06-30'
    };
    return aliases[field] !== undefined ? aliases[field] : match;
  });
}

// Export Konva Stage to Image (PNG / JPEG)
export function exportStageToImage(stageRef, format = 'png', pixelRatio = 3) {
  if (!stageRef?.current) return null;
  const stage = stageRef.current;
  
  // Hide transformer/guidelines prior to render
  const transformer = stage.findOne('Transformer');
  const wasVisible = transformer ? transformer.visible() : false;
  if (transformer) transformer.visible(false);

  const mime = format === 'jpeg' || format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataUrl = stage.toDataURL({
    pixelRatio,
    mimeType: mime,
    quality: 0.95
  });

  if (transformer && wasVisible) transformer.visible(true);
  return dataUrl;
}

// Trigger browser download for an image dataURL
export function downloadDataUrl(dataUrl, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Card to PDF with standard physical CR80 dimensions
export function exportCardToPdf(stageRef, filename = 'id-card.pdf', orientation = 'landscape') {
  if (!stageRef?.current) return;
  const dataUrl = exportStageToImage(stageRef, 'png', 3);
  if (!dataUrl) return;

  const isLandscape = orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [CR80_DIMENSIONS.mm.width, CR80_DIMENSIONS.mm.height]
  });

  const width = isLandscape ? CR80_DIMENSIONS.mm.width : CR80_DIMENSIONS.mm.height;
  const height = isLandscape ? CR80_DIMENSIONS.mm.height : CR80_DIMENSIONS.mm.width;

  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height, undefined, 'FAST');
  pdf.save(filename);
}

// Print the card using an isolated printable iframe
export function printCardStage(stageRef, orientation = 'landscape') {
  const dataUrl = exportStageToImage(stageRef, 'png', 3);
  if (!dataUrl) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;

  const isLandscape = orientation === 'landscape';
  const widthMm = isLandscape ? 85.6 : 53.98;
  const heightMm = isLandscape ? 53.98 : 85.6;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print ID Card</title>
        <style>
          @page {
            size: ${widthMm}mm ${heightMm}mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #fff;
          }
          img {
            width: ${widthMm}mm;
            height: ${heightMm}mm;
            display: block;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
}

// Snap a value to a grid step
export function snapToGrid(val, gridSize = 10) {
  return Math.round(val / gridSize) * gridSize;
}

// Convert generated ID Card from /create into a Canvas Studio design in Landscape mode
export function buildCanvasDesignFromGenerated(student = {}, design = {}) {
  const cardTheme = design.card || {};
  let headerBgColor = '#1e3a8a';
  if (cardTheme.headerBg) {
    if (cardTheme.headerBg.includes('gradient')) {
      const hexMatches = cardTheme.headerBg.match(/#[a-fA-F0-9]{3,6}/g);
      headerBgColor = hexMatches?.[1] || hexMatches?.[0] || '#1e3a8a';
    } else {
      headerBgColor = cardTheme.headerBg;
    }
  }

  const accentColor = cardTheme.accentColor || '#38bdf8';
  const cardBg = cardTheme.background || '#ffffff';

  const studentName = student.fullName || 'Harshavardhan';
  const rollNumber = student.rollNumber || '21B91A0582';
  const collegeName = student.collegeName || 'National Institute of Technology';
  const branch = student.branch || 'Computer Science & Engineering';
  const yearSection = `${student.year || '4th Year'}${student.section ? ' • Sec ' + student.section : ''}`;
  const phone = student.phone || '+91 98765 43210';
  const email = student.email || 'student@college.edu';
  const bloodGroup = student.bloodGroup || 'O+';
  const address = student.address || 'Hyderabad, Telangana';
  const photoSrc = student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';
  const logoSrc = student.logoUrl || '';

  return {
    id: 'generated-card-studio',
    name: `${studentName}'s ID Card (Generated)`,
    category: 'Generated',
    orientation: 'landscape',
    front: {
      background: {
        type: 'solid',
        color: cardBg,
        opacity: 1
      },
      elements: [
        // Header Banner
        {
          id: 'elem-header-bar',
          name: 'Header Banner',
          type: 'shape',
          shapeType: 'rect',
          x: 0,
          y: 0,
          width: 640,
          height: 80,
          fill: headerBgColor,
          stroke: '',
          strokeWidth: 0,
          cornerRadius: 0,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Optional College Logo
        ...(logoSrc
          ? [
              {
                id: 'elem-college-logo',
                name: 'College Logo',
                type: 'image',
                src: logoSrc,
                x: 20,
                y: 16,
                width: 48,
                height: 48,
                opacity: 1,
                locked: false,
                visible: true
              }
            ]
          : []),
        // Institution Name
        {
          id: 'elem-inst-name',
          name: 'Institution Name',
          type: 'text',
          text: collegeName.toUpperCase(),
          fontSize: 16,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 'bold',
          fill: '#ffffff',
          align: 'left',
          x: logoSrc ? 78 : 24,
          y: 18,
          width: 460,
          height: 24,
          letterSpacing: 0.5,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Tagline / Ribbon
        {
          id: 'elem-inst-sub',
          name: 'Ribbon',
          type: 'text',
          text: 'STUDENT IDENTITY CREDENTIAL • 2024-2028',
          fontSize: 9,
          fontFamily: 'JetBrains Mono',
          fontWeight: '600',
          fill: accentColor,
          align: 'left',
          x: logoSrc ? 78 : 24,
          y: 44,
          width: 420,
          height: 18,
          letterSpacing: 1,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Photo Frame Border Box
        {
          id: 'elem-photo-bg',
          name: 'Photo Frame',
          type: 'shape',
          shapeType: 'rounded-rect',
          x: 28,
          y: 104,
          width: 144,
          height: 170,
          fill: '#f1f5f9',
          stroke: accentColor,
          strokeWidth: 2,
          cornerRadius: 12,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Profile Photo
        {
          id: 'elem-profile-photo',
          name: 'Student Photo',
          type: 'image',
          src: photoSrc,
          x: 30,
          y: 106,
          width: 140,
          height: 166,
          clipType: 'rounded',
          cornerRadius: 10,
          borderWidth: 0,
          borderColor: accentColor,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Student Full Name
        {
          id: 'elem-student-name',
          name: 'Student Name',
          type: 'text',
          text: studentName.toUpperCase(),
          fontSize: 22,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '800',
          fill: '#0f172a',
          align: 'left',
          x: 195,
          y: 104,
          width: 320,
          height: 30,
          letterSpacing: 0,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Roll Number
        {
          id: 'elem-id-badge',
          name: 'Roll Number',
          type: 'text',
          text: `ROLL NO: ${rollNumber}`,
          fontSize: 13,
          fontFamily: 'JetBrains Mono',
          fontWeight: 'bold',
          fill: '#2563eb',
          align: 'left',
          x: 195,
          y: 140,
          width: 300,
          height: 22,
          letterSpacing: 0.5,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Department / Branch
        {
          id: 'elem-dept',
          name: 'Branch / Major',
          type: 'text',
          text: `BRANCH: ${branch}`,
          fontSize: 12,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '600',
          fill: '#475569',
          align: 'left',
          x: 195,
          y: 170,
          width: 310,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Academic Year & Section
        {
          id: 'elem-year',
          name: 'Academic Year',
          type: 'text',
          text: `YEAR: ${yearSection}`,
          fontSize: 12,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '500',
          fill: '#64748b',
          align: 'left',
          x: 195,
          y: 198,
          width: 310,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Blood Group
        {
          id: 'elem-blood-group',
          name: 'Blood Group',
          type: 'text',
          text: `BLOOD: ${bloodGroup}`,
          fontSize: 12,
          fontFamily: 'JetBrains Mono',
          fontWeight: 'bold',
          fill: '#dc2626',
          align: 'left',
          x: 195,
          y: 226,
          width: 200,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Emergency Phone
        {
          id: 'elem-emergency-phone',
          name: 'Helpline',
          type: 'text',
          text: `PH: ${phone}`,
          fontSize: 11,
          fontFamily: 'JetBrains Mono',
          fontWeight: '500',
          fill: '#475569',
          align: 'left',
          x: 195,
          y: 254,
          width: 250,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // QR Code
        {
          id: 'elem-qr-code',
          name: 'Verification QR',
          type: 'qr',
          value: JSON.stringify({ name: studentName, id: rollNumber, inst: collegeName, blood: bloodGroup }),
          x: 520,
          y: 104,
          width: 95,
          height: 95,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Bottom Accent Divider Line
        {
          id: 'elem-footer-accent',
          name: 'Accent Line',
          type: 'shape',
          shapeType: 'rect',
          x: 0,
          y: 396,
          width: 640,
          height: 8,
          fill: accentColor,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Validity Note
        {
          id: 'elem-validity-strip',
          name: 'Validity Note',
          type: 'text',
          text: `VALID THRU: 2028-06-30 • EMAIL: ${email}`,
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
          fontWeight: '500',
          fill: '#64748b',
          align: 'left',
          x: 28,
          y: 368,
          width: 580,
          height: 18,
          opacity: 1,
          locked: false,
          visible: true
        }
      ]
    },
    back: {
      background: {
        type: 'solid',
        color: '#ffffff',
        opacity: 1
      },
      elements: [
        // Back Header
        {
          id: 'elem-back-header',
          name: 'Rules Header',
          type: 'text',
          text: 'TERMS & INSTRUCTIONS',
          fontSize: 13,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '800',
          fill: '#0f172a',
          align: 'left',
          x: 30,
          y: 24,
          width: 300,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Terms Body
        {
          id: 'elem-back-rules',
          name: 'Instructions Text',
          type: 'text',
          text: `1. This credential is non-transferable and remains property of ${collegeName}.\n2. Report loss immediately to Academic Registrar office.\n3. Mandatory for campus, examination halls, library, and laboratory access.`,
          fontSize: 11,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 'normal',
          fill: '#475569',
          align: 'left',
          x: 30,
          y: 54,
          width: 580,
          height: 70,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Campus Address
        {
          id: 'elem-back-address',
          name: 'Campus Address',
          type: 'text',
          text: `CAMPUS ADDRESS: ${address}`,
          fontSize: 10,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '600',
          fill: '#64748b',
          align: 'left',
          x: 30,
          y: 150,
          width: 580,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Emergency Phone
        {
          id: 'elem-back-phone',
          name: 'Emergency Contact',
          type: 'text',
          text: `EMERGENCY HELPLINE: ${phone} | EMAIL: ${email}`,
          fontSize: 10,
          fontFamily: 'JetBrains Mono',
          fontWeight: '600',
          fill: '#1e40af',
          align: 'left',
          x: 30,
          y: 180,
          width: 580,
          height: 20,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Barcode
        {
          id: 'elem-back-barcode',
          name: 'Access Barcode',
          type: 'barcode',
          value: rollNumber,
          x: 180,
          y: 240,
          width: 280,
          height: 60,
          opacity: 1,
          locked: false,
          visible: true
        },
        // Bottom Accent
        {
          id: 'elem-back-footer-accent',
          name: 'Back Accent Line',
          type: 'shape',
          shapeType: 'rect',
          x: 0,
          y: 396,
          width: 640,
          height: 8,
          fill: accentColor,
          opacity: 1,
          locked: false,
          visible: true
        }
      ]
    }
  };
}
