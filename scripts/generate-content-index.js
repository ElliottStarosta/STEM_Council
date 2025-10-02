import fs from 'fs';
import path from 'path';

const contentDirs = {
  clubs: 'src/content/clubs',
  events: 'src/content/events',
  resources: 'src/content/resources'
};

const index = {};

Object.entries(contentDirs).forEach(([key, dir]) => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir)
      .filter(file => file.endsWith('.md') || file.endsWith('.json'));
    index[key] = files;
  }
});

fs.writeFileSync(
  'src/content/index.json',
  JSON.stringify(index, null, 2)
);

console.log('Content index generated:', index);