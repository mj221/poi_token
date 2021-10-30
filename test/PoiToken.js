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
    
    it('approves token for delegated transfer', function(){
        return PoiToken.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'Should be the approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorised by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorised to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        });
    });

    it('handles delegated token transfers', function(){
        return PoiToken.deployed().then(function(instance){
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function(receipt){
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function(receipt){
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(success){
            assert.equal(success, true);
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'Should be the approval event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are authorised by');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are authorised to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
        })
    })
});