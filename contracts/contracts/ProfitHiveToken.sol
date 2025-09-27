// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title ProfitHiveToken
 * @dev ERC20 token for ProfitHive platform
 * Features:
 * - Revenue sharing rewards
 * - Staking for platform benefits
 * - Governance participation
 * - Forecast accuracy rewards
 */
contract ProfitHiveToken is ERC20, ERC20Burnable, Ownable, Pausable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100_000_000 * 10 ** 18; // 100 million initial

    // Roles
    mapping(address => bool) public minters;
    mapping(address => bool) public rewarders;

    // Events
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewarderAdded(address indexed rewarder);
    event RewarderRemoved(address indexed rewarder);
    event RewardDistributed(
        address indexed recipient,
        uint256 amount,
        string reason
    );

    constructor(
        address initialOwner
    ) ERC20("ProfitHive Token", "PHIVE") Ownable(initialOwner) {
        _mint(initialOwner, INITIAL_SUPPLY);
    }

    /**
     * @dev Mint tokens - only callable by authorized minters
     */
    function mint(address to, uint256 amount) external {
        require(
            minters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Distribute rewards for forecast accuracy or platform participation
     */
    function distributeReward(
        address recipient,
        uint256 amount,
        string memory reason
    ) external {
        require(
            rewarders[msg.sender] || msg.sender == owner(),
            "Not authorized to reward"
        );
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");

        _mint(recipient, amount);
        emit RewardDistributed(recipient, amount, reason);
    }

    /**
     * @dev Add authorized minter
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    /**
     * @dev Remove authorized minter
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    /**
     * @dev Add authorized rewarder
     */
    function addRewarder(address rewarder) external onlyOwner {
        rewarders[rewarder] = true;
        emit RewarderAdded(rewarder);
    }

    /**
     * @dev Remove authorized rewarder
     */
    function removeRewarder(address rewarder) external onlyOwner {
        rewarders[rewarder] = false;
        emit RewarderRemoved(rewarder);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Override transfer functions to respect pause state
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._update(from, to, amount);
    }
}
