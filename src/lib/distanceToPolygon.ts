import {
  booleanPointInPolygon,
  Point,
  pointToLineDistance,
  polygon as makePolygon,
  FeatureCollection,
  Feature,
  lineString,
} from "@turf/turf";

export interface DistanceResult {
  distance: number;
  label: string;
}

export const distanceToPolygon = (
  featureCollection: FeatureCollection,
  point: Feature<Point>
): DistanceResult => {
  let bestDistanceKm = Number.MAX_VALUE;
  let bestLabel = "";

  // Convert single polygon or multi-polygon into consistent array
  for (const f of featureCollection.features) {
    let polygons: any[] = [];
    switch (f.geometry.type) {
      case "MultiPolygon":
        polygons = f.geometry.coordinates;
        break;
      case "Polygon":
        polygons = [f.geometry.coordinates];
        break;
    }

    for (const polygon of polygons) {
      // First item is the outer perimeter
      const outer = polygon[0];
      const outerLine = lineString(outer);

      // Inside outer and not in a hole
      const isInsidePolygon = booleanPointInPolygon(
        point,
        makePolygon(polygon)
      );
      let distanceKm = pointToLineDistance(point, outerLine);
      if (isInsidePolygon) {
        distanceKm *= -1;
      }

      // Not in the outer, but could be in one of the holes
      if (!isInsidePolygon) {
        for (const hole of polygon.slice(1)) {
          const holePoly = makePolygon([hole]);
          const isInHole = booleanPointInPolygon(point, holePoly);
          if (isInHole) {
            const distanceInsideHoleM = pointToLineDistance(
              point,
              lineString(hole)
            );
            distanceKm = distanceInsideHoleM;
          }
        }
      }

      if (distanceKm < bestDistanceKm) {
        bestDistanceKm = distanceKm;
        bestLabel = f.properties?.llib_frt ?? "";
      }
    }
  }

  return {
    distance: Math.max(0, bestDistanceKm),
    label: bestLabel,
  };
};
