pragma solidity ^0.8.7;

contract PoiToken {
    
    string public name = "Poi Token";
    string public symbol = "POI";
    string public standard = "Poi Token v1.0";
    uint256 public totalSupply;
    
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    
    constructor (uint256 _initialSupply) {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
        // allocate initial supply
    }
    function transfer(address _to, uint256 _value) public returns (bool success){
        // Throw exception if account doesn't have enough tokens
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}