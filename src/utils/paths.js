"use strict";

const fs = require("fs");
const path = require("path");

const PACKAGE_JSON = "package.json";
const PACKAGE_LOCK = "package-lock.json";

const getCurrentPath = () => Promise.resolve(process.cwd());

const isPackageFolder = folder =>
  Promise.resolve(fs.existsSync(path.resolve(folder, PACKAGE_JSON)));

const getWorkingPath = () => {
  return getCurrentPath().then(currentPath => {
    return isPackageFolder(currentPath).then(isPackage => {
      if (isPackage) {
        return Promise.resolve(path.resolve(currentPath, ".."));
      }
      return Promise.resolve(currentPath);
    });
  });
};

module.exports = {
  PACKAGE_JSON,
  PACKAGE_LOCK,
  getWorkingPath,
  isPackageFolder
};
