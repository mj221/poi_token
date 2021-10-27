var PofToken = artifacts.require("PofToken");

contract('PofToken', function(accounts){
    it('Set total supply upon deployment', function(){
        return PofToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'Sets total supply to 1,000,000');
        });
    });
});