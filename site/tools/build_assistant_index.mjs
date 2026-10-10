import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const project = path.resolve(root, "..");

const files = [
  ...fs.readdirSync(root).filter((name) => name.endsWith(".html")).map((name) => path.join(root, name)),
  ...fs.readdirSync(path.join(root, "c")).filter((name) => name.endsWith(".html")).map((name) => path.join(root, "c", name)),
  ...fs.readdirSync(path.join(root, "week")).filter((name) => name.endsWith(".html")).map((name) => path.join(root, "week", name)),
  path.join(root, "README.md"),
  path.join(root, "data", "seed.json"),
  path.join(root, "data", "stats.json"),
  path.join(root, "data", "ignition.js"),
  path.join(project, "README.md"),
  path.join(project, "CHECKLIST.md"),
  path.join(project, "BIO.txt"),
  path.join(project, "promo", "README.md"),
  path.join(project, "reel", "README.md"),
  path.join(project, "tools", "resolve.csv"),
].filter((file) => fs.existsSync(file));

const entities = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
};

function decode(value) {
  return value.replace(/&(?:amp|quot|#39|lt|gt|nbsp);/g, (entity) => entities[entity] || entity);
}

function htmlText(source) {
  const title = decode((source.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || ["", ""])[1]);
  const description = decode((source.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) || ["", ""])[1]);
  const body = source
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<(script|style|svg|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(br|\/p|\/div|\/section|\/article|\/li|\/tr|\/h[1-6]|\/td|\/th)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return [title, description, decode(body)]
    .join("\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function markdownText(source) {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function sourceUrl(file) {
  const relative = path.relative(root, file).replaceAll(path.sep, "/");
  if (relative === "index.html") return "https://fermahatlas.xyz/";
  if (relative.endsWith(".html")) return `https://fermahatlas.xyz/${relative.replace(/\.html$/, "")}`;
  if (relative === "data/ignition.js") return "https://fermahatlas.xyz/flashcast-season-01";
  if (relative === "data/stats.json") return "https://fermahatlas.xyz/stats";
  if (relative.startsWith("data/")) return "https://fermahatlas.xyz/fermafia";
  if (relative.startsWith("assets/")) return "https://fermahatlas.xyz/play";
  if (file.startsWith(project)) return `https://github.com/Zhekinmaksim/fermah-atlas/blob/main/${path.relative(project, file).replaceAll(path.sep, "/")}`;
  return "https://fermahatlas.xyz/";
}

function label(file) {
  const relative = path.relative(project, file).replaceAll(path.sep, "/");
  return relative === "site/index.html" ? "Fermah Atlas home" : relative;
}

function chunks(text) {
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const result = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 1 > 900) {
      result.push(current);
      current = "";
    }
    current += (current ? "\n" : "") + paragraph;
  }
  if (current) result.push(current);
  return result;
}

const documents = [];
for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  let text;
  if (file.endsWith(".json")) {
    const data = JSON.parse(raw);
    if (Array.isArray(data.creators)) {
      text = [JSON.stringify(data.source_summary), data.collaboration_policy || "",
        ...data.creators.flatMap(c => [
          `@${c.display_handle}${c.previous_handles?.length ? ` (previously ${c.previous_handles.map(h => `@${h}`).join(", ")})` : ""}: ${c.spotlight_count} selected, ${c.honourable_mention_count} mentioned, ${c.collab_count || 0} collab credits. Suspended: ${Boolean(c.suspended)}.`,
          ...c.contributions.map(event => `@${c.display_handle}: ${JSON.stringify(event)}`),
        ])].join("\n");
    } else {
      text = Object.entries(data).flatMap(([key, value]) =>
        Array.isArray(value) ? value.map(row => `${key}: ${JSON.stringify(row)}`)
          : [`${key}: ${JSON.stringify(value)}`]).join("\n");
    }
  } else {
    text = file.endsWith(".html") ? htmlText(raw) : markdownText(raw);
  }
  for (const chunk of chunks(text)) {
    documents.push({path: label(file), source: sourceUrl(file), text: chunk});
  }
}

const summary = JSON.parse(fs.readFileSync(path.join(root, "data", "seed.json"), "utf8")).source_summary;
const stats = JSON.parse(fs.readFileSync(path.join(root, "data", "stats.json"), "utf8"));
const output = `// Generated by site/tools/build_assistant_index.mjs.\nexport const ARCHIVE_SUMMARY = ${JSON.stringify(summary)};\nexport const ARCHIVE_STATS = ${JSON.stringify(stats)};\nexport const DOCUMENTS = ${JSON.stringify(documents)};\n`;
fs.writeFileSync(path.join(root, "api", "knowledge.js"), output);
console.log(`Indexed ${files.length} files into ${documents.length} chunks (${Buffer.byteLength(output)} bytes).`);
