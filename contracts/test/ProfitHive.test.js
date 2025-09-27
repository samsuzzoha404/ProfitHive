const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProfitHive Contracts", function () {
  let profitHiveToken, revenueSharing, forecastData;
  let owner, addr1, addr2, dataProvider;

  beforeEach(async function () {
    [owner, addr1, addr2, dataProvider] = await ethers.getSigners();

    // Deploy ProfitHive Token
    const ProfitHiveToken = await ethers.getContractFactory("ProfitHiveToken");
    profitHiveToken = await ProfitHiveToken.deploy(owner.address);
    await profitHiveToken.deployed();

    // Deploy Revenue Sharing
    const RevenueSharing = await ethers.getContractFactory("RevenueSharing");
    revenueSharing = await RevenueSharing.deploy(
      profitHiveToken.address,
      owner.address
    );
    await revenueSharing.deployed();

    // Deploy Forecast Data
    const ForecastData = await ethers.getContractFactory("ForecastData");
    forecastData = await ForecastData.deploy(owner.address);
    await forecastData.deployed();

    // Set up permissions
    await profitHiveToken.addMinter(revenueSharing.address);
    await profitHiveToken.addRewarder(revenueSharing.address);
    await forecastData.addDataProvider(dataProvider.address);
  });

  describe("ProfitHive Token", function () {
    it("Should have correct initial supply", async function () {
      const initialSupply = ethers.utils.parseEther("100000000"); // 100 million
      expect(await profitHiveToken.totalSupply()).to.equal(initialSupply);
    });

    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await profitHiveToken.mint(addr1.address, mintAmount);
      expect(await profitHiveToken.balanceOf(addr1.address)).to.equal(
        mintAmount
      );
    });

    it("Should allow authorized rewarders to distribute rewards", async function () {
      const rewardAmount = ethers.utils.parseEther("500");
      await profitHiveToken.distributeReward(
        addr1.address,
        rewardAmount,
        "Accurate forecast"
      );
      expect(await profitHiveToken.balanceOf(addr1.address)).to.equal(
        rewardAmount
      );
    });

    it("Should not exceed max supply", async function () {
      const maxSupply = ethers.utils.parseEther("1000000000"); // 1 billion
      const currentSupply = await profitHiveToken.totalSupply();
      const excessAmount = maxSupply.sub(currentSupply).add(1);

      await expect(
        profitHiveToken.mint(addr1.address, excessAmount)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Revenue Sharing", function () {
    beforeEach(async function () {
      // Give addr1 some tokens to stake
      const stakeAmount = ethers.utils.parseEther("1000");
      await profitHiveToken.mint(addr1.address, stakeAmount);
      await profitHiveToken
        .connect(addr1)
        .approve(revenueSharing.address, stakeAmount);
    });

    it("Should allow users to stake tokens", async function () {
      const stakeAmount = ethers.utils.parseEther("1000");
      await revenueSharing.connect(addr1).stake(stakeAmount);

      const stakeInfo = await revenueSharing.getUserStakeInfo(addr1.address);
      expect(stakeInfo.stakedAmount).to.equal(stakeAmount);
    });

    it("Should allow owner to deposit revenue", async function () {
      const revenueAmount = ethers.utils.parseEther("10");
      await revenueSharing.depositRevenue({ value: revenueAmount });

      const pool = await revenueSharing.revenuePools(1);
      expect(pool.totalRevenue).to.equal(revenueAmount);
    });

    it("Should distribute revenue to stakers", async function () {
      // Stake tokens
      const stakeAmount = ethers.utils.parseEther("1000");
      await revenueSharing.connect(addr1).stake(stakeAmount);

      // Deposit revenue
      const revenueAmount = ethers.utils.parseEther("10");
      await revenueSharing.depositRevenue({ value: revenueAmount });

      // Distribute revenue
      await revenueSharing.distributeRevenue(1);

      const pool = await revenueSharing.revenuePools(1);
      expect(pool.isDistributed).to.be.true;
    });
  });

  describe("Forecast Data", function () {
    beforeEach(async function () {
      // Register a test store
      await forecastData.registerStore(
        "test-store-001",
        "Test Store",
        "Test City",
        addr1.address
      );
    });

    it("Should register a new store", async function () {
      const store = await forecastData.getStore("test-store-001");
      expect(store.name).to.equal("Test Store");
      expect(store.owner).to.equal(addr1.address);
      expect(store.isActive).to.be.true;
    });

    it("Should allow users to submit forecasts", async function () {
      const currentTime = Math.floor(Date.now() / 1000);
      const predictionStart = currentTime + 86400; // Tomorrow
      const predictionEnd = currentTime + 172800; // Day after tomorrow
      const predictedSales = [1000, 1200, 1100];

      const tx = await forecastData
        .connect(addr1)
        .submitForecast(
          "test-store-001",
          "Test City",
          predictionStart,
          predictionEnd,
          "QmTest123",
          predictedSales
        );

      const receipt = await tx.wait();
      const event = receipt.events?.find(
        (e) => e.event === "ForecastSubmitted"
      );
      expect(event).to.not.be.undefined;

      const forecastId = event?.args?.forecastId;
      const forecast = await forecastData.getForecast(forecastId);
      expect(forecast.forecaster).to.equal(addr1.address);
      expect(forecast.storeId).to.equal("test-store-001");
    });

    it("Should calculate accuracy when actual data is submitted", async function () {
      // Submit forecast
      const currentTime = Math.floor(Date.now() / 1000);
      const predictionStart = currentTime + 86400;
      const predictionEnd = currentTime + 172800;
      const predictedSales = [1000, 1200, 1100];

      await forecastData
        .connect(addr1)
        .submitForecast(
          "test-store-001",
          "Test City",
          predictionStart,
          predictionEnd,
          "QmTest123",
          predictedSales
        );

      // Fast forward time (in real test, you'd use time manipulation)
      await ethers.provider.send("evm_increaseTime", [172801]);
      await ethers.provider.send("evm_mine");

      // Submit actual data
      const actualSales = [950, 1150, 1200]; // Close to predictions
      await forecastData.connect(dataProvider).submitActualData(1, actualSales);

      const forecast = await forecastData.getForecast(1);
      expect(forecast.accuracyCalculated).to.be.true;
      expect(forecast.accuracy).to.be.greaterThan(0);
    });

    it("Should check if forecast is eligible for reward", async function () {
      // Submit forecast with high accuracy
      const currentTime = Math.floor(Date.now() / 1000);
      const predictionStart = currentTime + 86400;
      const predictionEnd = currentTime + 172800;
      const predictedSales = [1000, 1200, 1100];

      await forecastData
        .connect(addr1)
        .submitForecast(
          "test-store-001",
          "Test City",
          predictionStart,
          predictionEnd,
          "QmTest123",
          predictedSales
        );

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [172801]);
      await ethers.provider.send("evm_mine");

      // Submit very accurate data
      const actualSales = [1010, 1190, 1105]; // Very close to predictions
      await forecastData.connect(dataProvider).submitActualData(1, actualSales);

      const isEligible = await forecastData.isEligibleForReward(1);
      expect(isEligible).to.be.true;
    });
  });

  describe("Integration Tests", function () {
    it("Should handle end-to-end forecast and reward flow", async function () {
      // 1. Register store
      await forecastData.registerStore(
        "integration-store",
        "Integration Test Store",
        "Test City",
        addr1.address
      );

      // 2. User stakes tokens
      const stakeAmount = ethers.utils.parseEther("1000");
      await profitHiveToken.mint(addr1.address, stakeAmount);
      await profitHiveToken
        .connect(addr1)
        .approve(revenueSharing.address, stakeAmount);
      await revenueSharing.connect(addr1).stake(stakeAmount);

      // 3. Submit forecast
      const currentTime = Math.floor(Date.now() / 1000);
      const predictionStart = currentTime + 86400;
      const predictionEnd = currentTime + 172800;
      const predictedSales = [1000, 1200, 1100];

      await forecastData
        .connect(addr1)
        .submitForecast(
          "integration-store",
          "Test City",
          predictionStart,
          predictionEnd,
          "QmIntegrationTest",
          predictedSales
        );

      // 4. Fast forward time and submit actual data
      await ethers.provider.send("evm_increaseTime", [172801]);
      await ethers.provider.send("evm_mine");

      const actualSales = [1010, 1190, 1105];
      await forecastData.connect(dataProvider).submitActualData(1, actualSales);

      // 5. Check if eligible for reward
      const isEligible = await forecastData.isEligibleForReward(1);
      expect(isEligible).to.be.true;

      // 6. Add forecast reward
      const rewardAmount = ethers.utils.parseEther("1");
      await revenueSharing.addForecastReward(
        addr1.address,
        9000,
        rewardAmount,
        { value: rewardAmount }
      );

      // 7. Verify the entire flow completed successfully
      const stakeInfo = await revenueSharing.getUserStakeInfo(addr1.address);
      expect(stakeInfo.stakedAmount).to.equal(stakeAmount);

      const forecast = await forecastData.getForecast(1);
      expect(forecast.accuracyCalculated).to.be.true;
    });
  });
});
