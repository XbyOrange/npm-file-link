const index = require("../index");

describe("index", () => {
  it("should export the linkAll method", () => {
    expect(index.linkAll).toBeDefined();
  });

  it("should export the linkLocal method", () => {
    expect(index.linkLocal).toBeDefined();
  });

  it("should export the unlinkAll method", () => {
    expect(index.unlinkAll).toBeDefined();
  });

  it("should export the unlinkLocal method", () => {
    expect(index.unlinkLocal).toBeDefined();
  });

  it("should export the avoidFileLinks method", () => {
    expect(index.avoidFileLinks).toBeDefined();
  });
});
