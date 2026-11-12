import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lengthBuf = Buffer.alloc(4);
  lengthBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lengthBuf, typeBuf, data, crcBuf]);
}

/**
 * Render icon directly matching Habitly's branding:
 * Background: #10B981 (Emerald)
 * Foreground: White "H" with rounded pill bars
 * Accent: Mint green (#34D399) spark circle
 *
 * @param {number} size
 * @param {Object} options
 * @param {boolean} options.isMaskable - full bleed background without rounded corners
 * @param {number} options.scale - scale factor for inner symbol
 */
function renderHabitlyIcon(size, { isMaskable = false, scale = 1.0 } = {}) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  const rowSize = 1 + size * 4;
  const rawData = Buffer.alloc(rowSize * size);

  // Background color (#10B981)
  const bgR = 16, bgG = 185, bgB = 129;
  // Accent mint (#34D399)
  const accR = 52, accG = 211, accB = 153;

  // Geometry in normalized coordinates [0, 1]
  const cornerRadius = isMaskable ? 0 : 0.22; // 22% rounded corner for regular icon

  // Symbol base points (normalized)
  const cx = 0.5, cy = 0.5;
  // Bar positions relative to center
  const barWidth = 0.09 * scale;
  const barRadius = barWidth / 2;
  const xLeft = cx - 0.18 * scale;
  const xRight = cx + 0.18 * scale;
  const yTop = cy - 0.22 * scale;
  const yBottom = cy + 0.22 * scale;
  const yCross = cy;

  // Accent circle at top-right
  const dotX = xRight;
  const dotY = yTop;
  const dotRadius = 0.06 * scale;

  // Helper: Distance to segment
  function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // Helper: check if inside rounded rectangle
  function isInRoundedRect(px, py, radius) {
    if (radius <= 0) return true;
    const r = radius;
    // Four corner centers
    const ctl = { x: r, y: r };
    const ctr = { x: 1 - r, y: r };
    const cbl = { x: r, y: 1 - r };
    const cbr = { x: 1 - r, y: 1 - r };

    if (px < r && py < r) return Math.hypot(px - ctl.x, py - ctl.y) <= r;
    if (px > 1 - r && py < r) return Math.hypot(px - ctr.x, py - ctr.y) <= r;
    if (px < r && py > 1 - r) return Math.hypot(px - cbl.x, py - cbl.y) <= r;
    if (px > 1 - r && py > 1 - r) return Math.hypot(px - cbr.x, py - cbr.y) <= r;
    return true;
  }

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0

    const ny = (y + 0.5) / size;

    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size;
      const pixelOffset = rowOffset + 1 + x * 4;

      // 1. Check background shape
      if (!isInRoundedRect(nx, ny, cornerRadius)) {
        // Transparent corner
        rawData[pixelOffset] = 0;
        rawData[pixelOffset + 1] = 0;
        rawData[pixelOffset + 2] = 0;
        rawData[pixelOffset + 3] = 0;
        continue;
      }

      // Default: Emerald background
      let r = bgR, g = bgG, b = bgB, a = 255;

      // 2. Check if inside "H" paths
      // Left bar
      const dLeft = distToSegment(nx, ny, xLeft, yTop, xLeft, yBottom);
      // Right bar
      const dRight = distToSegment(nx, ny, xRight, yTop, xRight, yBottom);
      // Cross bar
      const dCross = distToSegment(nx, ny, xLeft, yCross, xRight, yCross);

      const dH = Math.min(dLeft, dRight, dCross);

      // Dot distance
      const dDot = Math.hypot(nx - dotX, ny - dotY);

      if (dDot <= dotRadius) {
        // Mint accent circle
        r = accR;
        g = accG;
        b = accB;
      } else if (dH <= barRadius) {
        // White "H"
        r = 255;
        g = 255;
        b = 255;
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = writeChunk('IDAT', deflated);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Standard 192x192
fs.writeFileSync(path.join(outDir, 'icon-192.png'), renderHabitlyIcon(192, { isMaskable: false, scale: 1.0 }));

// 2. Standard 512x512
fs.writeFileSync(path.join(outDir, 'icon-512.png'), renderHabitlyIcon(512, { isMaskable: false, scale: 1.0 }));

// 3. Maskable 512x512 (Safe-zone 80%, full-bleed solid background)
fs.writeFileSync(path.join(outDir, 'maskable-512.png'), renderHabitlyIcon(512, { isMaskable: true, scale: 0.78 }));

// 4. Apple Touch Icon 180x180 (iOS adds its own mask, full bleed)
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), renderHabitlyIcon(180, { isMaskable: true, scale: 0.85 }));

console.log('Successfully generated crisp, final Habitly PWA icons (192, 512, maskable, apple-touch)!');
