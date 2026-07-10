const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(file, 'utf8');

// The new unified palette:
content = content.replace(/#9482c9/g, '#0ea5e9');
content = content.replace(/#34a076/g, '#0284c7');
content = content.replace(/#d69e38/g, '#38bdf8');
content = content.replace(/#d95858/g, '#7dd3fc');

content = content.replace(/#10b981/g, '#0284c7');
content = content.replace(/#f59e0b/g, '#38bdf8');
content = content.replace(/#ef4444/g, '#7dd3fc');
content = content.replace(/#a78bfa/g, '#0ea5e9');
content = content.replace(/#f87171/g, '#7dd3fc');
content = content.replace(/#34d399/g, '#0284c7');
content = content.replace(/#fb923c/g, '#38bdf8');

content = content.replace(/#ff8c00/g, '#0ea5e9'); // Keys icon

fs.writeFileSync(file, content);
console.log("Unified colors in App.tsx");
