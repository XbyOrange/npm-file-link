const check = require("./src/check");
const link = require("./src/link");
const unlink = require("./src/unlink");

module.exports = {
  linkAll: link.all,
  unlinkAll: unlink.all,
  avoidFileLinks: check.avoidFileLinks
};
