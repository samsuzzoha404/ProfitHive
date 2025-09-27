const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer, treasury, feeCollector] = await hre.ethers.getSigners();

  console.log("Deploying contracts with accounts:");
  console.log("Deployer (Business Owner):", deployer.address);
  console.log("Treasury Wallet:", treasury.address);
  console.log("Fee Collector:", feeCollector.address);
  console.log(
    "Deployer balance:",
    hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))
  );

  // Deploy improved token contract
  console.log("\n=== Deploying ProfitHive Token V2 (Business Model) ===");
  const ProfitHiveTokenV2 = await hre.ethers.getContractFactory(
    "ProfitHiveToken"
  );
  const token = await ProfitHiveTokenV2.deploy(
    deployer.address, // Business owner
    treasury.address, // Treasury wallet for sales revenue
    feeCollector.address // Fee collector for transaction fees
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ProfitHive Token V2 deployed to:", tokenAddress);

  // Deploy Revenue Sharing contract
  console.log("\n=== Deploying Revenue Sharing ===");
  const RevenueSharing = await hre.ethers.getContractFactory("RevenueSharing");
  const revenueSharing = await RevenueSharing.deploy(
    tokenAddress,
    deployer.address
  );
  await revenueSharing.waitForDeployment();
  const revenueSharingAddress = await revenueSharing.getAddress();
  console.log("Revenue Sharing deployed to:", revenueSharingAddress);

  // Deploy Forecast Data contract
  console.log("\n=== Deploying Forecast Data ===");
  const ForecastData = await hre.ethers.getContractFactory("ForecastData");
  const forecastData = await ForecastData.deploy(deployer.address);
  await forecastData.waitForDeployment();
  const forecastDataAddress = await forecastData.getAddress();
  console.log("Forecast Data deployed to:", forecastDataAddress);

  console.log("\n=== Setting up Business Model ===");

  // Authorize revenue sharing contract to mint tokens (for staking rewards)
  await token.authorizeMinter(revenueSharingAddress);
  console.log("✓ Revenue Sharing contract authorized to mint reward tokens");

  // Set up sample retailer account (using account[3])
  const [, , , retailer] = await hre.ethers.getSigners();
  await token.authorizeRetailer(retailer.address);
  console.log("✓ Sample retailer authorized:", retailer.address);

  // Demonstrate business model
  console.log("\n=== Business Model Demonstration ===");

  // Check initial balances
  const businessOwnerBalance = await token.balanceOf(deployer.address);
  console.log(
    "Business Owner Initial Balance:",
    hre.ethers.formatEther(businessOwnerBalance),
    "PHIVE"
  );

  // Set transaction fee to 1%
  await token.setTransactionFeeRate(100); // 1%
  console.log("Transaction fee set to: 1%");

  // Set token price (0.001 ETH per token)
  await token.setTokenPrice(hre.ethers.parseEther("0.001"));
  console.log("Token price set to: 0.001 ETH per token");

  // Get business metrics
  const metrics = await token.getBusinessMetrics();
  console.log("Initial Business Metrics:");
  console.log(
    "- Total Fees Collected:",
    hre.ethers.formatEther(metrics[0]),
    "PHIVE"
  );
  console.log(
    "- Total Tokens Sold:",
    hre.ethers.formatEther(metrics[1]),
    "PHIVE"
  );
  console.log(
    "- Current Token Price:",
    hre.ethers.formatEther(metrics[2]),
    "ETH"
  );
  console.log("- Fee Rate:", metrics[3].toString(), "basis points");
  console.log(
    "- Circulating Supply:",
    hre.ethers.formatEther(metrics[4]),
    "PHIVE"
  );

  // Save deployment information
  const deploymentData = {
    network: hre.network.name,
    chainId: await deployer.provider
      .getNetwork()
      .then((n) => n.chainId.toString()),
    deployer: deployer.address,
    treasury: treasury.address,
    feeCollector: feeCollector.address,
    retailer: retailer.address,
    contracts: {
      ProfitHiveToken: tokenAddress,
      RevenueSharing: revenueSharingAddress,
      ForecastData: forecastDataAddress,
    },
    businessModel: {
      tokenPrice: "0.001 ETH",
      transactionFeeRate: "1%",
      businessReserve: "500,000,000 PHIVE",
      publicSale: "400,000,000 PHIVE",
      teamReserve: "100,000,000 PHIVE",
    },
    deployedAt: new Date().toISOString(),
  };

  // Ensure deployment directory exists
  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  // Save detailed deployment data
  const deploymentFile = path.join(
    deploymentDir,
    `${hre.network.name}-v2.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));

  // Save simple config for frontend
  const simpleConfig = {
    [deploymentData.chainId]: {
      ProfitHiveToken: tokenAddress,
      RevenueSharing: revenueSharingAddress,
      ForecastData: forecastDataAddress,
    },
  };
  const configFile = path.join(deploymentDir, "config-v2.json");
  fs.writeFileSync(configFile, JSON.stringify(simpleConfig, null, 2));

  console.log(`\n✓ Deployment data saved to: ${deploymentFile}`);
  console.log(`✓ Simple config saved to: ${configFile}`);

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", deploymentData.chainId);
  console.log("Business Owner (Deployer):", deployer.address);
  console.log("Treasury Wallet:", treasury.address);
  console.log("Fee Collector:", feeCollector.address);
  console.log("Sample Retailer:", retailer.address);
  console.log("ProfitHive Token V2:", tokenAddress);
  console.log("Revenue Sharing:", revenueSharingAddress);
  console.log("Forecast Data:", forecastDataAddress);

  console.log("\n=== Business Model Features ===");
  console.log("✓ Transaction fees: 1% on all transfers");
  console.log("✓ Token sales: 0.001 ETH per token");
  console.log("✓ Retailer wholesale: 20% discount");
  console.log("✓ Business owner controls supply");
  console.log("✓ Fee collection generates revenue");
  console.log("✓ Staking rewards from minting");

  console.log("\n🎉 Business Model Deployed Successfully!");
  console.log("\nNext Steps:");
  console.log("1. Update frontend config to use new contract addresses");
  console.log("2. Test token purchases through UI");
  console.log("3. Test retailer authorization and wholesale purchases");
  console.log("4. Monitor fee collection and revenue streams");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
