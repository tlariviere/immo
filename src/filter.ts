import fs from "fs/promises";
import "geojson";
import { featureCollection } from "@turf/helpers";
import { readGeoJSON } from "./lib/geojson";

const selection = [
  "Perseigne",
  "Bellême",
  "Bourse",
  "Réno-Valdieu",
  "Perche Et De La Trappe",
  "Moulins-Bonsmoulins",
  "Gouffern",
  "Andaines",
  "Senonches",
  "Ecouves",
  "Châteauneuf-En-Thymerais",
  "Montécôt",
  "Sillé",
  "Petite Charnie",
];

const sanityzeFeatures = (
  data: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon>
) => {
  return data.features
    .filter((f) =>
      selection.some((name) => f.properties?.llib_frt.includes(name))
    )
    .map((f) => ({
      ...f,
      properties: f.properties
        ? {
            ...f.properties,
            llib_frt: f.properties.llib_frt.trim(),
          }
        : undefined,
    }));
};

const main = async () => {
  const reg24 = await readGeoJSON("data/rdf_pub.frt_reg24.geojson");
  const reg28 = await readGeoJSON("data/rdf_pub.frt_reg28.geojson");
  const reg52 = await readGeoJSON("data/rdf_pub.frt_reg52.geojson");

  const merged = featureCollection([
    ...sanityzeFeatures(reg24),
    ...sanityzeFeatures(reg28),
    ...sanityzeFeatures(reg52),
  ]);

  await fs.writeFile("data/public_forest.geojson", JSON.stringify(merged));
};

main()
  .then(() => console.log("Ok"))
  .catch(console.error);
