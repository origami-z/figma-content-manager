/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    // Below matches default jest transform (from --debug)
    // or a second transform would be applied and tsconfig would be overridden
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "ui-src/__tests__/tsconfig.json",
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleNameMapper: {
    ".+\\.(css|ttf|woff|woff2)$": "identity-obj-proxy",
    ".+\\.(svg|png|jpg)(\\?raw)?$": "<rootDir>/../jest/imageMock.js",
  },
};
