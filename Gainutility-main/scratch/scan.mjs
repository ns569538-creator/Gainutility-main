import fs from "node:fs";
import path from "node:path";

const patterns = process.argv.slice(2);
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) {
      const lines = fs.readFileSync(p, "utf8").split(/\r?\n/);
      lines.forEach((l, i) => {
        for (const pat of patterns) {
          if (l.includes(pat)) {
            console.log(`${p}:${i + 1}: ${l.trim().slice(0, 150)}`);
            break;
          }
        }
      });
    }
  }
};
walk("src");
