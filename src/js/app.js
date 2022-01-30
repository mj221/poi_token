// console.log("app.js loaded");
App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,

    init: function(){
        console.log("app.js loaded");
        return App.initWeb3();
    },
    initWeb3: function(){
        if (window.web3) {
            // If a web3 instance is already provided by Meta Mask.
            window.ethereum.enable();
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(App.web3Provider);
        } else {
            // Specify default instance if no web3 instance provided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }
        return App.initContracts();
    },
    initContracts: function(){
        // bs-config.json has base directory
        $.getJSON("PoiTokenSale.json", function(poiTokenSale) {
            // Instantiate a new truffle contract from the artifact
            App.contracts.PoiTokenSale = TruffleContract(poiTokenSale);
            // Connect provider to interact with contract
            App.contracts.PoiTokenSale.setProvider(App.web3Provider);
            App.contracts.PoiTokenSale.deployed().then(function(poiTokenSale){
                console.log("Poi Token Sale Address:", poiTokenSale.address);
            });
        }).done(function(){
            $.getJSON("PoiToken.json", function(poiToken) {
                App.contracts.PoiToken = TruffleContract(poiToken);
                App.contracts.PoiToken.setProvider(App.web3Provider);
                App.contracts.PoiToken.deployed().then(function(poiToken){
                    console.log("Poi Token Address:", poiToken.address);
                });   
                App.listenForEvents();
                return App.render();
            });
        })        
    },
    // listen for emitted events from smart contract
    listenForEvents: function(){
        App.contracts.PoiTokenSale.deployed().then(function(instance){
            instance.Sell({}, {
                fromBlock: 0,
                toBlock: 'latest',
            }).watch(function(error, event){
                console.log("event triggered", event);
                App.render();
            })
        })
    },
    render: function(){
        // Prevent double loading
        if (App.loading){
            return;
        }
        App.loading = true;

        var loader = $('#loader');
        var content = $('#content');

        loader.show();
        content.hide();

        // Load account data 
        web3.eth.getCoinbase(function(err, account){
            if (err === null){
                // console.log("account:", account);
                App.account = account;
                $('#accountAddress').html("Your Account: " + account);
            }
        })
        // console.log("P1!!!");
        // Load token sale contract
        App.contracts.PoiTokenSale.deployed().then(function(instance){
            poiTokenSaleInstance = instance;
            return poiTokenSaleInstance.tokenPrice();
        }).then(function(tokenPrice){
            console.log("token price:", tokenPrice.toNumber());
            App.tokenPrice = tokenPrice;
            // $('.token-price').html(App.tokenPrice.toNumber());
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return poiTokenSaleInstance.tokensSold();
        }).then(function(tokensSold){
            App.tokensSold = tokensSold.toNumber();
            // console.log("P2", App.tokensSold);
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokensAvailable)

            // progress bar
            var progressPercent = App.tokensSold / App.tokensAvailable * 100;
            $('#progress1').css('width', progressPercent + '%');
            $('#progress1').html(Math.ceil(progressPercent) + '%')
        
            // e.g. style = "width: 40%" 
            if (progressPercent > 80){
                $('#progress1').addClass("progress-bar-warning");
            }
            if(progressPercent > 90){
                $('#progress1').addClass("progress-bar-danger");
            }

            App.contracts.PoiToken.deployed().then(function(instance){
                poiTokenInstance = instance;
                console.log("Current account:" , App.account);
                return poiTokenInstance.balanceOf(App.account);
            }).then(function(balance){
                console.log("balance: ", balance.toNumber());
                $('.poi-balance').html(balance.toNumber());

                App.loading = false;
                loader.hide();
                content.show();
            })
        });
    },
    buyTokens: function(){
        $('#content').hide();
        $('#loader').show();
        var numberOfToken = $('#numberOfTokens').val();
        App.contracts.PoiTokenSale.deployed().then(function(instance){
            return instance.buyTokens(numberOfToken, {
                from: App.account,
                value: numberOfToken * App.tokenPrice,
                gas: 500000 // gas limit
            });
        }).then(function(result){
            console.log("Tokens bought...")
            $('form').trigger('reset')
            // $('#loader').hide();
            // $('#content').show();
        })
    }
}

// load windows, initialise App
$(function(){
    $(window).load(function(){
        App.init();
    })
});