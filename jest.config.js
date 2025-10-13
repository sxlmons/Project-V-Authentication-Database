// jest.config.js
export default {
  testEnvironment: "node",
  transform: {},
  moduleFileExtensions: ["js", "json"],
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/jest.setup.js"]
};