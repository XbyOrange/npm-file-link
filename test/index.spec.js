const index = require("../index");

describe("index", () => {
  it("should export the linkAll method", () => {
    expect(index.linkAll).toBeDefined();
  });

  it("should export the unlinkAll method", () => {
    expect(index.unlinkAll).toBeDefined();
  });

  it("should export the avoidFileLinks method", () => {
    expect(index.avoidFileLinks).toBeDefined();
  });
});
