"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const globule = require("globule");

const { isFileDependency } = require("./helpers");
const paths = require("./paths");

const readPackageJson = packageJsonPath =>
  fsExtra.readJson(packageJsonPath).catch(() => {
    return Promise.reject(new Error(`Unable to read ${packageJsonPath}`));
  });

const writePackageJson = (packageJsonFolder, content) =>
  paths.getWorkingPath().then(workingPath =>
    fsExtra.writeJson(path.resolve(workingPath, packageJsonFolder, paths.PACKAGE_JSON), content, {
      spaces: 2
    })
  );

const packagesToMap = packagesInfo => {
  const packagesMap = {};
  packagesInfo.forEach(packageInfo => {
    packagesMap[packageInfo.packageJson.name] = {
      folder: packageInfo.folder,
      dependencies: { ...packageInfo.packageJson.dependencies },
      devDependencies: { ...packageInfo.packageJson.devDependencies },
      packageJson: packageInfo.packageJson
    };
  });
  return packagesMap;
};

const packageFolder = packageJsonPath => packageJsonPath.split("/")[0];

const readAll = () => {
  return paths.getWorkingPath().then(workingPath => {
    const packageJsonFiles = globule.find(`*/${paths.PACKAGE_JSON}`, {
      srcBase: workingPath
    });
    const readAllPackageJsons = packageJsonFiles.map(packageJsonPath =>
      readPackageJson(path.resolve(workingPath, packageJsonPath)).then(packageJson =>
        Promise.resolve({
          folder: packageFolder(packageJsonPath),
          packageJson
        })
      )
    );

    return Promise.all(readAllPackageJsons).then(packagesInfo =>
      Promise.resolve(packagesToMap(packagesInfo))
    );
  });
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

const readCurrent = () => {
  const packageJsonPath = path.resolve(process.cwd(), paths.PACKAGE_JSON);
  const folder = process
    .cwd()
    .split(path.sep)
    .pop();
  return readPackageJson(packageJsonPath).then(packageJson => {
    return Promise.resolve({
      folder,
      dependencies: { ...packageJson.dependencies },
      devDependencies: { ...packageJson.devDependencies },
      packageJson
    });
  });
};

const currentLinkablePackages = currentPackageInfo => {
  return readAll().then(allPackagesInfo => {
    return Promise.resolve(filterLinkablePackages(currentPackageInfo, allPackagesInfo));
  });
};

module.exports = {
  readAll,
  readCurrent,
  writePackageJson,
  filterLinkablePackages,
  currentLinkablePackages
};
