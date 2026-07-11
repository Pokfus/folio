// Live preview server for viewing Folio on a phone (LAN). Dev-only, not part of the site.
// Serves the project over http on all network interfaces and injects a tiny auto-reload
// snippet into index.html so the phone refreshes whenever a project file changes.
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const root = path.resolve(__dirname, "..");
const PORT = process.env.PORT || 5599;
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
};

// bump a version token whenever a project file changes; the page polls it and reloads
let version = Date.now();
try {
  fs.watch(root, { recursive: true }, (_evt, file) => {
    if (!file) { version = Date.now(); return; }
    const f = String(file).replace(/\\/g, "/");
    if (f.startsWith(".claude/") || f.startsWith(".git/") || /~$|\.(tmp|swp)$/i.test(f)) return;
    version = Date.now();
  });
} catch (e) { /* recursive watch unsupported here — refresh manually */ }

const RELOAD = "\n<script>(function(){var v=null;setInterval(function(){" +
  "fetch('/__lr',{cache:'no-store'}).then(function(r){return r.text();})" +
  ".then(function(t){if(v!==null&&t!==v){location.reload();}v=t;}).catch(function(){});},1000);})();</script>\n";

http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || "/").split("?")[0]);
  if (p === "/__lr") { res.writeHead(200, { "Content-Type": "text/plain", "Cache-Control": "no-store" }); res.end(String(version)); return; }
  if (p === "/") p = "/index.html";
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    const ext = path.extname(file).toLowerCase();
    const headers = { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": "no-store" };
    if (ext === ".html") {
      let html = data.toString("utf8");
      html = html.includes("</body>") ? html.replace("</body>", RELOAD + "</body>") : html + RELOAD;
      res.writeHead(200, headers); res.end(html);
    } else {
      res.writeHead(200, headers); res.end(data);
    }
  });
}).listen(PORT, "0.0.0.0", () => {
  const ips = [];
  const ifaces = os.networkInterfaces();
  for (const name in ifaces) for (const i of ifaces[name]) if (i.family === "IPv4" && !i.internal) ips.push(i.address);
  console.log("Folio phone preview is running.");
  console.log("  on this PC:   http://localhost:" + PORT);
  ips.forEach((ip) => console.log("  on your phone: http://" + ip + ":" + PORT));
});
