export * from "./types";
export { VTurbClient } from "./client";

import { VTurbClient } from "./client";

let instance: VTurbClient | null = null;

export function getVTurbClient(): VTurbClient | null {
  if (!instance) {
    const token = process.env.VTURB_API_TOKEN;
    if (!token) return null;
    instance = new VTurbClient(token);
  }
  return instance;
}
