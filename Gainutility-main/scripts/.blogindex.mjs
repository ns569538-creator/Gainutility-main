import fs from "node:fs";

const h = fs.readFileSync("dist/client/blog.html", "utf8");
console.log("bytes", h.length);
console.log("article tags:", h.split("<article").length - 1);
console.log("blog-section-title:", h.split("blog-section-title").length - 1);
console.log("blog-display:", h.split("blog-display").length - 1);
console.log("Load More:", h.split("Load More").length - 1);
const links = [...h.matchAll(/href="(?:https:\/\/gainutility\.com)?(\/blog\/[a-z0-9-]+)"/g)].map((m) => m[1]);
console.log("unique links:", [...new Set(links)].length);
console.log([...new Set(links)].join("\n"));
const i = h.indexOf("blog-section-title");
if (i > 0) console.log("\ncontext:\n" + h.slice(i - 300, i + 900));
