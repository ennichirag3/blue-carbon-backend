// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonToken is ERC20, Ownable {
    constructor(uint256 initialSupply) 
        ERC20("CarbonToken", "CTK") 
        Ownable(msg.sender) // ✅ Pass deployer as initial owner
    {
        _mint(msg.sender, initialSupply);
    }
}
