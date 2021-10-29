const PoiToken = artifacts.require("PoiToken");

module.exports = function (deployer) {
  deployer.deploy(PoiToken, 1000000);
};
