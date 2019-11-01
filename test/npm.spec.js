const path = require("path");

const sinon = require("sinon");

const fsExtra = require("fs-extra");
const childProcess = require("child_process");

const paths = require("../src/utils/paths");
const npm = require("../src/npm");

describe("npm", () => {
  const workingPath = path.resolve(__dirname, "fixtures", "foo-linked-package");
  let spawnStub;
  let closeCallback;
  let dataCallback;
  let errorCallback;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    spawnStub = {
      stdout: {
        setEncoding: sandbox.stub(),
        on: sandbox.stub().callsFake((event, cb) => {
          dataCallback = cb;
        })
      },
      stderr: {
        setEncoding: sandbox.stub(),
        on: sandbox.stub().callsFake((event, cb) => {
          errorCallback = cb;
        })
      },
      on: sandbox.stub().callsFake((event, cb) => {
        closeCallback = cb;
      })
    };
    sandbox.stub(fsExtra, "writeFile").resolves();
    sandbox.stub(fsExtra, "readFile").resolves("");
    sandbox.stub(fsExtra, "remove").resolves();
    sandbox.stub(fsExtra, "ensureFile").resolves();
    sandbox.stub(childProcess, "spawn").returns(spawnStub);
    sandbox.spy(console, "log");
    sandbox.stub(process, "exit");

    sandbox.stub(paths, "getWorkingPath").resolves(workingPath);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("checkChangesAndInstall method", () => {
    it("should not call to npm install if there are no modifications", async () => {
      expect.assertions(1);
      const install = npm.checkChangesAndInstall(0);

      await install;
      expect(childProcess.spawn.callCount).toEqual(0);
    });

    it("should call to npm install if there are modifications", async () => {
      expect.assertions(2);
      const install = npm.checkChangesAndInstall(1);
      closeCallback(0);

      await install;
      expect(childProcess.spawn.getCall(0).args[0]).toEqual("npm");
      expect(childProcess.spawn.getCall(0).args[1][0]).toEqual("i");
    });

    it("should log npm install logs", async () => {
      expect.assertions(2);
      const install = npm.checkChangesAndInstall(1);
      dataCallback("foo");
      errorCallback("foo-error");
      closeCallback(0);

      await install;
      expect(console.log.getCall(1).args[0]).toEqual("foo");
      expect(console.log.getCall(2).args[0]).toEqual("foo-error");
    });

    it("should remove node_modules and retry npm install when returns an error", async () => {
      expect.assertions(1);
      npm.checkChangesAndInstall(1);
      closeCallback(1);

      await new Promise(resolve => {
        setTimeout(() => {
          closeCallback(0);
          expect(fsExtra.remove.getCall(0).args[0]).toEqual(
            path.resolve(process.cwd(), "node_modules")
          );
          resolve();
        }, 200);
      });
    });

    it("should reject when retry fails", async () => {
      expect.assertions(1);

      setTimeout(() => {
        closeCallback(1);
      }, 200);

      await new Promise(resolve => {
        npm.checkChangesAndInstall(1).catch(err => {
          expect(err.message).toEqual("Error installing dependencies");
          resolve();
        });
        closeCallback(1);
      });
    });
  });
});
