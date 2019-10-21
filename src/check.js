"use strict";

const path = require("path");

const fsExtra = require("fs-extra");
const chalk = require("chalk");

const { FILE_DEPENDENCY, PACKAGEJSON_NAMESPACE } = require("./utils/helpers");
const { PACKAGE_LOCK, PACKAGE_JSON } = require("./utils/paths");

const ENCODING = "utf8";

const readPackageFile = fileName => {
  const filePath = path.resolve(process.cwd(), fileName);
  if (fsExtra.existsSync(filePath)) {
    return fsExtra.readFile(filePath, ENCODING);
  }
  return Promise.resolve("");
};

const isValidContent = fileContent => Promise.resolve(!fileContent.includes(FILE_DEPENDENCY));
const hasOriginalVersions = packageInfo => !!packageInfo[PACKAGEJSON_NAMESPACE];

const readPackageLock = () => readPackageFile(PACKAGE_LOCK);
const readPackageJson = () => readPackageFile(PACKAGE_JSON);
const readPackageJsonAsJson = () => fsExtra.readJson(path.resolve(process.cwd(), PACKAGE_JSON));

const avoidFileLinks = () =>
  Promise.all([
    readPackageLock().then(isValidContent),
    readPackageJson().then(isValidContent),
    readPackageJsonAsJson().then(packageInfo => Promise.resolve(!hasOriginalVersions(packageInfo)))
  ]).then(results => {
    if (results.includes(false)) {
      console.log(chalk.red('\nERROR: Please remove file links. Run "file-unlink-all".\n'));
      process.exit(1);
    }
  });

module.exports = {
  avoidFileLinks
};
