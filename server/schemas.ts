import { z } from "zod";

const ISigmetPropertiesSchema = z.object({
  icaoId: z.string().nullish(),
  firId: z.string().nullish(),
  firName: z.string().nullish(),
  validTimeFrom: z.string().nullish(),
  validTimeTo: z.string().nullish(),
  seriesId: z.string().nullish(),
  hazard: z.string().nullish(),
  qualifier: z.string().nullish(),
  base: z.number().nullish(),
  top: z.number().nullish(),
  dir: z.string().nullish(),
  spd: z.string().nullish(),
  chng: z.string().nullish(),
  rawSigmet: z.string().nullish(),
});

const GeometrySchema = z
  .object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  })
  .or(
    z.object({
      type: z.literal("Point"),
      coordinates: z.tuple([z.number(), z.number()]),
    })
  )
  .or(
    z.object({
      type: z.literal("LineString"),
      coordinates: z.array(z.tuple([z.number(), z.number()])),
    })
  );

const ISigmetFeatureSchema = z.object({
  type: z.literal("Feature"),
  properties: ISigmetPropertiesSchema,
  geometry: GeometrySchema,
});

export const ISigmetGeoJSONSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(ISigmetFeatureSchema),
});

export type ISigmetGeoJSON = z.infer<typeof ISigmetGeoJSONSchema>;
export type ISigmetFeature = z.infer<typeof ISigmetFeatureSchema>;
export type ISigmetProperties = z.infer<typeof ISigmetPropertiesSchema>;

const AirSigmetPropertiesSchema = z.object({
  icaoId: z.string().nullish(),
  alphaChar: z.string().nullish(),
  seriesId: z.string().nullish(),
  validTimeFrom: z.string().nullish(),
  validTimeTo: z.string().nullish(),
  airSigmetType: z.string().nullish(),
  hazard: z.string().nullish(),
  altitudeHi1: z.number().nullish(),
  altitudeHi2: z.number().nullish(),
  altitudeLo1: z.number().nullish(),
  altitudeLo2: z.number().nullish(),
  movementDir: z.number().nullish(),
  movementSpd: z.number().nullish(),
  rawSigmet: z.string().nullish(),
});

const AirSigmetFeatureSchema = z.object({
  type: z.literal("Feature"),
  properties: AirSigmetPropertiesSchema,
  geometry: GeometrySchema,
});

export const AirSigmetGeoJSONSchema = z.object({
  features: z.array(AirSigmetFeatureSchema),
});

export type AirSigmetGeoJSON = z.infer<typeof AirSigmetGeoJSONSchema>;
export type AirSigmetFeature = z.infer<typeof AirSigmetFeatureSchema>;
export type AirSigmetProperties = z.infer<typeof AirSigmetPropertiesSchema>;

export const schemaByType = {
  isigmet: ISigmetGeoJSONSchema,
  airsigmet: AirSigmetGeoJSONSchema,
};
