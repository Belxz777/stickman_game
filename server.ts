import { serve } from "bun";
import { join } from "node:path";

const port = Number(process.env.PORT ?? 3000);
const root = join(import.meta.dir, "dist");

serve({
  port,

  async fetch(req) {
    const url = new URL(req.url);

    let path = decodeURIComponent(url.pathname);

    if (path === "/") {
      path = "/index.html";
    }

    const file = Bun.file(join(root, path));

    if (await file.exists()) {
      return new Response(file);
    }

    // React SPA fallback
    return new Response(Bun.file(join(root, "index.html")), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
});

console.log(`Stickman Game: http://0.0.0.0:${port}`);