// contracts/OINIOToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OINIOToken {
    string public constant name = "OINIO Quantum Pi";
    string public constant symbol = "OINIO";
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 1_000_000_000 * 10**uint256(decimals);

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    address public immutable forgeAddress;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(address indexed burner, uint256 value);

    constructor(address _forgeAddress) {
        forgeAddress = _forgeAddress;
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function burn(uint256 amount) public {
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        emit Burn(msg.sender, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "Transfer from zero address");
        require(to != address(0), "Transfer to zero address");
        require(_balances[from] >= amount, "Insufficient balance");

        _balances[from] -= amount;
        _balances[to] += amount;

        // Quantum resonance tax for forge
        uint256 resonanceTax = amount * 4 / 100; // 4% to forge
        _balances[forgeAddress] += resonanceTax;
        _balances[to] -= resonanceTax;

        emit Transfer(from, to, amount - resonanceTax);
        emit Transfer(to, forgeAddress, resonanceTax);
    }
}