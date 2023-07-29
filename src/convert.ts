import fs from "fs/promises";
import { DOMParser } from "xmldom";
import * as toGeojson from "@tmcw/togeojson";

const convertKML = async (path: string) => {
  const kml = await fs.readFile(path);
  const data = kml.toString("utf8");
  const doc = new DOMParser().parseFromString(data);
  return toGeojson.kml(doc) as GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon
  >;
};

const main = async () => {
  // const reg28 = await convertKML("data/rdf_pub.frt_reg28.kml");
  // await fs.writeFile("data/rdf_pub.frt_reg28.geojson", JSON.stringify(reg28));

  // const reg52 = await convertKML("data/rdf_pub.frt_reg52.kml");
  // await fs.writeFile("data/rdf_pub.frt_reg52.geojson", JSON.stringify(reg52));

  const reg24 = await convertKML("data/rdf_pub.frt_reg24.kml");
  await fs.writeFile("data/rdf_pub.frt_reg24.geojson", JSON.stringify(reg24));
};

main()
  .then(() => console.log("Ok"))
  .catch(console.error);
