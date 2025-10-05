import express from "express";
import mongoDBService from "../services/mongodb-service.js";

const router = express.Router();

/**
 * Get all available business tokens
 * GET /api/tokens
 */
router.get("/", async (req, res) => {
  try {
    const result = await mongoDBService.getAllTokens();

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      tokens: [],
      totalCount: 0,
    });
  }
});

/**
 * Create a new business token
 * POST /api/tokens/create
 */
router.post("/create", async (req, res) => {
  try {
    const {
      businessName,
      description,
      revenueEstimate,
      tokenizePercentage,
      walletAddress,
    } = req.body;

    if (!businessName || !description || !revenueEstimate || !walletAddress) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: businessName, description, revenueEstimate, walletAddress",
      });
    }

    const result = await mongoDBService.createToken({
      businessName,
      description,
      revenueEstimate,
      tokenizePercentage,
      walletAddress,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error creating token:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Buy tokens from a business
 * POST /api/tokens/buy
 */
router.post("/buy", async (req, res) => {
  try {
    const { tokenId, amount, walletAddress, paymentTxHash, ethAmountPaid } =
      req.body;

    if (!tokenId || !amount || !walletAddress || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: tokenId, amount, walletAddress",
      });
    }

    const result = await mongoDBService.buyTokens({
      tokenId,
      amount,
      walletAddress,
      paymentTxHash,
      ethAmountPaid,
    });

    if (result.success) {
      res.json(result);
      return;
    } else {
      return res
        .status(result.error.includes("not found") ? 404 : 400)
        .json(result);
    }
  } catch (error) {
    console.error("Error buying tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get token details by ID
 * GET /api/tokens/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const tokenId = parseInt(req.params.id);
    const result = await mongoDBService.getTokenById(tokenId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error("Error getting token details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Restock tokens for a business (owner only)
 * POST /api/tokens/:id/restock
 */
router.post("/:id/restock", async (req, res) => {
  try {
    const tokenId = parseInt(req.params.id);
    const { additionalTokens, walletAddress } = req.body;

    if (!additionalTokens || !walletAddress || additionalTokens <= 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: additionalTokens, walletAddress",
      });
    }

    const result = await mongoDBService.restockTokens(
      tokenId,
      parseInt(additionalTokens),
      walletAddress
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(result.error.includes("not found") ? 404 : 403).json(result);
    }
  } catch (error) {
    console.error("Error restocking tokens:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
