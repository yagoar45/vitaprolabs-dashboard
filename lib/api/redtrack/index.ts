export * from "./types";
export { RedTrackClient } from "./client";

import { RedTrackClient } from "./client";

let instance: RedTrackClient | null = null;

export function getRedTrackClient(): RedTrackClient {
  if (!instance) {
    const apiKey = process.env.REDTRACK_API_KEY;
    if (!apiKey) {
      throw new Error("REDTRACK_API_KEY not set");
    }
    instance = new RedTrackClient(apiKey);
  }
  return instance;
}
