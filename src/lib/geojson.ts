import "geojson";
import fs from "fs/promises";

export const readGeoJSON = async (path: string) => {
  const geojson = await fs.readFile(path);
  return JSON.parse(geojson.toString("utf8")) as GeoJSON.FeatureCollection<
    GeoJSON.Polygon | GeoJSON.MultiPolygon
  >;
};
