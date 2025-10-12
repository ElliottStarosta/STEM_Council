import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base project directory (one level up from /scripts)
const baseDir = path.resolve(__dirname, '..');

// Define your content folders
const contentDirs = {
  clubs: path.join(baseDir, 'src', 'content', 'clubs'),
  events: path.join(baseDir, 'src', 'content', 'events'),
  resources: path.join(baseDir, 'src', 'content', 'resources')
};

const index = {};

// Scan directories
Object.entries(contentDirs).forEach(([key, dir]) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.md') || file.endsWith('.json'));
    index[key] = files;
  }
});

// ✅ Save to src/content/index.json
const outputPath = path.join(baseDir, 'src', 'content', 'index.json');
fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

console.log('✅ Content index generated at:', outputPath);
console.log(index);
