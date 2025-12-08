import express from "express";
import fs from "node:fs/promises";
import routes from "./routes/routes";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";

const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

const app = express();

let vite: import("vite").ViteDevServer | undefined;
if (!isProduction) {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import("compression")).default;
  const sirv = (await import("sirv")).default;
  app.use(compression());
  app.use(base, sirv("./dist/client", { extensions: [] }));
}

app.use("/api", routes);

app.use("*all", async (req, res, next) => {
  if (!req.headers.accept?.includes("text/html")) {
    return next();
  }

  if (res.headersSent) {
    return next();
  }

  const path = req.path;
  if (path.includes(".") && !path.endsWith("/") && path !== "/") {
    return next();
  }

  try {
    const url = req.originalUrl.replace(base, "");

    let template: string;
    let render: (url: string) => { head: string; html: string };

    if (!isProduction) {
      template = await fs.readFile("./index.html", "utf-8");
      template = (await vite?.transformIndexHtml(url, template)) ?? "";
      render =
        (await vite?.ssrLoadModule("/src/entry-server.tsx"))?.render ??
        (() => ({ head: "", html: "" }));
    } else {
      template = templateHtml;
      // @ts-expect-error Expected error
      render = (await import("../entry-server/entry-server.js")).render;
    }

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? "")
      .replace(`<!--app-html-->`, rendered.html ?? "");

    res.status(200).set({ "Content-Type": "text/html" }).send(html);
  } catch (e) {
    vite?.ssrFixStacktrace(e as Error);
    console.log((e as Error).stack);
    res.status(500).end((e as Error).stack);
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
