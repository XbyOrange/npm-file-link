"use strict";

const path = require("path");
const childProcess = require("child_process");
const chalk = require("chalk");

const fsExtra = require("fs-extra");

const UTF8 = "utf8";

const logger = data => {
  console.log(data);
};

const removeNodeModules = () => {
  console.log(chalk.yellow("Removing node_modules folder..."));
  return fsExtra.remove(path.resolve(process.cwd(), "node_modules"));
};

const install = retrying => {
  return new Promise((resolve, reject) => {
    console.log("Reinstalling npm dependencies...");
    const installProcess = childProcess.spawn("npm", ["i"], {
      windowsHide: true,
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: true
      }
    });

    installProcess.stdout.setEncoding(UTF8);
    installProcess.stderr.setEncoding(UTF8);

    installProcess.stdout.on("data", logger);
    installProcess.stderr.on("data", logger);

    installProcess.on("close", code => {
      if (code !== 0) {
        if (!retrying) {
          return removeNodeModules()
            .then(() => install(true))
            .then(() => {
              resolve();
            })
            .catch(err => {
              reject(err);
            });
        } else {
          reject(new Error("Error installing dependencies"));
        }
      } else {
        resolve();
      }
    });
  });
};

const checkChangesAndInstall = modified => {
  if (modified > 0) {
    return install();
  }
  console.log(chalk.green("No changes detected. Skipping install."));
  return Promise.resolve();
};

module.exports = {
  checkChangesAndInstall
};
