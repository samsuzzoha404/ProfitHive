const { ethers } = require("hardhat");

async function main() {
  console.log(
    "=== Deploying Platform-Controlled Business Tokenization System ==="
  );

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();

  console.log("Deploying contracts with the account:", deployerAddress);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployerAddress)).toString()
  );

  // Deploy Platform Controlled Token (business owner controls all supply)
  console.log("\n=== Deploying Platform Controlled Token ===");
  const PlatformControlledToken = await ethers.getContractFactory(
    "PlatformControlledToken"
  );

  // Platform fee collector (can be same as owner or separate wallet)
  const platformFeeCollector = deployerAddress; // You as platform owner collect fees

  const platformToken = await PlatformControlledToken.deploy(
    platformFeeCollector
  );
  await platformToken.waitForDeployment();

  console.log(
    "✅ Platform Controlled Token deployed to:",
    await platformToken.getAddress()
  );
  console.log(
    "✅ Platform Owner (YOU) has full token control:",
    deployerAddress
  );
  console.log("✅ Platform Fee Collector:", platformFeeCollector);

  // Deploy Revenue Sharing (updated to work with new token)
  console.log("\n=== Deploying Revenue Sharing Contract ===");
  const RevenueSharing = await ethers.getContractFactory("RevenueSharing");
  const revenueSharing = await RevenueSharing.deploy(
    await platformToken.getAddress(),
    deployerAddress
  );
  await revenueSharing.waitForDeployment();

  console.log(
    "✅ Revenue Sharing deployed to:",
    await revenueSharing.getAddress()
  );

  // Deploy Forecast Data Contract
  console.log("\n=== Deploying Forecast Data Contract ===");
  const ForecastData = await ethers.getContractFactory("ForecastData");
  const forecastData = await ForecastData.deploy(deployerAddress);
  await forecastData.waitForDeployment();

  console.log("✅ Forecast Data deployed to:", await forecastData.getAddress());

  // Setup proper permissions for business model
  console.log("\n=== Setting Up Business Model Permissions ===");

  // Revenue sharing contract is already configured with token address via constructor
  console.log("✅ Revenue Sharing configured with platform token address");

  // Set up forecast data permissions
  await forecastData.addDataProvider(deployerAddress);
  console.log("✅ Platform owner authorized as data provider");

  // Register sample business for testing
  await forecastData.registerStore(
    "sample-store",
    "Sample Retail Store",
    "Downtown Mall",
    deployerAddress
  );
  console.log("✅ Sample retail store registered");

  // Display business model summary
  console.log("\n=== PLATFORM BUSINESS MODEL SUMMARY ===");
  console.log("🏢 Platform Owner (YOU):", deployerAddress);
  console.log(
    "💰 Total Token Supply: 1,000,000,000 PHIVE (ALL controlled by YOU)"
  );
  console.log("💵 Initial Token Price: 1 ETH per 1,000 PHIVE tokens");
  console.log("📈 Platform Fee: 2% on all token transfers");
  console.log("🛒 Minimum Purchase: 1,000 PHIVE tokens");

  console.log("\n=== HOW THE BUSINESS MODEL WORKS ===");
  console.log(
    "1. 🏪 Retailers must BUY tokens from YOU (platform owner) with ETH"
  );
  console.log("2. 💎 Investors buy tokens from retailers or secondary market");
  console.log("3. 💸 YOU earn ETH from direct token sales to retailers");
  console.log("4. 🔄 YOU earn 2% fees from ALL token transactions");
  console.log("5. 📊 YOU control token price and supply distribution");

  // Save deployment information
  const platformTokenAddr = await platformToken.getAddress();
  const revenueSharingAddr = await revenueSharing.getAddress();
  const forecastDataAddr = await forecastData.getAddress();

  const networkInfo = await ethers.provider.getNetwork();
  const deploymentData = {
    network: hre.network.name,
    chainId: Number(networkInfo.chainId),
    deployer: deployerAddress,
    contracts: {
      PlatformControlledToken: {
        address: platformTokenAddr,
        owner: deployerAddress,
        feeCollector: platformFeeCollector,
        totalSupply: "1000000000000000000000000000", // 1B tokens
        initialPrice: "1000000000000000000", // 1 ETH per 1000 tokens
      },
      RevenueSharing: {
        address: revenueSharingAddr,
        tokenContract: platformTokenAddr,
      },
      ForecastData: {
        address: forecastDataAddr,
        dataProvider: deployerAddress,
      },
    },
    businessModel: {
      platformOwner: deployerAddress,
      tokenControlType: "FULL_PLATFORM_CONTROL",
      revenueStreams: [
        "Direct token sales to retailers",
        "2% transaction fees on all transfers",
        "Price control and scarcity management",
      ],
      purchaseFlow: "Platform Owner → Retailers → Investors",
    },
  };

  // Create deployment directory if it doesn't exist
  const fs = require("fs");
  const path = require("path");
  const deployDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir, { recursive: true });
  }

  // Save detailed deployment data
  const deploymentFile = path.join(
    deployDir,
    `platform-controlled-${hre.network.name}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

  // Save simple config for frontend
  const simpleConfig = {
    [deploymentData.chainId]: {
      ProfitHiveToken: platformTokenAddr,
      RevenueSharing: revenueSharingAddr,
      ForecastData: forecastDataAddr,
    },
  };

  const configFile = path.join(deployDir, "platform-controlled-config.json");
  fs.writeFileSync(configFile, JSON.stringify(simpleConfig, null, 2));

  console.log(`\n✅ Deployment data saved to: ${deploymentFile}`);
  console.log(`✅ Frontend config saved to: ${configFile}`);

  console.log("\n=== FINAL DEPLOYMENT SUMMARY ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${deploymentData.chainId}`);
  console.log(`Platform Controlled Token: ${platformTokenAddr}`);
  console.log(`Revenue Sharing: ${revenueSharingAddr}`);
  console.log(`Forecast Data: ${forecastDataAddr}`);

  console.log(
    "\n🎉 Platform-Controlled Business Tokenization System Deployed!"
  );
  console.log("💡 YOU now control the entire token economy!");
  console.log("💰 Retailers must purchase tokens from YOU with ETH!");
  console.log("📈 YOU earn fees on every transaction!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
