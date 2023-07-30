import express from "express";
import morgan from "morgan";
import { readGeoJSON } from "./lib/geojson";
import { geocoding } from "./lib/geocoding";
import { distanceToPolygon } from "./lib/distanceToPolygon";
import NodeCache from "node-cache";

const cache = new NodeCache({
  stdTTL: 24 * 60 * 60, // 24h
});

const data = readGeoJSON("data/public_forest_simplified.geojson");

const app = express();
const port = 3000;

app.use(morgan("tiny"));

app.get("/", async (req, res) => {
  if (req.query.q) {
    const cached = cache.get(req.query.q.toString());

    if (cached) {
      if (typeof cached === "number") {
        res.sendStatus(cached);
      } else {
        res.send(cached);
      }
    } else {
      const point = await geocoding(req.query.q as string);

      if (!point) {
        res.sendStatus(404);
        cache.set(req.query.q.toString(), 404);
      } else {
        const distance = distanceToPolygon(await data, point);
        cache.set(req.query.q.toString(), distance);
        res.send(distance);
      }
    }
  } else {
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
