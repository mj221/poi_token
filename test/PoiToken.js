var PoiToken = artifacts.require("PoiToken");

contract('PoiToken', function(accounts){
    var tokenInstance; 
    it ('Initialises the contract with correct values', function(){
        return PoiToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, 'Poi Token', 'Has the correct name');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, 'POI', 'Has the correct symbol');
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, 'Poi Token v1.0', 'Has correct standard');
        });
    })
    it('Allocates initial supply upon deployment', function(){
        return PoiToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'Sets total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, 'Allocates initial supply to admin balance');
        });
    });
    
    // it('transfers token ownership', function(){
    //     return PoiToken.deployed().then(function(instance){
    //         tokenInstance = instance;
    //         return tokenInstance.transfer.call(accounts[1], 99999999999999999999999, {from: accounts[0]});
    //     }).then(assert.fail).catch(function(error){
    //         assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    //     })
    // })
    
});