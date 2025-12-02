import sha1 from "sha1";
import { AirSigmetProperties, ISigmetProperties } from "../schemas.js";

export const generateHashId = ({
  icaoId,
  seriesId,
  validTimeFrom,
  hazard,
  rawSigmet,
}: ISigmetProperties | AirSigmetProperties) => {
  const str = "" + icaoId + seriesId + validTimeFrom + hazard + rawSigmet;

  return sha1(str);
};
