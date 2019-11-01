"use strict";

const FILE_DEPENDENCY = "file:../";

const PACKAGEJSON_NAMESPACE = "npm-file-link";

const isFileDependency = dependency => dependency.includes(FILE_DEPENDENCY);

module.exports = {
  FILE_DEPENDENCY,
  PACKAGEJSON_NAMESPACE,
  isFileDependency
};
