import express from "express";
import blockchainService from "../services/blockchain-service.js";

const router = express.Router();

/**
 * Initialize blockchain connection
 * POST /api/blockchain/init
 */
router.post("/init", async (req, res) => {
  try {
    const { networkUrl, privateKey } = req.body;

    const success = await blockchainService.initialize(
      networkUrl || "http://127.0.0.1:8545",
      privateKey
    );

    if (success) {
      res.json({
        success: true,
        message: "Blockchain service initialized successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        error: "Failed to initialize blockchain service",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get blockchain health status
 * GET /api/blockchain/health
 */
router.get("/health", async (req, res) => {
  try {
    const health = await blockchainService.healthCheck();

    if (health.healthy) {
      res.json(health);
    } else {
      res.status(503).json(health);
    }
  } catch (error) {
    res.status(500).json({
      healthy: false,
      error: error.message,
    });
  }
});

/**
 * Submit AI forecast to blockchain
 * POST /api/blockchain/forecast
 */
router.post("/forecast", async (req, res) => {
  try {
    const {
      storeId,
      city,
      predictionPeriodStart,
      predictionPeriodEnd,
      dataHash,
      predictedSales,
    } = req.body;

    // Validate required fields
    if (
      !storeId ||
      !city ||
      !predictedSales ||
      !Array.isArray(predictedSales)
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing required forecast data",
      });
    }

    const result = await blockchainService.submitForecast({
      storeId,
      city,
      predictionPeriodStart:
        predictionPeriodStart || Math.floor(Date.now() / 1000),
      predictionPeriodEnd:
        predictionPeriodEnd ||
        Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 60 * 60, // 6 months
      dataHash: dataHash || "QmDefaultHash",
      predictedSales,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Submit actual sales data
 * POST /api/blockchain/actual-sales
 */
router.post("/actual-sales", async (req, res) => {
  try {
    const { forecastId, actualSales } = req.body;

    if (!forecastId || !actualSales || !Array.isArray(actualSales)) {
      return res.status(400).json({
        success: false,
        error: "Missing forecast ID or actual sales data",
      });
    }

    const result = await blockchainService.submitActualSales(
      forecastId,
      actualSales
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Tokenize revenue
 * POST /api/blockchain/tokenize
 */
router.post("/tokenize", async (req, res) => {
  try {
    const { retailerAddress, revenueAmount, tokenAmount } = req.body;

    if (!retailerAddress || !revenueAmount || !tokenAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing tokenization parameters",
      });
    }

    const result = await blockchainService.tokenizeRevenue(
      retailerAddress,
      revenueAmount,
      tokenAmount
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Distribute revenue
 * POST /api/blockchain/distribute
 */
router.post("/distribute", async (req, res) => {
  try {
    const { poolId } = req.body;

    if (!poolId) {
      return res.status(400).json({
        success: false,
        error: "Pool ID is required",
      });
    }

    const result = await blockchainService.distributeRevenue(poolId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get forecast accuracy
 * GET /api/blockchain/forecast/:id/accuracy
 */
router.get("/forecast/:id/accuracy", async (req, res) => {
  try {
    const forecastId = req.params.id;

    const accuracy = await blockchainService.getForecastAccuracy(forecastId);

    if (accuracy) {
      res.json({
        success: true,
        forecastId,
        ...accuracy,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Forecast not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get user staking information
 * GET /api/blockchain/stake/:address
 */
router.get("/stake/:address", async (req, res) => {
  try {
    const userAddress = req.params.address;

    const stakeInfo = await blockchainService.getUserStakeInfo(userAddress);

    if (stakeInfo) {
      res.json({
        success: true,
        userAddress,
        ...stakeInfo,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "User stake info not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Integration endpoint: AI Forecast + Blockchain Storage
 * POST /api/blockchain/ai-forecast-integration
 */
router.post("/ai-forecast-integration", async (req, res) => {
  try {
    const { storeData, externalData } = req.body;

    // This endpoint combines AI forecasting with blockchain storage
    // 1. Generate AI forecast (using existing enhanced-ai-service)
    // 2. Store forecast on blockchain
    // 3. Return both AI results and blockchain confirmation

    console.log("🔄 Processing AI + Blockchain integration...");

    // Mock AI forecast result (replace with actual AI service call)
    const aiResult = {
      forecast: [12000, 13500, 14200, 15800, 16500, 17200], // 6 months
      confidence: 0.92,
      insights: "Strong growth expected due to holiday season and local events",
      accuracy_score: 0.89,
    };

    // Store on blockchain
    const blockchainResult = await blockchainService.submitForecast({
      storeId: storeData.storeId || "store-001",
      city: storeData.city || "Cyberjaya",
      predictionPeriodStart: Math.floor(Date.now() / 1000),
      predictionPeriodEnd:
        Math.floor(Date.now() / 1000) + 6 * 30 * 24 * 60 * 60,
      dataHash: "QmAIForecast" + Date.now(),
      predictedSales: aiResult.forecast,
    });

    res.json({
      success: true,
      ai: aiResult,
      blockchain: blockchainResult,
      integration: {
        forecastStored: blockchainResult.success,
        immutableRecord: true,
        accuracyTracking: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Stake tokens
 * POST /api/blockchain/stake
 */
router.post("/stake", async (req, res) => {
  try {
    const { userAddress, amount } = req.body;

    if (!userAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "User address and amount are required",
      });
    }

    // In a real implementation, this would interact with smart contracts
    // For now, we'll simulate the staking process
    console.log(`Staking ${amount} tokens for user ${userAddress}`);

    // Simulate staking delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      message: `Successfully staked ${amount} PHIVE tokens`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      userAddress,
      amount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Unstake tokens
 * POST /api/blockchain/unstake
 */
router.post("/unstake", async (req, res) => {
  try {
    const { userAddress, amount } = req.body;

    if (!userAddress || !amount) {
      return res.status(400).json({
        success: false,
        error: "User address and amount are required",
      });
    }

    // Simulate unstaking process
    console.log(`Unstaking ${amount} tokens for user ${userAddress}`);

    // Simulate unstaking delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      message: `Successfully unstaked ${amount} PHIVE tokens`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      userAddress,
      amount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Claim staking rewards
 * POST /api/blockchain/claim-rewards
 */
router.post("/claim-rewards", async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: "User address is required",
      });
    }

    // Simulate claiming rewards
    console.log(`Claiming rewards for user ${userAddress}`);

    // Simulate claiming delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate random reward amount
    const rewardAmount = (Math.random() * 50 + 10).toFixed(4);

    res.json({
      success: true,
      message: `Successfully claimed ${rewardAmount} ETH in rewards`,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      userAddress,
      rewardAmount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Buy tokens from a business
 * POST /api/blockchain/buy-tokens
 */
router.post("/buy-tokens", async (req, res) => {
  try {
    const { walletAddress, tokenId, amount } = req.body;

    if (!walletAddress || !tokenId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: walletAddress, tokenId, amount",
      });
    }

    // Simulate token purchase transaction
    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const pricePerToken = 50; // RM 50 per token (this could be dynamic)
    const totalCost = parseFloat(amount) * pricePerToken;

    // Log the purchase (in a real app, this would interact with smart contracts)
    console.log(`Token Purchase:
      Wallet: ${walletAddress}
      Business Token ID: ${tokenId}
      Amount: ${amount} tokens
      Total Cost: RM ${totalCost}
      Transaction Hash: ${transactionHash}
    `);

    // Simulate successful transaction
    res.json({
      success: true,
      message: `Successfully purchased ${amount} tokens`,
      transactionHash,
      walletAddress,
      tokenId,
      amount: parseFloat(amount),
      totalCost,
      pricePerToken,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Buy tokens error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
