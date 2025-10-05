import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * BlockchainService - Manages smart contract interactions
 * Handles ProfitHive Token, Revenue Sharing, and Forecast Data contracts
 */
class BlockchainService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {
            profitHiveToken: null,
            revenueSharing: null,
            forecastData: null
        };
        this.isInitialized = false;
    }

    /**
     * Initialize blockchain connection and load contracts
     */
    async initialize(networkUrl = 'http://127.0.0.1:8545', privateKey = null) {
        try {
            console.log('🔗 Initializing Blockchain Service...');
            
            // Setup provider
            this.provider = new ethers.JsonRpcProvider(networkUrl);
            
            // Setup signer if private key provided
            if (privateKey) {
                this.signer = new ethers.Wallet(privateKey, this.provider);
                console.log('✓ Wallet connected:', this.signer.address);
            }

            // Load contract addresses and ABIs
            await this.loadContracts();
            
            this.isInitialized = true;
            console.log('✅ Blockchain Service initialized successfully');
            
            return true;
        } catch (error) {
            console.error('❌ Blockchain Service initialization failed:', error.message);
            return false;
        }
    }

    /**
     * Load contract addresses and ABIs from deployment files
     */
    async loadContracts() {
        try {
            const deploymentsPath = path.join(__dirname, '../../contracts/deployments');
            
            // Try to load from config.json first (simplified config)
            const configPath = path.join(deploymentsPath, 'config.json');
            
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                console.log('📄 Loading contracts from config.json...');
                
                // Load ABIs from artifacts (if available)
                this.contractAddresses = {
                    profitHiveToken: config.ProfitHiveToken,
                    revenueSharing: config.RevenueSharing,
                    forecastData: config.ForecastData
                };

                // Try to load ABIs from artifacts
                await this.loadABIs();
                
                console.log('✓ Contract addresses loaded:', this.contractAddresses);
            } else {
                console.log('⚠️  No deployment config found. Contracts need to be deployed first.');
                console.log('💡 Run: cd contracts && npm run deploy:local');
            }
        } catch (error) {
            console.error('❌ Failed to load contracts:', error.message);
        }
    }

    /**
     * Load contract ABIs from artifacts
     */
    async loadABIs() {
        try {
            const artifactsPath = path.join(__dirname, '../../contracts/artifacts/contracts');
            
            // Load ProfitHive Token ABI
            const tokenArtifact = path.join(artifactsPath, 'ProfitHiveToken.sol/ProfitHiveToken.json');
            if (fs.existsSync(tokenArtifact)) {
                const tokenData = JSON.parse(fs.readFileSync(tokenArtifact, 'utf8'));
                this.abis = { ...this.abis, profitHiveToken: tokenData.abi };
            }

            // Load Revenue Sharing ABI
            const revenueArtifact = path.join(artifactsPath, 'RevenueSharing.sol/RevenueSharing.json');
            if (fs.existsSync(revenueArtifact)) {
                const revenueData = JSON.parse(fs.readFileSync(revenueArtifact, 'utf8'));
                this.abis = { ...this.abis, revenueSharing: revenueData.abi };
            }

            // Load Forecast Data ABI
            const forecastArtifact = path.join(artifactsPath, 'ForecastData.sol/ForecastData.json');
            if (fs.existsSync(forecastArtifact)) {
                const forecastData = JSON.parse(fs.readFileSync(forecastArtifact, 'utf8'));
                this.abis = { ...this.abis, forecastData: forecastData.abi };
            }

            console.log('✓ Contract ABIs loaded');
        } catch (error) {
            console.log('⚠️  Could not load ABIs from artifacts:', error.message);
        }
    }

    /**
     * Get contract instance
     */
    getContract(contractName) {
        if (!this.isInitialized) {
            throw new Error('Blockchain service not initialized');
        }

        if (!this.contractAddresses || !this.contractAddresses[contractName]) {
            throw new Error(`Contract ${contractName} not found. Deploy contracts first.`);
        }

        if (!this.abis || !this.abis[contractName]) {
            throw new Error(`ABI for ${contractName} not loaded`);
        }

        const address = this.contractAddresses[contractName];
        const abi = this.abis[contractName];
        
        return new ethers.Contract(
            address, 
            abi, 
            this.signer || this.provider
        );
    }

    /**
     * Submit AI forecast to blockchain
     */
    async submitForecast(forecastData) {
        try {
            const forecastContract = this.getContract('forecastData');
            
            const tx = await forecastContract.submitForecast(
                forecastData.storeId,
                forecastData.city,
                forecastData.predictionPeriodStart,
                forecastData.predictionPeriodEnd,
                forecastData.dataHash,
                forecastData.predictedSales
            );

            console.log('📊 Forecast submitted. Transaction:', tx.hash);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                forecastId: receipt.logs[0]?.args?.forecastId || null
            };
        } catch (error) {
            console.error('❌ Failed to submit forecast:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Submit actual sales data for accuracy calculation
     */
    async submitActualSales(forecastId, actualSales) {
        try {
            const forecastContract = this.getContract('forecastData');
            
            const tx = await forecastContract.submitActualData(
                forecastId,
                actualSales
            );

            console.log('📈 Actual sales submitted. Transaction:', tx.hash);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                accuracy: receipt.logs[0]?.args?.accuracy || null
            };
        } catch (error) {
            console.error('❌ Failed to submit actual sales:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Tokenize revenue - mint revenue-backed tokens
     */
    async tokenizeRevenue(retailerAddress, revenueAmount, tokenAmount) {
        try {
            const tokenContract = this.getContract('profitHiveToken');
            
            // Mint tokens for revenue tokenization
            const tx = await tokenContract.mint(retailerAddress, tokenAmount);
            
            console.log('🪙 Revenue tokenized. Transaction:', tx.hash);
            const receipt = await tx.wait();
            
            return {
                success: true,
                transactionHash: tx.hash,
                tokenAmount: tokenAmount,
                retailer: retailerAddress
            };
        } catch (error) {
            console.error('❌ Failed to tokenize revenue:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Distribute revenue to token holders
     */
    async distributeRevenue(poolId) {
        try {
            const revenueContract = this.getContract('revenueSharing');
            
            const tx = await revenueContract.distributeRevenue(poolId);
            
            console.log('💰 Revenue distributed. Transaction:', tx.hash);
            await tx.wait();
            
            return { success: true, transactionHash: tx.hash };
        } catch (error) {
            console.error('❌ Failed to distribute revenue:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get forecast accuracy and eligibility for rewards
     */
    async getForecastAccuracy(forecastId) {
        try {
            const forecastContract = this.getContract('forecastData');
            
            const forecast = await forecastContract.forecasts(forecastId);
            
            return {
                accuracy: forecast.accuracy,
                isVerified: forecast.isVerified,
                accuracyCalculated: forecast.accuracyCalculated,
                eligibleForReward: forecast.accuracy >= 8000 // 80% minimum
            };
        } catch (error) {
            console.error('❌ Failed to get forecast accuracy:', error.message);
            return null;
        }
    }

    /**
     * Get user staking information
     */
    async getUserStakeInfo(userAddress) {
        try {
            const revenueContract = this.getContract('revenueSharing');
            
            const stakeInfo = await revenueContract.getUserStakeInfo(userAddress);
            
            return {
                stakedAmount: stakeInfo.stakedAmount,
                stakingTimestamp: stakeInfo.stakingTimestamp,
                claimableAmount: stakeInfo.claimableAmount,
                canUnstake: stakeInfo.canUnstake
            };
        } catch (error) {
            console.error('❌ Failed to get stake info:', error.message);
            return null;
        }
    }

    /**
     * Check if contracts are deployed and accessible
     */
    async healthCheck() {
        try {
            if (!this.isInitialized) {
                return { healthy: false, error: 'Service not initialized' };
            }

            // Try to call a simple view function
            const network = await this.provider.getNetwork();
            
            return {
                healthy: true,
                network: {
                    name: network.name,
                    chainId: Number(network.chainId)
                },
                contractsLoaded: !!this.contractAddresses,
                contracts: this.contractAddresses
            };
        } catch (error) {
            return { healthy: false, error: error.message };
        }
    }
}

// Create singleton instance
const blockchainService = new BlockchainService();

export default blockchainService;