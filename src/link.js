"use strict";

const chalk = require("chalk");

const unlink = require("./unlink");
const inquire = require("./inquire");
const packages = require("./utils/packages");
const npm = require("./npm");
const { FILE_DEPENDENCY, PACKAGEJSON_NAMESPACE, isFileDependency } = require("./utils/helpers");

const logAdd = (dependency, packageName) => {
  console.log(chalk.green(`Linking \"${dependency}\" in \"${packageName}\"`));
};

const filterLinkablePackages = (packageInfo, allPackages) => {
  const linkablePackages = {};
  Object.keys(allPackages).forEach(packageName => {
    const dependency =
      packageInfo.dependencies[packageName] || packageInfo.devDependencies[packageName];
    if (dependency) {
      linkablePackages[packageName] = { ...allPackages[packageName] };
      if (isFileDependency(dependency)) {
        linkablePackages[packageName].isLinked = true;
      }
    }
  });
  return linkablePackages;
};

const addOriginalVersion = (packageInfo, packageName, original_version) => {
  packageInfo[PACKAGEJSON_NAMESPACE] = packageInfo[PACKAGEJSON_NAMESPACE] || {
    original_versions: {}
  };
  packageInfo[PACKAGEJSON_NAMESPACE].original_versions[packageName] = original_version;
};

const addPackagesLinks = (packageInfo, allPackages) => {
  let modified = false;
  let totalModified = 0;

  Object.keys(allPackages).forEach(packageName => {
    if (
      packageInfo.dependencies[packageName] &&
      !isFileDependency(packageInfo.dependencies[packageName])
    ) {
      addOriginalVersion(packageInfo, packageName, packageInfo.dependencies[packageName]);
      packageInfo.dependencies[
        packageName
      ] = `${FILE_DEPENDENCY}${allPackages[packageName].folder}`;

      logAdd(packageName, packageInfo.packageJson.name);
      totalModified++;
      modified = true;
    }
    if (
      packageInfo.devDependencies[packageName] &&
      !isFileDependency(packageInfo.devDependencies[packageName])
    ) {
      addOriginalVersion(packageInfo, packageName, packageInfo.devDependencies[packageName]);
      packageInfo.devDependencies[
        packageName
      ] = `${FILE_DEPENDENCY}${allPackages[packageName].folder}`;
      logAdd(packageName, packageInfo.packageJson.name);
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
    newPackageJson[PACKAGEJSON_NAMESPACE] = packageInfo[PACKAGEJSON_NAMESPACE];
  }
  if (newPackageJson.devDependencies) {
    newPackageJson.devDependencies = packageInfo.devDependencies;
    newPackageJson[PACKAGEJSON_NAMESPACE] = packageInfo[PACKAGEJSON_NAMESPACE];
  }
  return packages
    .writePackageJson(packageInfo.folder, newPackageJson)
    .then(() => Promise.resolve(totalModified));
};

const addAllPackagesLinks = allPackages => {
  const packagesModifications = [];
  Object.keys(allPackages).forEach(packageName => {
    packagesModifications.push(addPackagesLinks(allPackages[packageName], allPackages));
  });
  return Promise.all(packagesModifications);
};

const all = () => {
  return packages.readAll().then(addAllPackagesLinks);
};

const local = () => {
  return Promise.all([packages.readCurrent(), packages.readAll()]).then(results => {
    const linkablePackages = filterLinkablePackages(results[0], results[1]);
    return inquire.choose(linkablePackages).then(chosenPackages => {
      return addPackagesLinks(results[0], chosenPackages.toLink).then(added => {
        return unlink.removePackagesLinks(results[0], chosenPackages.toUnlink).then(removed => {
          if (added > 0 || removed > 0) {
            return npm.install();
          }
          console.log(chalk.green("No changes detected. Skipping install."));
          return Promise.resolve();
        });
      });
    });
  });
};

module.exports = {
  all,
  local
};
