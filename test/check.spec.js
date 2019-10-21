const path = require("path");

const sinon = require("sinon");

const check = require("../src/check");

describe("check", () => {
  let sandbox;
  let cwdStub;
  let exitStub;
  const fixturePath = path.resolve(__dirname, "fixtures", "foo-linked-package");

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    exitStub = sandbox.stub(process, "exit");
    cwdStub = sandbox.stub(process, "cwd").returns(fixturePath);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("avoidFileLinks method", () => {
    it("should exit process if find local links in a package", async () => {
      await check.avoidFileLinks();
      expect(exitStub.callCount).toEqual(1);
    });

    it("should not exit process if does not find local links in a package", async () => {
      cwdStub.returns(path.resolve(__dirname, "fixtures", "foo-package-1"));
      await check.avoidFileLinks();
      expect(exitStub.callCount).toEqual(0);
    });
  });
});
