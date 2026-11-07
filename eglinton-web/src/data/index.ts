import "server-only";
import type { CasinoDataProvider } from "./provider";
import { MockCasinoDataProvider } from "./mock/mock-provider";
import { ApiCasinoDataProvider } from "./api/api-provider";

export type DataMode = "mock" | "api";

export function getDataMode(): DataMode {
  return process.env.NEXT_PUBLIC_DATA_MODE === "api" ? "api" : "mock";
}

let instance: CasinoDataProvider | null = null;

/** The single switch between demo data and the real backend. */
export function getDataProvider(): CasinoDataProvider {
  if (!instance) {
    instance = getDataMode() === "api" ? new ApiCasinoDataProvider() : new MockCasinoDataProvider();
  }
  return instance;
}
