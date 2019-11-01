"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const globule = require("globule");

const paths = require("./paths");

const readPackageJson = packageJsonPath => fsExtra.readJson(packageJsonPath);
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

module.exports = {
  readAll,
  readCurrent,
  writePackageJson
};
