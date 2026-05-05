import { randomBytes } from "crypto";

export const generateOpaqueToken = () => {
  return randomBytes(64).toString("hex");
};
