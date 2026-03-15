export * from "./types";
export { MetaAdsClient } from "./client";

import { MetaAdsClient } from "./client";

let instance: MetaAdsClient | null = null;

export function getMetaAdsClient(): MetaAdsClient | null {
  if (!instance) {
    const token = process.env.META_ADS_TOKEN;
    if (!token) return null;
    instance = new MetaAdsClient(token);
  }
  return instance;
}
