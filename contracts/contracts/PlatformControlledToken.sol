// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title PlatformControlledToken
 * @dev Business tokenization platform where:
 * 1. Platform owner controls entire token supply
 * 2. Retailers must buy tokens from platform to tokenize businesses
 * 3. Platform earns fees on all transactions
 * 4. Controlled distribution model for business tokenization
 */
contract PlatformControlledToken is ERC20, Ownable, ReentrancyGuard {
    using Math for uint256;

    // ================== Constants ==================
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    uint256 public constant PLATFORM_FEE_PERCENT = 2; // 2% platform fee
    uint256 public constant MIN_PURCHASE_AMOUNT = 1000 * 10 ** 18; // Minimum 1000 tokens

    // ================== State Variables ==================
    address public platformFeeCollector;
    uint256 public platformTokenPrice = 1 ether; // 1 ETH per 1000 tokens initially
    uint256 public totalPlatformRevenue;

    mapping(address => bool) public authorizedRetailers;
    mapping(address => uint256) public retailerPurchaseHistory;
    mapping(address => bool) public exemptFromFees; // Platform wallets exempt from fees

    // ================== Events ==================
    event RetailerAuthorized(address indexed retailer, uint256 timestamp);
    event RetailerRevoked(address indexed retailer, uint256 timestamp);
    event TokensPurchasedFromPlatform(
        address indexed buyer,
        uint256 ethAmount,
        uint256 tokensReceived,
        uint256 timestamp
    );
    event PlatformFeeCollected(
        address indexed from,
        address indexed to,
        uint256 feeAmount,
        uint256 timestamp
    );
    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);

    // ================== Custom Errors ==================
    error InsufficientPayment();
    error NotAuthorizedRetailer();
    error BelowMinimumPurchase();
    error NoTokensAvailable();
    error InvalidPrice();
    error TransferFailed();

    constructor(
        address _platformFeeCollector
    ) ERC20("ProfitHive Token", "PHIVE") Ownable(msg.sender) {
        platformFeeCollector = _platformFeeCollector;

        // Platform owner gets all tokens initially
        _mint(msg.sender, TOTAL_SUPPLY);

        // Platform wallets are exempt from fees
        exemptFromFees[msg.sender] = true;
        exemptFromFees[_platformFeeCollector] = true;
    }

    // ================== Platform Owner Functions ==================

    /**
     * @dev Set token price for retailers to purchase from platform
     * @param _newPrice New price in ETH per 1000 tokens
     */
    function setPlatformTokenPrice(uint256 _newPrice) external onlyOwner {
        if (_newPrice == 0) revert InvalidPrice();

        uint256 oldPrice = platformTokenPrice;
        platformTokenPrice = _newPrice;

        emit PriceUpdated(oldPrice, _newPrice, block.timestamp);
    }

    /**
     * @dev Authorize retailer to participate in business tokenization
     * @param _retailer Address of retailer to authorize
     */
    function authorizeRetailer(address _retailer) external onlyOwner {
        authorizedRetailers[_retailer] = true;
        emit RetailerAuthorized(_retailer, block.timestamp);
    }

    /**
     * @dev Revoke retailer authorization
     * @param _retailer Address of retailer to revoke
     */
    function revokeRetailer(address _retailer) external onlyOwner {
        authorizedRetailers[_retailer] = false;
        emit RetailerRevoked(_retailer, block.timestamp);
    }

    /**
     * @dev Set fee exemption status for platform wallets
     * @param _address Address to set exemption for
     * @param _exempt Whether to exempt from fees
     */
    function setFeeExemption(
        address _address,
        bool _exempt
    ) external onlyOwner {
        exemptFromFees[_address] = _exempt;
    }

    /**
     * @dev Withdraw platform revenue (ETH from token sales)
     * @param _amount Amount to withdraw
     */
    function withdrawPlatformRevenue(
        uint256 _amount
    ) external onlyOwner nonReentrant {
        if (_amount > address(this).balance) revert InsufficientPayment();

        (bool success, ) = payable(owner()).call{value: _amount}("");
        if (!success) revert TransferFailed();
    }

    // ================== Public Purchase Functions ==================

    /**
     * @dev Retailers and investors purchase tokens from platform
     * Platform controls all token distribution
     */
    function purchaseTokensFromPlatform() external payable nonReentrant {
        if (msg.value == 0) revert InsufficientPayment();

        // Calculate tokens to receive (price is per 1000 tokens)
        uint256 tokensToReceive = (msg.value * 1000 * 10 ** 18) /
            platformTokenPrice;

        if (tokensToReceive < MIN_PURCHASE_AMOUNT)
            revert BelowMinimumPurchase();
        if (balanceOf(owner()) < tokensToReceive) revert NoTokensAvailable();

        // Track retailer purchase history
        retailerPurchaseHistory[msg.sender] += tokensToReceive;
        totalPlatformRevenue += msg.value;

        // Transfer tokens from platform owner to buyer
        _transfer(owner(), msg.sender, tokensToReceive);

        emit TokensPurchasedFromPlatform(
            msg.sender,
            msg.value,
            tokensToReceive,
            block.timestamp
        );
    }

    // ================== Enhanced Transfer with Fees ==================

    /**
     * @dev Apply platform fees using _update hook (OpenZeppelin 5.x)
     * Platform earns fees on every transaction
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override {
        // Skip fees for platform wallets and minting/burning
        if (
            from == address(0) ||
            to == address(0) ||
            exemptFromFees[from] ||
            exemptFromFees[to]
        ) {
            super._update(from, to, amount);
            return;
        }

        // Calculate platform fee (2% of transfer amount)
        uint256 feeAmount = (amount * PLATFORM_FEE_PERCENT) / 100;
        uint256 transferAmount = amount - feeAmount;

        // Apply fee to fee collector first
        if (feeAmount > 0) {
            super._update(from, platformFeeCollector, feeAmount);
            emit PlatformFeeCollected(
                from,
                platformFeeCollector,
                feeAmount,
                block.timestamp
            );
        }

        // Then transfer remaining amount to recipient
        super._update(from, to, transferAmount);
    }

    // ================== View Functions ==================

    /**
     * @dev Get current token price for platform purchases
     * @return Price in ETH per 1000 tokens
     */
    function getCurrentTokenPrice() external view returns (uint256) {
        return platformTokenPrice;
    }

    /**
     * @dev Calculate how many tokens can be purchased with given ETH amount
     * @param _ethAmount Amount of ETH
     * @return Number of tokens that can be purchased
     */
    function calculateTokensForEth(
        uint256 _ethAmount
    ) external view returns (uint256) {
        return (_ethAmount * 1000 * 10 ** 18) / platformTokenPrice;
    }

    /**
     * @dev Calculate ETH needed to purchase specific amount of tokens
     * @param _tokenAmount Amount of tokens desired
     * @return ETH amount needed
     */
    function calculateEthForTokens(
        uint256 _tokenAmount
    ) external view returns (uint256) {
        return (_tokenAmount * platformTokenPrice) / (1000 * 10 ** 18);
    }

    /**
     * @dev Get platform statistics
     * @return totalSupply_ Total token supply
     * @return platformBalance Platform owner balance
     * @return totalRevenue Total platform revenue
     * @return currentPrice Current token price
     * @return contractBalance Contract ETH balance
     */
    function getPlatformStats()
        external
        view
        returns (
            uint256 totalSupply_,
            uint256 platformBalance,
            uint256 totalRevenue,
            uint256 currentPrice,
            uint256 contractBalance
        )
    {
        return (
            totalSupply(),
            balanceOf(owner()),
            totalPlatformRevenue,
            platformTokenPrice,
            address(this).balance
        );
    }

    /**
     * @dev Check if address is authorized retailer
     * @param _retailer Address to check
     * @return Whether retailer is authorized
     */
    function isAuthorizedRetailer(
        address _retailer
    ) external view returns (bool) {
        return authorizedRetailers[_retailer];
    }

    /**
     * @dev Get retailer purchase history
     * @param _retailer Retailer address
     * @return Total tokens purchased by retailer
     */
    function getRetailerPurchaseHistory(
        address _retailer
    ) external view returns (uint256) {
        return retailerPurchaseHistory[_retailer];
    }

    // ================== Emergency Functions ==================

    /**
     * @dev Emergency withdraw all ETH (owner only)
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @dev Update platform fee collector address
     * @param _newCollector New fee collector address
     */
    function updateFeeCollector(address _newCollector) external onlyOwner {
        platformFeeCollector = _newCollector;
        exemptFromFees[_newCollector] = true;
    }

    // ================== Receive ETH ==================
    receive() external payable {
        // Allow contract to receive ETH
    }
}
