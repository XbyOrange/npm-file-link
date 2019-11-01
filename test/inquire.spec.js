const sinon = require("sinon");
const inquirer = require("inquirer");

const inquire = require("../src/inquire");

describe("inquire", () => {
  const linkablePackages = {
    "foo-package-1-name-2": {
      folder: "foo-package-1",
      dependencies: {
        "foo-1": "1.0.0",
        "foo-package-2-name": "2.0.0"
      },
      devDependencies: {
        "foo-package-3-name": "2.0.0",
        "foo-4": "4.0.0"
      },
      packageJson: {
        name: "foo-package-1-name-2",
        version: "1.0.0",
        dependencies: {
          "foo-1": "1.0.0",
          "foo-package-2-name": "2.0.0"
        },
        devDependencies: {
          "foo-package-3-name": "2.0.0",
          "foo-4": "4.0.0"
        }
      },
      isLinked: true
    }
  };
  let sandbox;
  let inquirerStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    inquirerStub = sandbox.stub(inquirer, "prompt").resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("choose method", () => {
    it("should return packages selected by user in toLink property", async () => {
      expect.assertions(1);
      inquirerStub.resolves({
        packages: ["foo-package-1-name-2"]
      });

      const result = await inquire.choose(linkablePackages);
      expect(result).toEqual({
        toLink: linkablePackages,
        toUnlink: {}
      });
    });

    it("should return packages not selected by user in toUnlink property", async () => {
      expect.assertions(1);
      inquirerStub.resolves({
        packages: []
      });

      const result = await inquire.choose(linkablePackages);
      expect(result).toEqual({
        toLink: {},
        toUnlink: linkablePackages
      });
    });
  });
});
