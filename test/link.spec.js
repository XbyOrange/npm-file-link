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
    chooseStub = sandbox.stub(inquire, "choose").callsFake(allPackages => {
      return Promise.resolve({
        toLink: allPackages,
        toUnlink: {}
      });
    });

    sandbox.stub(npm, "checkChangesAndInstall").resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("all method", () => {
    it("should link all locally found dependencies in current package", async () => {
      workingPathStub.restore();
      sandbox.stub(process, "cwd").returns(path.resolve(__dirname, "fixtures", "foo-package-1"));
      expect.assertions(2);
      await link.all();

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

    it("should link all locally found dependencies in current package", async () => {
      workingPathStub.restore();
      sandbox.stub(process, "cwd").returns(path.resolve(__dirname, "fixtures", "foo-only-dev"));
      expect.assertions(2);
      await link.all();

      expect(writeStub.getCall(0).args[0]).toEqual("foo-only-dev");
      expect(writeStub.getCall(0).args[1]).toEqual({
        name: "foo-only-deps",
        version: "1.0.0",
        dependencies: { "foo-package-1-name": "file:../foo-package-1" },
        "npm-file-link": {
          original_versions: {
            "foo-package-1-name": "1.1.1"
          }
        }
      });
    });

    it("should link all locally found devDependencies in current package", async () => {
      workingPathStub.restore();
      sandbox.stub(process, "cwd").returns(path.resolve(__dirname, "fixtures", "foo-only-deps"));
      expect.assertions(2);
      await link.all();

      expect(writeStub.getCall(0).args[0]).toEqual("foo-only-deps");
      expect(writeStub.getCall(0).args[1]).toEqual({
        name: "foo-only-dev",
        version: "1.0.0",
        devDependencies: { "foo-package-1-name": "file:../foo-package-1" },
        "npm-file-link": {
          original_versions: {
            "foo-package-1-name": "1.1.1"
          }
        }
      });
    });
  });

  describe("select method", () => {
    it("should modify selected dependencies in current package", async () => {
      workingPathStub.restore();
      sandbox.stub(process, "cwd").returns(path.resolve(__dirname, "fixtures", "foo-package-1"));
      expect.assertions(2);
      chooseStub.callsFake(() => {
        return Promise.resolve({
          toLink: {
            "foo-package-2-name": {
              folder: "foo-package-2",
              dependencies: {
                "foo-1": "1.0.0",
                "foo-package-3-name": "3.0.0"
              },
              devDependencies: {
                "foo-3": "3.0.0",
                "foo-4": "4.0.0"
              },
              packageJson: {
                name: "foo-package-2-name",
                version: "2.0.0",
                dependencies: {
                  "foo-1": "1.0.0",
                  "foo-package-3-name": "3.0.0"
                },
                devDependencies: {
                  "foo-3": "3.0.0",
                  "foo-4": "4.0.0"
                }
              }
            }
          },
          toUnlink: {}
        });
      });
      await link.select();

      expect(writeStub.getCall(0).args[0]).toEqual("foo-package-1");
      expect(writeStub.getCall(0).args[1]).toEqual({
        name: "foo-package-1-name",
        version: "1.0.0",
        dependencies: { "foo-1": "1.0.0", "foo-package-2-name": "file:../foo-package-2" },
        devDependencies: { "foo-package-3-name": "2.0.0", "foo-4": "4.0.0" },
        "npm-file-link": {
          original_versions: {
            "foo-package-2-name": "2.0.0"
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
      await link.select();

      expect(chooseStub.getCall(0).args[0]["foo-package-1-name-2"].isLinked).toEqual(true);
    });
  });
});
