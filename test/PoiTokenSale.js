var PoiTokenSale = artifacts.require("PoiTokenSale");
var PoiToken = artifacts.require("PoiToken");


contract('PoiTokenSale', function(accounts){
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokensAvailable = 750000;

    it('Initialise the contract with correct values', async function(){
        let tokenSaleInstance = await PoiTokenSale.deployed();
        let address = tokenSaleInstance.address;
        assert.notEqual(address, 0x0, 'has contract address');

        let contractAddress = tokenSaleInstance.tokenContract();
        assert.notEqual(address, 0x0, 'has token contract address');

        let price = await tokenSaleInstance.tokenPrice();
        assert.equal(price, tokenPrice, 'token price is correct');
    });

    it('facilitates token purchasing', async function(){
        let tokenInstance = await PoiToken.deployed();
        let tokenSaleInstance = await PoiTokenSale.deployed();

        var numberOfTokens = 10;
        var value = numberOfTokens * tokenPrice;

        // Provision 75% of total supply for public sale
        let tokenSale = await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});

        let boughtTokens = await tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: value});
        let receipt = boughtTokens.receipt;
        assert.equal(receipt.logs.length, 1, 'triggers event');
        assert.equal(receipt.logs[0].event, 'Sell', 'Should be sell event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');

        let amount = await tokenSaleInstance.tokensSold();
        assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
        
        let currentAvailableTokens = await tokenInstance.balanceOf(tokenSaleInstance.address);
        assert.equal(currentAvailableTokens.toNumber(), tokensAvailable - numberOfTokens);

        tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1}).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
        });

        tokenSaleInstance.buyTokens(800000, {from: buyer, value: value}).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert') >= 0, 'cannot purchase more than currently available');
        });
    });

    it('ends token sale', function(){
        return PoiToken.deployed().then(function(instance){
            tokenInstance = instance;
            return PoiTokenSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error){
            assert(error.message.toString().indexOf('revert') >= 0, 'must be admin to end sale');
            return tokenSaleInstance.endSale({from: admin});
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 999990, 'returns all unsold poi tokens to admin');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(balance){
            assert.equal(balance.toNumber(), 0, 'token price was reset');
        });
    });

})