import fs from 'fs';
import { PNG } from 'pngjs';
import path from 'path';

function isEmpty(pixels, width, x, y) {
  const idx = (y * width + x) * 4;
  const r = pixels[idx];
  const g = pixels[idx + 1];
  const b = pixels[idx + 2];
  const a = pixels[idx + 3];
  if (a === 0) return true;
  // If it's near-white, treat as transparent (chroma key)
  if (r > 248 && g > 248 && b > 248) return true;
  return false;
}

function scanImage(filename) {
  const filePath = path.join('public', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  const data = fs.readFileSync(filePath);
  const png = PNG.sync.read(data);
  const width = png.width;
  const height = png.height;
  const pixels = png.data;
  
  const visited = new Array(width * height).fill(false);
  const boxes = [];
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!isEmpty(pixels, width, x, y) && !visited[y * width + x]) {
        let minX = x, maxX = x, minY = y, maxY = y;
        const queue = [[x, y]];
        visited[y * width + x] = true;
        
        while (queue.length > 0) {
          const [cx, cy] = queue.shift();
          if (cx < minX) minX = cx;
          if (cx > maxX) maxX = cx;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
          
          const neighbors = [
            [cx + 1, cy],
            [cx - 1, cy],
            [cx, cy + 1],
            [cx, cy - 1]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (!isEmpty(pixels, width, nx, ny) && !visited[nIdx]) {
                visited[nIdx] = true;
                queue.push([nx, ny]);
              }
            }
          }
        }
        
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        if (w >= 4 && h >= 4) { // Filter out small noise
          boxes.push({ x: minX, y: minY, w, h });
        }
      }
    }
  }
  
  // Sort boxes top-to-bottom, left-to-right
  boxes.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 10) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
  
  console.log(`\n--- Sprites in ${filename} (${width}x${height}): Found ${boxes.length} sprites ---`);
  boxes.forEach((b, i) => {
    console.log(`Sprite #${i}: x=${b.x}, y=${b.y}, w=${b.w}, h=${b.h}`);
  });
}

const files = [
  'stylish_furnitureset.png',
  'stylish_modularfurniture.png',
  'stylish_room_door_tiles.png'
];

files.forEach(scanImage);
