const PoiToken = artifacts.require("PoiToken");
const PoiTokenSale = artifacts.require("PoiTokenSale");

module.exports = function (deployer) {
  deployer.deploy(PoiToken, 1000000).then(function(){
    var tokenPrice = 1000000000000000; //0.001 ether
    return deployer.deploy(PoiTokenSale, PoiToken.address, tokenPrice);
  });
};
