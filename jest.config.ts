import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./setup-test.ts"],
};

export default config;
