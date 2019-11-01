[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Npm file link

CLI for automatically linking npm repositories locally using \"file:\" method.

### Install

```bash
npm i @xbyorange/npm-file-link -g
```

### Usage

**All npm package repositories to be linked have to be under the same folder**.

#### Linking an specific package:

Inside any package folder you can run:

```bash
npm-file-link
```

The tool will find dependencies able to be linked because are cloned locally too in the same folder level, and will let you choose which ones to link using a CLI:

![Choose package screenshot](assets/choose-screenshot.png)

Once you have chosen the dependencies to link, it will replace them locally by the correspondent `file:..` dependency in the current package and will run an `npm i` automatically. (Previous defined versions of the dependencies will be stored into a property in the `package.json` file automatically, and will be restored when the package is unlinked)

To remove all links in the current package, restore dependencies to their original versions, and reinstall them:

```bash
npm-file-link -ua
```

### Linking all packages

Inside any package folder you can run:

```bash
npm-file-link -a
```

### Unlinking all packages:

```bash
npm-file-link --unlink --all
```

...or:

```bash
npm-file-link -ua
```

### Options

| Option | Alias | Description |
| --- | --- | --- |
| --check | -c | Throw an error if there are locally linked packages |
| --all | -a | Apply command to all locally found dependencies. Do not prompt |
| --unlink | -u | Unlink packages. Has to be used with the -a option |
| --help | -h |  Display help |
| --version | -v | Output the current version | 
 
### Caveats

Linked packages have have modifications in the `package.json` and in the `package-lock.json` file that should never be pushed to the remote repository.

**Before pushing any change, you must execute:**

```bash
npm-file-link -ua
```

To avoid pushing local links to the remote repository, this package provides a `check` command that should be executed as a precommit hook.

```bash
npm-file-link --check
```

### Support (OS Terminals)

npm-file-link uses [inquirer][inquirer-url] for displaying CLI. You can [consult his OS Terminals support here][inquirer-support].

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[inquirer-url]: https://www.npmjs.com/package/inquirer#support-os-terminals
[inquirer-support]: https://www.npmjs.com/package/inquirer#support-os-terminals

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/npm-file-link/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/npm-file-link
[travisci-image]: https://travis-ci.com/xbyorange/npm-file-link.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/npm-file-link
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/npm-file-link.svg
[last-commit-url]: https://github.com/xbyorange/npm-file-link/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/npm-file-link.svg
[license-url]: https://github.com/xbyorange/npm-file-link/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/npm-file-link.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/npm-file-link
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/npm-file-link.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/npm-file-link
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-npm-file-link&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-npm-file-link
[release-image]: https://img.shields.io/github/release-date/xbyorange/npm-file-link.svg
[release-url]: https://github.com/xbyorange/npm-file-link/releases
