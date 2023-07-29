import { FeatureCollection, Point } from "@turf/helpers";

const regexp = /^(?:.*\b)?((?:28|61|72|53)\d{3})(?:\b.*)?$/;

export const geocoding = async (query: string, limit = 1) => {
  const matches = query.match(regexp);
  const postcode = matches ? `&postcode=${matches[1]}` : "";

  const geocode: FeatureCollection<Point> = await fetch(
    `https://api-adresse.data.gouv.fr/search/?q=${encodeURI(
      query
    )}${postcode}&limit=${limit}`
  ).then((res) => res.json());
  const point = geocode.features?.[0];

  console.log(JSON.stringify(geocode.features?.[0], null, 4));

  return point;
};
