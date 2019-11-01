const path = require("path");

const sinon = require("sinon");

const paths = require("../../src/utils/paths");

describe("paths", () => {
  let sandbox;
  let cwdStub;
  const fixturesPath = path.resolve(__dirname, "..", "fixtures");

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    cwdStub = sandbox.stub(process, "cwd").returns(fixturesPath);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("getWorkingPath method", () => {
    it("should return current path if it does not contains a package.json file", async () => {
      const workingPath = await paths.getWorkingPath();
      expect(workingPath).toEqual(fixturesPath);
    });

    it("should return parent path if it contains a package.json file", async () => {
      const fooPackagePath = path.resolve(fixturesPath, "foo-package-1");
      cwdStub.returns(fooPackagePath);
      const workingPath = await paths.getWorkingPath();
      expect(workingPath).toEqual(fixturesPath);
    });
  });
});
