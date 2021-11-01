pragma solidity ^0.8.7;
import "./PoiToken.sol";
contract PoiTokenSale{
    address admin;
    PoiToken public tokenContract;
    uint256 public tokenPrice; 
    uint256 public tokensSold;
    
    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(PoiToken _tokenContract, uint256 _tokenPrice){
        // Assign admin
        admin = msg.sender;
        // Token contract
        tokenContract = _tokenContract;
        // Token Price
        tokenPrice = _tokenPrice;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        // Require that value is equal to tokens
        require(msg.value == _numberOfTokens * tokenPrice);
        // Require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // Require that a transfer is successful  
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // Keep track of tokens sold
        tokensSold += _numberOfTokens;
        // Trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public{
        // Require admin 
        require(msg.sender == admin);
        // Transfer remaining poi tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        // // Destroy contract
        address payable addr = payable(address(admin));
        selfdestruct(addr);
    }
}