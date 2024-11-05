// demo.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract demo {
    uint number;

    // Function to set the value
    function set(uint _value) public {
        number = _value;
    }

    // Function to get the value
    function get() public view returns (uint) {
        return number;
    }
}