const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // Deploy ProfitHive Token
  console.log("\n=== Deploying ProfitHive Token ===");
  const ProfitHiveToken = await ethers.getContractFactory("ProfitHiveToken");
  const profitHiveToken = await ProfitHiveToken.deploy(deployer.address);
  await profitHiveToken.waitForDeployment();
  console.log(
    "ProfitHive Token deployed to:",
    await profitHiveToken.getAddress()
  );

  // Deploy Revenue Sharing
  console.log("\n=== Deploying Revenue Sharing ===");
  const RevenueSharing = await ethers.getContractFactory("RevenueSharing");
  const revenueSharing = await RevenueSharing.deploy(
    await profitHiveToken.getAddress(),
    deployer.address
  );
  await revenueSharing.waitForDeployment();
  console.log(
    "Revenue Sharing deployed to:",
    await revenueSharing.getAddress()
  );

  // Deploy Forecast Data
  console.log("\n=== Deploying Forecast Data ===");
  const ForecastData = await ethers.getContractFactory("ForecastData");
  const forecastData = await ForecastData.deploy(deployer.address);
  await forecastData.waitForDeployment();
  console.log("Forecast Data deployed to:", await forecastData.getAddress());

  // Set up permissions
  console.log("\n=== Setting up permissions ===");

  // Add RevenueSharing as a minter and rewarder for the token
  await profitHiveToken.addMinter(await revenueSharing.getAddress());
  await profitHiveToken.addRewarder(await revenueSharing.getAddress());
  console.log(
    "✓ Revenue Sharing contract authorized to mint and reward tokens"
  );

  // Add deployer as data provider for ForecastData (for testing)
  await forecastData.addDataProvider(deployer.address);
  console.log("✓ Deployer added as data provider for Forecast Data");

  // Register a sample store for testing
  await forecastData.registerStore(
    "cafe-cyber-001",
    "Cafe Cyberjaya",
    "Cyberjaya",
    deployer.address
  );
  console.log("✓ Sample store registered");

  // Save contract addresses and ABIs
  const deploymentData = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      ProfitHiveToken: {
        address: await profitHiveToken.getAddress(),
        abi: ProfitHiveToken.interface.format("json"),
      },
      RevenueSharing: {
        address: await revenueSharing.getAddress(),
        abi: RevenueSharing.interface.format("json"),
      },
      ForecastData: {
        address: await forecastData.getAddress(),
        abi: ForecastData.interface.format("json"),
      },
    },
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment data
  const networkName = (await ethers.provider.getNetwork()).name || "localhost";
  const deploymentFile = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log(`\n✓ Deployment data saved to: ${deploymentFile}`);

  // Create a simplified config for frontend/backend
  const networkInfo = await ethers.provider.getNetwork();
  const simpleConfig = {
    ProfitHiveToken: await profitHiveToken.getAddress(),
    RevenueSharing: await revenueSharing.getAddress(),
    ForecastData: await forecastData.getAddress(),
    network: networkName,
    chainId: Number(networkInfo.chainId),
  };

  const configFile = path.join(deploymentsDir, "config.json");
  fs.writeFileSync(configFile, JSON.stringify(simpleConfig, null, 2));
  console.log(`✓ Simple config saved to: ${configFile}`);

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${networkName}`);
  console.log(`Chain ID: ${Number(networkInfo.chainId)}`);
  console.log(`ProfitHive Token: ${await profitHiveToken.getAddress()}`);
  console.log(`Revenue Sharing: ${await revenueSharing.getAddress()}`);
  console.log(`Forecast Data: ${await forecastData.getAddress()}`);
  console.log("\n🎉 All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
