const PofToken = artifacts.require("PofToken");

module.exports = function (deployer) {
  deployer.deploy(PofToken);
};
