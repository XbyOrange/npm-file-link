const path = require("path");

const sinon = require("sinon");

const paths = require("../src/utils/paths");
const packages = require("../src/utils/packages");
const npm = require("../src/npm");
const unlink = require("../src/unlink");

describe.skip("unlink", () => {
  let sandbox;
  let writeStub;
  let workingPathStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    writeStub = sandbox.stub(packages, "writePackageJson").resolves();
    workingPathStub = sandbox
      .stub(paths, "getWorkingPath")
      .resolves(path.resolve(__dirname, "linked-fixtures"));
    sandbox.stub(npm, "checkPackagesAndInstall").resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("local method", () => {
    it("should modify all inter dependencies of found packages in current package", async () => {
      workingPathStub.restore();
      sandbox
        .stub(process, "cwd")
        .returns(path.resolve(__dirname, "linked-fixtures", "foo-linked-package"));
      expect.assertions(2);
      await unlink.local();

      expect(writeStub.getCall(0).args[0]).toEqual("foo-linked-package");
      expect(writeStub.getCall(0).args[1]).toEqual({
        name: "foo-linked-package-name-2",
        version: "1.0.0",
        dependencies: {
          "foo-package-1-name-2": "1.0.0"
        }
      });
    });

    it("should restore dependencies to local versions if no original versions are found", async () => {
      workingPathStub.restore();
      sandbox
        .stub(process, "cwd")
        .returns(path.resolve(__dirname, "linked-fixtures", "foo-linked-package-no-originals"));
      expect.assertions(2);
      await unlink.local();

      expect(writeStub.getCall(0).args[0]).toEqual("foo-linked-package-no-originals");
      expect(writeStub.getCall(0).args[1]).toEqual({
        name: "foo-linked-package-no-originals",
        version: "1.0.0",
        dependencies: {
          "foo-only-deps-2": "1.0.0"
        },
        devDependencies: {
          "foo-package-1-name-2": "1.0.0"
        }
      });
    });

    it("should call to npm i when changes are detected", async () => {
      workingPathStub.restore();
      sandbox
        .stub(process, "cwd")
        .returns(path.resolve(__dirname, "linked-fixtures", "foo-linked-package"));
      expect.assertions(1);
      await unlink.local();

      expect(npm.install.callCount).toEqual(1);
    });

    it("should not call to npm i when no changes are detected", async () => {
      workingPathStub.restore();
      sandbox
        .stub(process, "cwd")
        .returns(path.resolve(__dirname, "linked-fixtures", "foo-package-1"));
      expect.assertions(1);
      await unlink.local();

      expect(npm.install.callCount).toEqual(0);
    });
  });
});
