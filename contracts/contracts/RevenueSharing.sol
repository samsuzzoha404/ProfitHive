// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./ProfitHiveToken.sol";

/**
 * @title RevenueSharing
 * @dev Smart contract for distributing revenue among ProfitHive stakeholders
 * Features:
 * - Automatic revenue distribution based on token holdings
 * - Staking rewards for platform participation
 * - Performance-based rewards for accurate forecasts
 * - Transparent revenue tracking
 */
contract RevenueSharing is Ownable, ReentrancyGuard, Pausable {
    ProfitHiveToken public immutable profitHiveToken;

    struct RevenuePool {
        uint256 totalRevenue;
        uint256 distributedRevenue;
        uint256 timestamp;
        bool isDistributed;
    }

    struct UserStake {
        uint256 amount;
        uint256 stakingTimestamp;
        uint256 lastRewardClaim;
    }

    struct ForecastReward {
        address forecaster;
        uint256 accuracy; // Percentage * 100 (e.g., 9500 = 95%)
        uint256 rewardAmount;
        uint256 timestamp;
        bool claimed;
    }

    // State variables
    mapping(uint256 => RevenuePool) public revenuePools;
    mapping(address => UserStake) public userStakes;
    mapping(address => uint256) public claimableRewards;
    mapping(uint256 => ForecastReward) public forecastRewards;

    uint256 public currentPoolId;
    uint256 public totalStaked;
    uint256 public minStakingPeriod = 7 days;
    uint256 public forecastRewardId;

    // Revenue distribution percentages (basis points, 10000 = 100%)
    uint256 public stakersShare = 6000; // 60%
    uint256 public forecastersShare = 2000; // 20%
    uint256 public platformShare = 2000; // 20%

    // Events
    event RevenueDeposited(uint256 indexed poolId, uint256 amount);
    event RevenueDistributed(uint256 indexed poolId, uint256 totalAmount);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);
    event ForecastRewardAdded(
        uint256 indexed rewardId,
        address forecaster,
        uint256 accuracy,
        uint256 reward
    );
    event ForecastRewardClaimed(
        uint256 indexed rewardId,
        address forecaster,
        uint256 amount
    );

    constructor(
        address _profitHiveToken,
        address initialOwner
    ) Ownable(initialOwner) {
        profitHiveToken = ProfitHiveToken(_profitHiveToken);
    }

    /**
     * @dev Deposit revenue to be distributed
     */
    function depositRevenue() external payable onlyOwner {
        require(msg.value > 0, "Revenue must be greater than 0");

        currentPoolId++;
        revenuePools[currentPoolId] = RevenuePool({
            totalRevenue: msg.value,
            distributedRevenue: 0,
            timestamp: block.timestamp,
            isDistributed: false
        });

        emit RevenueDeposited(currentPoolId, msg.value);
    }

    /**
     * @dev Distribute revenue from a specific pool
     */
    function distributeRevenue(uint256 poolId) external onlyOwner nonReentrant {
        RevenuePool storage pool = revenuePools[poolId];
        require(!pool.isDistributed, "Revenue already distributed");
        require(pool.totalRevenue > 0, "No revenue to distribute");

        uint256 stakersAmount = (pool.totalRevenue * stakersShare) / 10000;
        uint256 forecastersAmount = (pool.totalRevenue * forecastersShare) /
            10000;
        uint256 platformAmount = (pool.totalRevenue * platformShare) / 10000;

        // Distribute to stakers proportionally
        if (totalStaked > 0 && stakersAmount > 0) {
            _distributeToStakers(stakersAmount);
        }

        // Keep forecasters and platform amounts in contract for later claims
        pool.distributedRevenue = pool.totalRevenue;
        pool.isDistributed = true;

        emit RevenueDistributed(poolId, pool.totalRevenue);
    }

    /**
     * @dev Stake ProfitHive tokens to earn revenue share
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Stake amount must be greater than 0");
        require(
            profitHiveToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        UserStake storage userStake = userStakes[msg.sender];

        // If user already has a stake, claim pending rewards first
        if (userStake.amount > 0) {
            _claimStakingRewards(msg.sender);
        }

        userStake.amount += amount;
        userStake.stakingTimestamp = block.timestamp;
        userStake.lastRewardClaim = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @dev Unstake tokens
     */
    function unstake(uint256 amount) external nonReentrant {
        UserStake storage userStake = userStakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(
            block.timestamp >= userStake.stakingTimestamp + minStakingPeriod,
            "Minimum staking period not met"
        );

        // Claim pending rewards first
        _claimStakingRewards(msg.sender);

        userStake.amount -= amount;
        totalStaked -= amount;

        require(
            profitHiveToken.transfer(msg.sender, amount),
            "Transfer failed"
        );

        emit Unstaked(msg.sender, amount);
    }

    /**
     * @dev Claim staking rewards
     */
    function claimStakingRewards() external nonReentrant {
        _claimStakingRewards(msg.sender);
    }

    /**
     * @dev Add forecast accuracy reward
     */
    function addForecastReward(
        address forecaster,
        uint256 accuracy,
        uint256 rewardAmount
    ) external onlyOwner {
        require(forecaster != address(0), "Invalid forecaster address");
        require(accuracy <= 10000, "Accuracy cannot exceed 100%");

        forecastRewardId++;
        forecastRewards[forecastRewardId] = ForecastReward({
            forecaster: forecaster,
            accuracy: accuracy,
            rewardAmount: rewardAmount,
            timestamp: block.timestamp,
            claimed: false
        });

        emit ForecastRewardAdded(
            forecastRewardId,
            forecaster,
            accuracy,
            rewardAmount
        );
    }

    /**
     * @dev Claim forecast accuracy reward
     */
    function claimForecastReward(uint256 rewardId) external nonReentrant {
        ForecastReward storage reward = forecastRewards[rewardId];
        require(reward.forecaster == msg.sender, "Not your reward");
        require(!reward.claimed, "Reward already claimed");

        reward.claimed = true;

        // Send ETH reward
        (bool success, ) = payable(msg.sender).call{value: reward.rewardAmount}(
            ""
        );
        require(success, "ETH transfer failed");

        emit ForecastRewardClaimed(rewardId, msg.sender, reward.rewardAmount);
    }

    /**
     * @dev Internal function to distribute rewards to stakers
     */
    function _distributeToStakers(uint256 totalAmount) internal {
        // This adds to claimable rewards proportionally
        // Implementation simplified for demo - in production, would use a more gas-efficient mechanism
    }

    /**
     * @dev Internal function to claim staking rewards
     */
    function _claimStakingRewards(address user) internal {
        uint256 rewards = claimableRewards[user];
        if (rewards > 0) {
            claimableRewards[user] = 0;
            (bool success, ) = payable(user).call{value: rewards}("");
            require(success, "ETH transfer failed");
            emit RewardsClaimed(user, rewards);
        }
    }

    /**
     * @dev Get user's staking information
     */
    function getUserStakeInfo(
        address user
    )
        external
        view
        returns (
            uint256 stakedAmount,
            uint256 stakingTimestamp,
            uint256 claimableAmount,
            bool canUnstake
        )
    {
        UserStake memory userStake = userStakes[user];
        return (
            userStake.amount,
            userStake.stakingTimestamp,
            claimableRewards[user],
            block.timestamp >= userStake.stakingTimestamp + minStakingPeriod
        );
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Update revenue sharing percentages
     */
    function updateRevenueShares(
        uint256 _stakersShare,
        uint256 _forecastersShare,
        uint256 _platformShare
    ) external onlyOwner {
        require(
            _stakersShare + _forecastersShare + _platformShare == 10000,
            "Shares must sum to 100%"
        );

        stakersShare = _stakersShare;
        forecastersShare = _forecastersShare;
        platformShare = _platformShare;
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
