import { distanceToPolygon } from "./lib/distanceToPolygon";
import { readGeoJSON } from "./lib/geojson";
import { Command } from "commander";
import { geocoding } from "./lib/geocoding";

// Usage : yarn ts-node src/index.ts -q 61360

const program = new Command();
program.version("0.0.1");
program.option("-q --query <string>");
program.parse(process.argv);

const main = async () => {
  const { query } = program.opts();
  const point = await geocoding(query);

  if (!point) {
    throw new Error("Not found");
  }

  const data = await readGeoJSON("data/public_forest_simplified.geojson");
  console.log(distanceToPolygon(data, point));
};

main()
  .then(() => console.log("Ok"))
  .catch(console.error);
