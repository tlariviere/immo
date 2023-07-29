import { distanceToPolygon } from "./lib/distanceToPolygon";
import { readGeoJSON } from "./lib/geojson";
import { Command } from "commander";
import { point } from "@turf/helpers";

// Usage : yarn ts-node src/index.ts -c "48.437144, 0.423824"

const program = new Command();
program.version("0.0.1");
program.option("-c --coords <string>");
program.parse(process.argv);

const main = async () => {
  const { coords } = program.opts();
  const [lat, lon] = coords.split(", ");
  const data = await readGeoJSON("data/public_forest.geojson");

  console.log(distanceToPolygon(data, point([+lon, +lat])));
};

main()
  .then(() => console.log("Ok"))
  .catch(console.error);
