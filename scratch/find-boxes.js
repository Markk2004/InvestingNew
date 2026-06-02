import fs from 'fs';
import { PNG } from 'pngjs';

const data = fs.readFileSync('public/furniture.png');
const png = PNG.sync.read(data);

const width = png.width;
const height = png.height;
const pixels = png.data;

// A pixel is empty if it's white (chroma key) or transparent
function isEmpty(x, y) {
  const idx = (y * width + x) * 4;
  const r = pixels[idx];
  const g = pixels[idx + 1];
  const b = pixels[idx + 2];
  const a = pixels[idx + 3];
  if (a === 0) return true;
  if (r > 248 && g > 248 && b > 248) return true;
  return false;
}

const visited = new Array(width * height).fill(false);
const boxes = [];

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!isEmpty(x, y) && !visited[y * width + x]) {
      // Start BFS/DFS to find bounding box of this connected component
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
            if (!isEmpty(nx, ny) && !visited[nIdx]) {
              visited[nIdx] = true;
              queue.push([nx, ny]);
            }
          }
        }
      }

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      if (w >= 4 && h >= 4) { // Filter out tiny noise
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

console.log(`Found ${boxes.length} sprites in furniture.png:`);
boxes.forEach((b, i) => {
  console.log(`Sprite #${i}: src_x=${b.x}, src_y=${b.y}, w=${b.w}, h=${b.h}`);
});
