const helpers = require("../../src/utils/helpers");

describe("helpers", () => {
  describe("isFileDependency method", () => {
    it('should return false when dependency does not include "file:.."', () => {
      expect(helpers.isFileDependency("foo")).toEqual(false);
    });

    it('should return true when dependency includes "file:.."', () => {
      expect(helpers.isFileDependency("file:../foo")).toEqual(true);
    });
  });
});
