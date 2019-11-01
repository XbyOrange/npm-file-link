"use strict";

const chalk = require("chalk");
const { isEmpty } = require("lodash");

const npm = require("./npm");
const packages = require("./utils/packages");
const { isFileDependency, PACKAGEJSON_NAMESPACE } = require("./utils/helpers");

const logRemove = (dependency, packageName) => {
  console.log(chalk.yellow(`Unlinking \"${dependency}\" in \"${packageName}\"`));
};

const removeOriginalVersion = (packageInfo, packageName) => {
  if (
    packageInfo.packageJson[PACKAGEJSON_NAMESPACE] &&
    packageInfo.packageJson[PACKAGEJSON_NAMESPACE].original_versions[packageName]
  ) {
    delete packageInfo.packageJson[PACKAGEJSON_NAMESPACE].original_versions[packageName];
  }
};

const removePackagesLinks = (packageInfo, allPackages) => {
  let modified = false;
  let totalModified = 0;

  Object.keys(allPackages).forEach(packageName => {
    if (
      packageInfo.dependencies[packageName] &&
      isFileDependency(packageInfo.dependencies[packageName])
    ) {
      packageInfo.dependencies[packageName] =
        (packageInfo.packageJson[PACKAGEJSON_NAMESPACE] &&
          packageInfo.packageJson[PACKAGEJSON_NAMESPACE].original_versions[packageName]) ||
        allPackages[packageName].packageJson.version;
      removeOriginalVersion(packageInfo, packageName);
      logRemove(packageName, packageInfo.packageJson.name);
      totalModified++;
      modified = true;
    }
    if (
      packageInfo.devDependencies[packageName] &&
      isFileDependency(packageInfo.devDependencies[packageName])
    ) {
      packageInfo.devDependencies[packageName] =
        (packageInfo.packageJson[PACKAGEJSON_NAMESPACE] &&
          packageInfo.packageJson[PACKAGEJSON_NAMESPACE].original_versions[packageName]) ||
        allPackages[packageName].packageJson.version;
      removeOriginalVersion(packageInfo, packageName);
      logRemove(packageName, packageInfo.packageJson.name);
      totalModified++;
      modified = true;
    }
  });
  if (!modified) {
    return Promise.resolve(totalModified);
  }
  const newPackageJson = {
    ...packageInfo.packageJson
  };
  if (newPackageJson.dependencies) {
    newPackageJson.dependencies = packageInfo.dependencies;
  }
  if (newPackageJson.devDependencies) {
    newPackageJson.devDependencies = packageInfo.devDependencies;
  }
  if (
    newPackageJson[PACKAGEJSON_NAMESPACE] &&
    isEmpty(newPackageJson[PACKAGEJSON_NAMESPACE].original_versions)
  ) {
    delete newPackageJson[PACKAGEJSON_NAMESPACE];
  }
  return packages
    .writePackageJson(packageInfo.folder, newPackageJson)
    .then(() => Promise.resolve(totalModified));
};

const all = () => {
  return packages.readCurrent().then(currentPackageInfo => {
    return packages.currentLinkablePackages(currentPackageInfo).then(linkablePackages => {
      return removePackagesLinks(currentPackageInfo, linkablePackages).then(removed => {
        return npm.checkChangesAndInstall(removed);
      });
    });
  });
};

module.exports = {
  removePackagesLinks,
  all
};
