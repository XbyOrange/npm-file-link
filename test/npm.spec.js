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

  describe("install method", () => {
    it("should call to npm install", async () => {
      expect.assertions(2);
      const install = npm.install();
      closeCallback(0);

      await install;
      expect(childProcess.spawn.getCall(0).args[0]).toEqual("npm");
      expect(childProcess.spawn.getCall(0).args[1][0]).toEqual("i");
    });

    it("should log npm install logs", async () => {
      expect.assertions(2);
      const install = npm.install();
      dataCallback("foo");
      errorCallback("foo-error");
      closeCallback(0);

      await install;
      expect(console.log.getCall(1).args[0]).toEqual("foo");
      expect(console.log.getCall(2).args[0]).toEqual("foo-error");
    });

    it("should remove node_modules and retry npm install when returns an error", () => {
      expect.assertions(1);
      npm.install();
      closeCallback(1);

      return new Promise(resolve => {
        setTimeout(() => {
          closeCallback(0);
          expect(fsExtra.remove.getCall(0).args[0]).toEqual(
            path.resolve(process.cwd(), "node_modules")
          );
          resolve();
        }, 200);
      });
    });

    it("should exit process when retry fails", () => {
      expect.assertions(1);
      npm.install();
      closeCallback(1);

      return new Promise(resolve => {
        setTimeout(() => {
          closeCallback(1);
          expect(process.exit.getCall(0).args[0]).toEqual(1);
          resolve();
        }, 200);
      });
    });
  });
});
