import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { audiHints, getGuess, getHint, getMysteryWords } from "./chatgpt";

const app = new Hono();
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", serveStatic({ root: "./build/" }));

// Server UI
app.get("/", serveStatic({ path: "./index.html" }));

// API endpoints
app.get("/api/mystery-words", async (c) => {
  const words = await getMysteryWords();

  return c.json(
    {
      status: "success",
      data: words,
      code: 200,
    },
    200
  );
});

app.get("/api/hint", async (c) => {
  const q = await c.req.queries();
  const word = q["word"][0];
  const person = q["person"][0];

  const hint = await getHint(word, person);
  //const hint = "trunk";

  return c.json(
    {
      status: "success",
      data: hint,
      code: 200,
    },
    200
  );
});

app.get("/api/audit", async (c) => {
  const q = await c.req.queries();
  const hints = q["hints"][0];

  const result = await audiHints(hints);

  return c.json(
    {
      status: "success",
      data: result,
      code: 200,
    },
    200
  );
});

app.get("/api/guess", async (c) => {
  const q = await c.req.queries();
  const hints = q["hints"][0];
  const person = q["person"][0];

  const guess = await getGuess(hints, person);
  //const guess = "Elephant";

  return c.json(
    {
      status: "success",
      data: guess,
      code: 200,
    },
    200
  );
});

app.onError((err, c) => {
  console.error(`${err} on line ${err.stack}`);
  return c.json(
    {
      status: "error",
      data: null,
      message: `${err} on line ${err.stack}`,
      code: 500,
    },
    500
  );
});

app.notFound((c) =>
  c.json(
    {
      status: "error",
      data: null,
      message: `Not Found`,
      code: 404,
    },
    404
  )
);

serve(app);
