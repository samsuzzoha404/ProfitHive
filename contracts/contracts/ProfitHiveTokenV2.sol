// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProfitHiveToken - Business Tokenomics Model
 * @dev ERC20 token with proper business model:
 * - Business owner controls token distribution
 * - Transaction fees generate platform revenue
 * - Retailers can purchase tokens to distribute to customers
 * - Staking rewards funded by platform fees
 * - Clear revenue streams for sustainable business
 */
contract ProfitHiveToken is
    ERC20,
    ERC20Burnable,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens
    uint256 public constant BUSINESS_RESERVE = 500_000_000 * 10 ** 18; // 50% for business owner
    uint256 public constant PUBLIC_SALE = 400_000_000 * 10 ** 18; // 40% for public sale
    uint256 public constant TEAM_RESERVE = 100_000_000 * 10 ** 18; // 10% for team/advisors

    // Business Model Parameters
    uint256 public transactionFeeRate = 100; // 1% (100 basis points)
    uint256 public constant MAX_FEE_RATE = 500; // 5% maximum fee
    uint256 public tokenPrice = 0.001 ether; // Price per token in ETH

    // Revenue Tracking
    uint256 public totalFeesCollected;
    uint256 public totalTokensSold;

    // Addresses
    address public feeCollector;
    address public treasuryWallet;

    // Roles and Permissions
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public retailers;
    mapping(address => bool) public feeExempt; // Addresses exempt from transaction fees

    // Sales Tracking
    mapping(address => uint256) public purchaseHistory;
    mapping(address => uint256) public retailerSales;

    // Events
    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 ethPaid
    );
    event TokensSoldToRetailer(
        address indexed retailer,
        uint256 amount,
        uint256 ethPaid
    );
    event TransactionFeeCollected(
        address indexed from,
        address indexed to,
        uint256 feeAmount
    );
    event FeeRateUpdated(uint256 oldRate, uint256 newRate);
    event TokenPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event RetailerAuthorized(address indexed retailer);
    event RetailerDeauthorized(address indexed retailer);

    error InsufficientPayment();
    error ExceedsMaxSupply();
    error InvalidFeeRate();
    error InvalidPrice();
    error NotAuthorizedRetailer();
    error TransferToZeroAddress();

    constructor(
        address initialOwner,
        address _treasuryWallet,
        address _feeCollector
    ) ERC20("ProfitHive Token", "PHIVE") Ownable(initialOwner) {
        require(_treasuryWallet != address(0), "Invalid treasury wallet");
        require(_feeCollector != address(0), "Invalid fee collector");

        treasuryWallet = _treasuryWallet;
        feeCollector = _feeCollector;

        // Mint business reserve to owner
        _mint(initialOwner, BUSINESS_RESERVE);

        // Set owner as fee exempt
        feeExempt[initialOwner] = true;
        feeExempt[address(this)] = true;
    }

    /**
     * @dev Public token purchase function
     * Anyone can buy tokens at current price
     */
    function purchaseTokens(uint256 tokenAmount) external payable nonReentrant {
        uint256 requiredEth = (tokenAmount * tokenPrice) / 10 ** 18;
        if (msg.value < requiredEth) revert InsufficientPayment();

        uint256 newTotalSupply = totalSupply() + tokenAmount;
        if (newTotalSupply > MAX_SUPPLY) revert ExceedsMaxSupply();

        // Mint tokens to buyer
        _mint(msg.sender, tokenAmount);

        // Track sales
        totalTokensSold += tokenAmount;
        purchaseHistory[msg.sender] += tokenAmount;

        // Send ETH to treasury
        (bool success, ) = treasuryWallet.call{value: requiredEth}("");
        require(success, "ETH transfer failed");

        // Refund excess ETH
        if (msg.value > requiredEth) {
            (bool refundSuccess, ) = msg.sender.call{
                value: msg.value - requiredEth
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit TokensPurchased(msg.sender, tokenAmount, requiredEth);
    }

    /**
     * @dev Sell tokens to retailers at wholesale price
     * Only owner can authorize retailers and sell to them
     */
    function sellToRetailer(
        address retailer,
        uint256 tokenAmount
    ) external payable onlyOwner nonReentrant {
        if (!retailers[retailer]) revert NotAuthorizedRetailer();

        uint256 wholesalePrice = (tokenPrice * 80) / 100; // 20% discount for retailers
        uint256 requiredEth = (tokenAmount * wholesalePrice) / 10 ** 18;
        if (msg.value < requiredEth) revert InsufficientPayment();

        uint256 newTotalSupply = totalSupply() + tokenAmount;
        if (newTotalSupply > MAX_SUPPLY) revert ExceedsMaxSupply();

        // Mint tokens to retailer
        _mint(retailer, tokenAmount);

        // Track retailer sales
        retailerSales[retailer] += tokenAmount;
        totalTokensSold += tokenAmount;

        emit TokensSoldToRetailer(retailer, tokenAmount, requiredEth);
    }

    /**
     * @dev Override transfer to implement transaction fees
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        if (to == address(0)) revert TransferToZeroAddress();

        // Skip fees for minting/burning or if either party is fee exempt
        if (
            from == address(0) ||
            to == address(0) ||
            feeExempt[from] ||
            feeExempt[to]
        ) {
            super._update(from, to, amount);
            return;
        }

        // Calculate transaction fee
        uint256 feeAmount = (amount * transactionFeeRate) / 10000;
        uint256 transferAmount = amount - feeAmount;

        // Transfer tokens minus fee
        super._update(from, to, transferAmount);

        // Transfer fee to fee collector
        if (feeAmount > 0) {
            super._update(from, feeCollector, feeAmount);
            totalFeesCollected += feeAmount;
            emit TransactionFeeCollected(from, to, feeAmount);
        }
    }

    // ===== ADMIN FUNCTIONS =====

    /**
     * @dev Set transaction fee rate (in basis points)
     */
    function setTransactionFeeRate(uint256 newRate) external onlyOwner {
        if (newRate > MAX_FEE_RATE) revert InvalidFeeRate();
        uint256 oldRate = transactionFeeRate;
        transactionFeeRate = newRate;
        emit FeeRateUpdated(oldRate, newRate);
    }

    /**
     * @dev Set token price for public sales
     */
    function setTokenPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InvalidPrice();
        uint256 oldPrice = tokenPrice;
        tokenPrice = newPrice;
        emit TokenPriceUpdated(oldPrice, newPrice);
    }

    /**
     * @dev Authorize retailer
     */
    function authorizeRetailer(address retailer) external onlyOwner {
        retailers[retailer] = true;
        feeExempt[retailer] = true; // Retailers are fee exempt for business operations
        emit RetailerAuthorized(retailer);
    }

    /**
     * @dev Deauthorize retailer
     */
    function deauthorizeRetailer(address retailer) external onlyOwner {
        retailers[retailer] = false;
        feeExempt[retailer] = false;
        emit RetailerDeauthorized(retailer);
    }

    /**
     * @dev Set fee exemption status
     */
    function setFeeExempt(address account, bool exempt) external onlyOwner {
        feeExempt[account] = exempt;
    }

    /**
     * @dev Update fee collector address
     */
    function setFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid collector address");
        feeCollector = newCollector;
    }

    /**
     * @dev Update treasury wallet
     */
    function setTreasuryWallet(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasuryWallet = newTreasury;
    }

    /**
     * @dev Authorize minter
     */
    function authorizeMinter(address minter) external onlyOwner {
        authorizedMinters[minter] = true;
    }

    /**
     * @dev Mint tokens - only for authorized contracts (staking rewards, etc.)
     */
    function mint(address to, uint256 amount) external {
        require(
            authorizedMinters[msg.sender] || msg.sender == owner(),
            "Not authorized to mint"
        );
        uint256 newTotalSupply = totalSupply() + amount;
        if (newTotalSupply > MAX_SUPPLY) revert ExceedsMaxSupply();
        _mint(to, amount);
    }

    // ===== VIEW FUNCTIONS =====

    /**
     * @dev Get purchase cost for token amount
     */
    function getPurchaseCost(
        uint256 tokenAmount
    ) external view returns (uint256) {
        return (tokenAmount * tokenPrice) / 10 ** 18;
    }

    /**
     * @dev Get retailer cost for token amount (wholesale price)
     */
    function getRetailerCost(
        uint256 tokenAmount
    ) external view returns (uint256) {
        uint256 wholesalePrice = (tokenPrice * 80) / 100;
        return (tokenAmount * wholesalePrice) / 10 ** 18;
    }

    /**
     * @dev Calculate transaction fee for amount
     */
    function calculateTransactionFee(
        uint256 amount
    ) external view returns (uint256) {
        return (amount * transactionFeeRate) / 10000;
    }

    /**
     * @dev Get business metrics
     */
    function getBusinessMetrics()
        external
        view
        returns (
            uint256 _totalFeesCollected,
            uint256 _totalTokensSold,
            uint256 _currentPrice,
            uint256 _feeRate,
            uint256 _circulatingSupply
        )
    {
        return (
            totalFeesCollected,
            totalTokensSold,
            tokenPrice,
            transactionFeeRate,
            totalSupply()
        );
    }

    // ===== EMERGENCY FUNCTIONS =====

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Emergency withdraw ETH (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
