const fs = require('fs');
const lines = fs.readFileSync('found_views.txt', 'utf8').split('\n');

const result = new Map();

let parsing = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^Showing lines (\d+) to (\d+)/)) {
    parsing = true;
    continue;
  }
  if (line.startsWith('The following code has been modified') || line.startsWith('The above content does NOT show') || line.startsWith('==================') || line.startsWith('The above content shows the entire')) {
    if (!line.startsWith('The following code')) parsing = false;
    continue;
  }
  if (parsing) {
    const match = line.match(/^(\d+): (.*)$/);
    if (match) {
      const lineNum = parseInt(match[1], 10);
      const content = match[2];
      result.set(lineNum, content);
    } else if (line.match(/^\d+:$/)) {
      const lineNum = parseInt(line.replace(':', ''), 10);
      result.set(lineNum, '');
    }
  }
}

const maxLine = Math.max(...Array.from(result.keys()));
let fullContent = '';
for (let i = 1; i <= maxLine; i++) {
  if (result.has(i)) {
    fullContent += result.get(i) + '\n';
  } else {
    fullContent += '\n';
  }
}

fs.writeFileSync('index.html', fullContent, 'utf8');
console.log('Recovered max line:', maxLine, 'Total recovered lines:', result.size);
