const check = require("./src/check");
const link = require("./src/link");
const unlink = require("./src/unlink");

module.exports = {
  linkAll: link.all,
  linkLocal: link.local,
  unlinkAll: unlink.all,
  unlinkLocal: unlink.local,
  avoidFileLinks: check.avoidFileLinks
};
