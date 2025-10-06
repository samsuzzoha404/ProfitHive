const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId || 31337;

  console.log("🚀 Deploying ProfitHive Smart Contracts...");
  console.log("Network:", networkName);
  console.log("Chain ID:", chainId);
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Deploy PlatformControlledToken first (the token you're actually using)
  console.log("\n📄 Deploying PlatformControlledToken...");
  const PlatformControlledToken = await ethers.getContractFactory("PlatformControlledToken");
  const platformToken = await PlatformControlledToken.deploy(deployer.address);
  await platformToken.waitForDeployment();
  const tokenAddress = await platformToken.getAddress();
  console.log("✅ PlatformControlledToken deployed to:", tokenAddress);

  // Deploy RevenueSharing contract
  console.log("\n💰 Deploying RevenueSharing...");
  const RevenueSharing = await ethers.getContractFactory("RevenueSharing");
  const revenueSharing = await RevenueSharing.deploy(
    tokenAddress,
    deployer.address
  );
  await revenueSharing.waitForDeployment();
  const revenueSharingAddress = await revenueSharing.getAddress();
  console.log("✅ RevenueSharing deployed to:", revenueSharingAddress);

  // Deploy ForecastData contract
  console.log("\n🔮 Deploying ForecastData...");
  const ForecastData = await ethers.getContractFactory("ForecastData");
  const forecastData = await ForecastData.deploy(deployer.address);
  await forecastData.waitForDeployment();
  const forecastDataAddress = await forecastData.getAddress();
  console.log("✅ ForecastData deployed to:", forecastDataAddress);

  // Set up RevenueSharing as authorized retailer for PlatformControlledToken
  console.log("\n🔧 Setting up contract permissions...");
  try {
    const authorizeTx = await platformToken.authorizeRetailer(revenueSharingAddress);
    await authorizeTx.wait();
    console.log("✅ RevenueSharing authorized as retailer");
  } catch (error) {
    console.log("⚠️  Warning: Could not authorize retailer:", error.message);
  }

  // Prepare deployment data
  const deploymentData = {
    network: {
      name: networkName,
      chainId: chainId.toString()
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PlatformControlledToken: {
        address: tokenAddress,
        abi: PlatformControlledToken.interface.format("json")
      },
      RevenueSharing: {
        address: revenueSharingAddress,
        abi: RevenueSharing.interface.format("json")
      },
      ForecastData: {
        address: forecastDataAddress,
        abi: ForecastData.interface.format("json")
      }
    }
  };

  // Simple config for frontend/backend
  const simpleConfig = {
    PlatformControlledToken: tokenAddress,
    RevenueSharing: revenueSharingAddress,
    ForecastData: forecastDataAddress,
    network: networkName,
    chainId: chainId
  };

  // Platform-controlled config (matching your existing format)
  const platformControlledConfig = {
    [chainId]: {
      PlatformControlledToken: tokenAddress,
      RevenueSharing: revenueSharingAddress,
      ForecastData: forecastDataAddress
    }
  };

  // Ensure deployments directory exists
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment files
  const networkFile = path.join(deploymentsDir, `${networkName}.json`);
  const configFile = path.join(deploymentsDir, "config.json");
  const platformConfigFile = path.join(deploymentsDir, "platform-controlled-config.json");

  fs.writeFileSync(networkFile, JSON.stringify(deploymentData, null, 2));
  fs.writeFileSync(configFile, JSON.stringify(simpleConfig, null, 2));
  fs.writeFileSync(platformConfigFile, JSON.stringify(platformControlledConfig, null, 2));

  console.log("\n📁 Deployment files saved:");
  console.log("- Full deployment:", networkFile);
  console.log("- Simple config:", configFile);
  console.log("- Platform config:", platformConfigFile);

  // Contract verification info (for manual verification)
  console.log("\n🔍 Contract Verification Info:");
  console.log("PlatformControlledToken constructor args:", deployer.address);
  console.log("RevenueSharing constructor args:", tokenAddress, deployer.address);
  console.log("ForecastData constructor args:", deployer.address);

  // Verify contracts if on a public network
  if (networkName !== "hardhat" && networkName !== "localhost") {
    console.log("\n⏳ Waiting before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      console.log("🔍 Verifying PlatformControlledToken...");
      await hre.run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [deployer.address],
      });
    } catch (error) {
      console.log("⚠️  PlatformControlledToken verification failed:", error.message);
    }

    try {
      console.log("🔍 Verifying RevenueSharing...");
      await hre.run("verify:verify", {
        address: revenueSharingAddress,
        constructorArguments: [tokenAddress, deployer.address],
      });
    } catch (error) {
      console.log("⚠️  RevenueSharing verification failed:", error.message);
    }

    try {
      console.log("🔍 Verifying ForecastData...");
      await hre.run("verify:verify", {
        address: forecastDataAddress,
        constructorArguments: [deployer.address],
      });
    } catch (error) {
      console.log("⚠️  ForecastData verification failed:", error.message);
    }
  }

  console.log("\n🎉 Deployment Complete!");
  console.log("\n📋 Summary:");
  console.log("Network:", networkName);
  console.log("PlatformControlledToken:", tokenAddress);
  console.log("RevenueSharing:", revenueSharingAddress);
  console.log("ForecastData:", forecastDataAddress);
  
  console.log("\n🔗 Next Steps:");
  console.log("1. Update frontend .env with new contract addresses");
  console.log("2. Update backend configuration");
  console.log("3. Test contract interactions");
  console.log("4. Deploy frontend and backend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });