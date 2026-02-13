/**
 * Simple dev server for the tag browser.
 * Serves web/ as root, with data/ and tags-index.json accessible.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const ROOT = path.resolve(__dirname, "..");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);

  let filePath;
  if (url === "/" || url === "/index.html") {
    filePath = path.join(ROOT, "web", "index.html");
  } else if (url.startsWith("/data/") || url === "/tags-index.json") {
    filePath = path.join(ROOT, url);
  } else {
    // Try web/ directory first
    filePath = path.join(ROOT, "web", url);
  }

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found: " + url);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  🎶 Barbershop Tag Browser`);
  console.log(`  → http://localhost:${PORT}\n`);
});
