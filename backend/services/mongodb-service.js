import { MongoClient } from "mongodb";

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.connectionString =
      "mongodb+srv://HashForce:HashForce2025@profithive.wpnmfwb.mongodb.net/?retryWrites=true&w=majority&appName=ProfitHive";
    this.dbName = "ProfitHive";
    this.tokensCollection = "business_tokens";
    this.countersCollection = "counters";
  }

  async connect() {
    try {
      if (!this.client) {
        console.log("🔗 Connecting to MongoDB...");
        this.client = new MongoClient(this.connectionString);
        await this.client.connect();
        this.db = this.client.db(this.dbName);

        // Initialize counter for token IDs if it doesn't exist
        await this.initializeCounter();

        console.log("✅ MongoDB connected successfully");
        return true;
      }
      return true;
    } catch (error) {
      console.error("❌ MongoDB connection failed:", error.message);
      return false;
    }
  }

  async initializeCounter() {
    try {
      const counter = await this.db
        .collection(this.countersCollection)
        .findOne({ _id: "tokenId" });
      if (!counter) {
        await this.db.collection(this.countersCollection).insertOne({
          _id: "tokenId",
          seq: 1,
        });
      }
    } catch (error) {
      console.error("Error initializing counter:", error);
    }
  }

  async getNextSequence(name) {
    const result = await this.db
      .collection(this.countersCollection)
      .findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { returnDocument: "after" }
      );
    return result.seq;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log("🔌 MongoDB disconnected");
    }
  }

  // Business Token Operations
  async getAllTokens() {
    try {
      await this.connect();
      const tokens = await this.db
        .collection(this.tokensCollection)
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .toArray();

      return {
        success: true,
        tokens,
        totalCount: tokens.length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching tokens:", error);
      return {
        success: false,
        error: error.message,
        tokens: [],
        totalCount: 0,
      };
    }
  }

  async createToken(tokenData) {
    try {
      await this.connect();

      const {
        businessName,
        description,
        revenueEstimate,
        tokenizePercentage,
        walletAddress,
      } = tokenData;

      // Calculate token details
      const revenue = parseFloat(revenueEstimate) || 0;
      const percentage = tokenizePercentage || 20;
      const pricePerToken = 50; // RM 50 per token
      const totalTokens = Math.floor(
        (revenue * percentage) / 100 / pricePerToken
      );
      const totalValue = totalTokens * pricePerToken;

      // Get next ID
      const tokenId = await this.getNextSequence("tokenId");

      // Create token document
      const newToken = {
        id: tokenId,
        businessName,
        description,
        revenueEstimate: revenue,
        tokenizePercentage: percentage,
        totalTokens,
        availableTokens: totalTokens,
        pricePerToken,
        totalValue,
        ownerAddress: walletAddress.toLowerCase(),
        sector: "Business",
        expectedROI: `${(8 + Math.random() * 6).toFixed(1)}%`,
        createdAt: new Date().toISOString(),
        isActive: true,
        buyers: [],
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      };

      const result = await this.db
        .collection(this.tokensCollection)
        .insertOne(newToken);

      if (result.acknowledged) {
        console.log(
          `💼 Created token: ${businessName} (${totalTokens} tokens)`
        );
        return {
          success: true,
          message: `Successfully created ${totalTokens} tokens for ${businessName}`,
          token: newToken,
          transactionHash: newToken.transactionHash,
        };
      } else {
        throw new Error("Failed to insert token");
      }
    } catch (error) {
      console.error("Error creating token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async buyTokens(purchaseData) {
    try {
      await this.connect();

      const { tokenId, amount, walletAddress, paymentTxHash, ethAmountPaid } =
        purchaseData;
      const purchaseAmount = parseInt(amount);

      // Find the token
      const token = await this.db.collection(this.tokensCollection).findOne({
        id: tokenId,
        isActive: true,
      });

      if (!token) {
        return {
          success: false,
          error: "Token not found",
        };
      }

      if (purchaseAmount > token.availableTokens) {
        return {
          success: false,
          error: `Not enough tokens available. Only ${token.availableTokens} tokens remaining.`,
        };
      }

      // Create purchase record with real payment data
      const purchase = {
        buyer: walletAddress.toLowerCase(),
        amount: purchaseAmount,
        totalCost: purchaseAmount * token.pricePerToken, // Cost in RM
        ethAmountPaid: ethAmountPaid || 0, // Real ETH amount paid
        paymentTxHash: paymentTxHash || null, // Real blockchain transaction hash
        businessOwner: token.ownerAddress.toLowerCase(), // Who received the payment
        timestamp: new Date().toISOString(),
        transactionHash:
          paymentTxHash || `0x${Math.random().toString(16).substr(2, 64)}`, // Use real tx hash if available
        isPaidOnChain: !!paymentTxHash, // Flag to indicate real blockchain payment
      };

      // Update token with purchase
      const updateResult = await this.db
        .collection(this.tokensCollection)
        .updateOne(
          { id: tokenId },
          {
            $inc: { availableTokens: -purchaseAmount },
            $push: { buyers: purchase },
          }
        );

      if (updateResult.modifiedCount > 0) {
        console.log(
          `🛒 Real Purchase: ${purchaseAmount} tokens from ${token.businessName}
          💰 Buyer: ${walletAddress}
          💸 Amount Paid: ${ethAmountPaid || "simulated"} ETH
          🔗 TX Hash: ${paymentTxHash || "simulated"}
          👤 Business Owner: ${token.ownerAddress}`
        );
        return {
          success: true,
          message: `Successfully purchased ${purchaseAmount} tokens from ${
            token.businessName
          }${
            paymentTxHash
              ? ` with real ETH payment (${ethAmountPaid} ETH)`
              : " (simulated)"
          }`,
          purchase,
          remainingTokens: token.availableTokens - purchaseAmount,
          transactionHash: purchase.transactionHash,
          paymentDetails: {
            isPaidOnChain: !!paymentTxHash,
            ethAmountPaid: ethAmountPaid || 0,
            businessOwnerReceived: token.ownerAddress,
          },
        };
      } else {
        throw new Error("Failed to update token");
      }
    } catch (error) {
      console.error("Error buying tokens:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTokenById(tokenId) {
    try {
      await this.connect();
      const token = await this.db.collection(this.tokensCollection).findOne({
        id: parseInt(tokenId),
        isActive: true,
      });

      if (!token) {
        return {
          success: false,
          error: "Token not found",
        };
      }

      return {
        success: true,
        token,
      };
    } catch (error) {
      console.error("Error fetching token:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async restockTokens(tokenId, additionalTokens, walletAddress) {
    try {
      await this.connect();

      // Find the token and verify ownership
      const token = await this.db.collection(this.tokensCollection).findOne({
        id: tokenId,
        isActive: true,
      });

      if (!token) {
        return {
          success: false,
          error: "Token not found",
        };
      }

      // Verify that the wallet address matches the token owner
      if (token.ownerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return {
          success: false,
          error: "Only the business owner can restock tokens",
        };
      }

      // Update token with additional availability
      const updateResult = await this.db
        .collection(this.tokensCollection)
        .updateOne(
          { id: tokenId },
          {
            $inc: {
              availableTokens: additionalTokens,
              totalTokens: additionalTokens,
            },
            $set: {
              lastRestockedAt: new Date().toISOString(),
              totalValue:
                (token.totalTokens + additionalTokens) * token.pricePerToken,
            },
          }
        );

      if (updateResult.modifiedCount > 0) {
        // Get updated token
        const updatedToken = await this.db
          .collection(this.tokensCollection)
          .findOne({ id: tokenId });

        return {
          success: true,
          message: `Successfully restocked ${additionalTokens} tokens for ${token.businessName}`,
          token: updatedToken,
          addedTokens: additionalTokens,
          newAvailable: updatedToken.availableTokens,
          newTotal: updatedToken.totalTokens,
        };
      } else {
        return {
          success: false,
          error: "Failed to restock tokens",
        };
      }
    } catch (error) {
      console.error("Error restocking tokens:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.connect();
      await this.db.admin().ping();
      return {
        success: true,
        message: "MongoDB connection healthy",
        database: this.dbName,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Singleton instance
const mongoDBService = new MongoDBService();

export default mongoDBService;
