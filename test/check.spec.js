const path = require("path");

const sinon = require("sinon");

const check = require("../src/check");

describe("check", () => {
  let sandbox;
  let cwdStub;
  const fixturePath = path.resolve(__dirname, "fixtures", "foo-linked-package");

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    cwdStub = sandbox.stub(process, "cwd").returns(fixturePath);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("avoidFileLinks method", () => {
    it("should reject if find local links in a package", async () => {
      expect.assertions(1);
      await check.avoidFileLinks().catch(err => {
        expect(err.message).toEqual(expect.stringContaining("File links found"));
      });
    });

    it("should resolve if does not find local links in a package", async () => {
      cwdStub.returns(path.resolve(__dirname, "fixtures", "foo-package-1"));
      await expect(check.avoidFileLinks()).resolves.toEqual(undefined);
    });
  });
});
