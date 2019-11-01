"use strict";

const inquirer = require("inquirer");

const getPackagesChoices = packages => {
  const choices = [];
  Object.keys(packages).forEach(packageName => {
    choices.push({
      name: packageName,
      value: packageName,
      checked: packages[packageName].isLinked
    });
  });
  return choices;
};

const choose = packages => {
  const packagesChoices = getPackagesChoices(packages);
  return inquirer
    .prompt([
      {
        name: "packages",
        type: "checkbox",
        message: "Choose packages to link",
        pageSize: 10,
        choices: packagesChoices
      }
    ])
    .then(answers => {
      const toLink = {};
      const toUnlink = {};
      Object.keys(packages).forEach(packageName => {
        if (answers.packages.includes(packageName)) {
          toLink[packageName] = packages[packageName];
        } else {
          toUnlink[packageName] = packages[packageName];
        }
      });
      return {
        toLink,
        toUnlink
      };
    });
};

module.exports = {
  choose
};
