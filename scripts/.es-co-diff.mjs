import { readFileSync, existsSync } from "node:fs";

const pairs = [
  ["/es-co/about", "/es-mx/about"],
  ["/es-co/tools/contrast-checker", "/es-mx/tools/contrast-checker"],
  ["/es-co/pdf", "/es-mx/pdf"],
  ["/es-co", "/es-mx"],
];
const strip = (s) =>
  s
    .replace(/<link[^>]*rel="canonical"[^>]*>/g, "<C/>")
    .replace(/<link[^>]*hreflang[^>]*>/g, "<H/>")
    .replace(/<meta[^>]+property="og:locale"[^>]+>/g, "<OL/>")
    .replace(/<meta[^>]+property="og:url"[^>]+>/g, "<OU/>")
    .replace(/<meta[^>]+property="twitter:url"[^>]+>/g, "<TU/>")
    .replace(/<html lang="[^"]*"/, "<html lang=X")
    .replace(/assets\/[^"]+\.(css|js)/g, "assets/H.$1")
    .replace(/\/es-(co|mx)(\/|")/g, "/es-xx$2");
for (const [pa, pb] of pairs) {
  const fa = `dist/client${pa === "/" ? "" : pa}.html`;
  const fb = `dist/client${pb === "/" ? "" : pb}.html`;
  const fa2 = pa === "/" ? "dist/client/index.html" : fa;
  const fb2 = pb === "/" ? "dist/client/index.html" : fb;
  if (!existsSync(fa2) || !existsSync(fb2)) {
    console.log(pa, "missing", !existsSync(fa2) ? fa2 : fb2);
    continue;
  }
  const a = strip(readFileSync(fa2, "utf8"));
  const b = strip(readFileSync(fb2, "utf8"));
  if (a === b) {
    console.log(pa, "IDENTICAL after strip");
    continue;
  }
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  console.log(pa, "DIFF @" + i);
  console.log("  A:", JSON.stringify(a.slice(i, i + 180)));
  console.log("  B:", JSON.stringify(b.slice(i, i + 180)));
}
