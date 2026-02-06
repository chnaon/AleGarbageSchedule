// Generate simple PNG icons for PWA
// Uses raw PNG encoding without external dependencies

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

function createPNG(width, height, drawFunc) {
  const pixels = Buffer.alloc(width * height * 4);

  // Fill with background color (#16a34a = rgb(22, 163, 74))
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // Check if within rounded rect
      const r = width * 0.18; // corner radius
      const inRoundedRect = isInRoundedRect(x, y, 0, 0, width, height, r);
      if (inRoundedRect) {
        pixels[i] = 22; // R
        pixels[i + 1] = 163; // G
        pixels[i + 2] = 74; // B
        pixels[i + 3] = 255; // A
      } else {
        pixels[i + 3] = 0; // transparent
      }
    }
  }

  // Draw icon elements
  drawFunc(pixels, width, height);

  // Create PNG file
  return encodePNG(pixels, width, height);
}

function isInRoundedRect(x, y, rx, ry, rw, rh, radius) {
  if (x < rx || x >= rx + rw || y < ry || y >= ry + rh) return false;

  // Check corners
  const corners = [
    [rx + radius, ry + radius],
    [rx + rw - radius, ry + radius],
    [rx + radius, ry + rh - radius],
    [rx + rw - radius, ry + rh - radius],
  ];

  for (const [cx, cy] of corners) {
    const inCornerRegion =
      (x < rx + radius || x >= rx + rw - radius) &&
      (y < ry + radius || y >= ry + rh - radius);
    if (inCornerRegion) {
      const dx = x - cx;
      const dy = y - cy;
      if (
        (x < rx + radius && y < ry + radius && dx < 0 && dy < 0) ||
        (x >= rx + rw - radius && y < ry + radius && dx > 0 && dy < 0) ||
        (x < rx + radius && y >= ry + rh - radius && dx < 0 && dy > 0) ||
        (x >= rx + rw - radius && y >= ry + rh - radius && dx > 0 && dy > 0)
      ) {
        if (dx * dx + dy * dy > radius * radius) return false;
      }
    }
  }
  return true;
}

function fillRect(pixels, w, h, x1, y1, x2, y2, r, g, b) {
  for (let y = Math.max(0, Math.floor(y1)); y < Math.min(h, Math.ceil(y2)); y++) {
    for (let x = Math.max(0, Math.floor(x1)); x < Math.min(w, Math.ceil(x2)); x++) {
      const i = (y * w + x) * 4;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = 255;
    }
  }
}

function fillCircle(pixels, w, h, cx, cy, radius, r, g, b) {
  for (let y = Math.max(0, Math.floor(cy - radius)); y < Math.min(h, Math.ceil(cy + radius)); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius)); x < Math.min(w, Math.ceil(cx + radius)); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        const i = (y * w + x) * 4;
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255;
      }
    }
  }
}

function drawTrashCan(pixels, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / 192;

  // White color
  const wr = 255, wg = 255, wb = 255;
  // Green color for lines
  const gr = 22, gg = 163, gb = 74;

  // Handle
  fillRect(pixels, w, h,
    cx - 12 * scale, cy - 58 * scale,
    cx + 12 * scale, cy - 44 * scale,
    wr, wg, wb);

  // Lid
  fillRect(pixels, w, h,
    cx - 40 * scale, cy - 48 * scale,
    cx + 40 * scale, cy - 36 * scale,
    wr, wg, wb);

  // Body (simplified as rectangle with slight taper)
  fillRect(pixels, w, h,
    cx - 34 * scale, cy - 32 * scale,
    cx + 34 * scale, cy + 52 * scale,
    wr, wg, wb);

  // Lines on body (green on white)
  const lineWidth = 4 * scale;
  for (const offset of [-14, 0, 14]) {
    fillRect(pixels, w, h,
      cx + offset * scale - lineWidth / 2, cy - 16 * scale,
      cx + offset * scale + lineWidth / 2, cy + 36 * scale,
      gr, gg, gb);
  }
}

function encodePNG(pixels, width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk("IHDR", ihdr);

  // IDAT chunk
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const srcI = (y * width + x) * 4;
      const dstI = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstI] = pixels[srcI];
      rawData[dstI + 1] = pixels[srcI + 1];
      rawData[dstI + 2] = pixels[srcI + 2];
      rawData[dstI + 3] = pixels[srcI + 3];
    }
  }
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk("IDAT", compressed);

  // IEND chunk
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate icons
const iconsDir = path.join(__dirname, "..", "public", "icons");

for (const size of [192, 512]) {
  const png = createPNG(size, size, drawTrashCan);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.png`), png);
  console.log(`Generated icon-${size}.png (${png.length} bytes)`);
}
