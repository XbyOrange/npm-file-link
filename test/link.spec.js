const path = require("path");

const sinon = require("sinon");

const paths = require("../src/utils/paths");
const packages = require("../src/utils/packages");
const link = require("../src/link");
const inquire = require("../src/inquire");
const npm = require("../src/npm");

describe("link", () => {
  let sandbox;
  let writeStub;
  let workingPathStub;
  let chooseStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    writeStub = sandbox.stub(packages, "writePackageJson").resolves();
    workingPathStub = sandbox
      .stub(paths, "getWorkingPath")
      .resolves(path.resolve(__dirname, "fixtures"));
    chooseStub = sandbox.stub(inquire, "choose").callsFake(allPackages =>
      Promise.resolve({
        toLink: allPackages,
        toUnlink: {}
      })
    );

    sandbox.stub(npm, "install").resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("all method", () => {
    it("should modify all inter dependencies of found packages", async () => {
      expect.assertions(4);
      await link.all();

      expect(writeStub.getCall(2).args[0]).toEqual("foo-package-1");
      expect(writeStub.getCall(2).args[1]).toEqual({
        name: "foo-package-1-name",
        version: "1.0.0",
        dependencies: { "foo-1": "1.0.0", "foo-package-2-name": "file:../foo-package-2" },
        devDependencies: { "foo-package-3-name": "file:../foo-package-3", "foo-4": "4.0.0" },
        "npm-file-link": {
          original_versions: {
            "foo-package-2-name": "2.0.0",
            "foo-package-3-name": "2.0.0"
          }
        }
      });

      expect(writeStub.getCall(3).args[0]).toEqual("foo-package-2");
      expect(writeStub.getCall(3).args[1]).toEqual({
        name: "foo-package-2-name",
        version: "2.0.0",
        dependencies: { "foo-1": "1.0.0", "foo-package-3-name": "file:../foo-package-3" },
        devDependencies: { "foo-3": "3.0.0", "foo-4": "4.0.0" },
        "npm-file-link": {
          original_versions: {
            "foo-package-3-name": "3.0.0"
          }
        }
      });
    });
  });

  describe("local method", () => {
    it("should modify all inter dependencies of found packages in current package", async () => {
      workingPathStub.restore();
      sandbox.stub(process, "cwd").returns(path.resolve(__dirname, "fixtures", "foo-package-1"));
      expect.assertions(2);
      await link.local();

      expect(writeStub.getCall(0).args[0]).toEqual("foo-package-1");
      expect(writeStub.getCall(0).args[1]).toEqual({
        name: "foo-package-1-name",
        version: "1.0.0",
        dependencies: { "foo-1": "1.0.0", "foo-package-2-name": "file:../foo-package-2" },
        devDependencies: { "foo-package-3-name": "file:../foo-package-3", "foo-4": "4.0.0" },
        "npm-file-link": {
          original_versions: {
            "foo-package-2-name": "2.0.0",
            "foo-package-3-name": "2.0.0"
          }
        }
      });
    });

    it("should show checked currently linked packages", async () => {
      workingPathStub.restore();
      sandbox
        .stub(process, "cwd")
        .returns(path.resolve(__dirname, "linked-fixtures", "foo-linked-package"));
      expect.assertions(1);
      await link.local();

      expect(chooseStub.getCall(0).args[0]["foo-package-1-name-2"].isLinked).toEqual(true);
    });
  });
});
