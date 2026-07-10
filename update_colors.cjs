const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace text colors
content = content.replace(/text-white\/40/g, 'text-slate-500');
content = content.replace(/text-white\/50/g, 'text-slate-500');
content = content.replace(/text-white\/60/g, 'text-slate-600');
content = content.replace(/text-white\/70/g, 'text-slate-700');
content = content.replace(/text-white\/80/g, 'text-slate-800');
content = content.replace(/text-white/g, 'text-slate-900');

// Replace border colors
content = content.replace(/border-white\/5/g, 'border-slate-300/40');
content = content.replace(/border-white\/10/g, 'border-slate-300/60');
content = content.replace(/border-white\/20/g, 'border-slate-300/80');

// Replace bg colors for subtle elements
content = content.replace(/bg-white\/5/g, 'bg-white/60');
content = content.replace(/bg-white\/10/g, 'bg-white/80');
content = content.replace(/bg-white\/20/g, 'bg-white');

// Tooltip background in recharts
content = content.replace(/background: 'rgba\(30,31,43,0.95\)'/g, "background: 'rgba(255,255,255,0.95)'");
content = content.replace(/color: 'white'/g, "color: '#0f172a'");

fs.writeFileSync(file, content);
console.log("Colors updated in App.tsx");
