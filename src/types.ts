import type { Point } from "maplibre-gl";

type Geometry = Array<Array<Point>>;

export interface ISigmetFeature {
  properties: ISigmetGeoProperties;
  geometry: Geometry;
}

export interface ISigmetGeoProperties {
  icaoId: string;
  firId: string;
  firName: string;
  validTimeFrom: number;
  validTimeTo: number;
  seriesId: string;
  hazard: string;
  qualifier: string;
  base: number;
  top: number;
  dir: string;
  spd: string;
  chng: string;
  rawSigmet: string;
}

export interface AirSigmetFeature {
  properties: AirSigmetGeoProperties;
  geometry: Geometry;
}

export interface AirSigmetGeoProperties {
  icaoId: string;
  alphaChar: string;
  seriesId: string;
  validTimeFrom: number;
  validTimeTo: number;
  airSigmetType: string;
  hazard: string;
  altitudeHi1: number;
  altitudeHi2: number;
  altitudeLo1: number;
  altitudeLo2: number;
  movementDir: string;
  movementSpd: string;
}
