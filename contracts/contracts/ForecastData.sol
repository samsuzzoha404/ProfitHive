// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ForecastData
 * @dev Smart contract for storing and managing AI forecast data on-chain
 * Features:
 * - Immutable forecast storage with timestamps
 * - Accuracy tracking and verification
 * - Data integrity and audit trails
 * - Incentivized accurate predictions
 */
contract ForecastData is Ownable, Pausable {
    struct Forecast {
        address forecaster;
        string storeId;
        string city;
        uint256 timestamp;
        uint256 predictionPeriodStart;
        uint256 predictionPeriodEnd;
        string dataHash; // IPFS hash or data hash for verification
        uint256[] predictedSales; // Array of predicted sales values
        uint256[] actualSales; // Array of actual sales values (filled later)
        uint256 accuracy; // Calculated accuracy percentage * 100
        bool isVerified;
        bool accuracyCalculated;
    }

    struct Store {
        string name;
        string location;
        address owner;
        bool isActive;
        uint256 totalForecasts;
        uint256 averageAccuracy;
    }

    // State variables
    mapping(uint256 => Forecast) public forecasts;
    mapping(string => Store) public stores;
    mapping(address => uint256[]) public userForecasts;
    mapping(string => uint256[]) public storeForecasts;

    uint256 public forecastCounter;
    uint256 public constant MIN_ACCURACY_FOR_REWARD = 8000; // 80%

    // Authorized data providers (can submit actual sales data)
    mapping(address => bool) public dataProviders;

    // Events
    event ForecastSubmitted(
        uint256 indexed forecastId,
        address indexed forecaster,
        string storeId,
        uint256 predictionPeriodStart,
        uint256 predictionPeriodEnd
    );
    event ActualDataSubmitted(
        uint256 indexed forecastId,
        address indexed dataProvider
    );
    event AccuracyCalculated(uint256 indexed forecastId, uint256 accuracy);
    event StoreRegistered(string indexed storeId, string name, address owner);
    event DataProviderAdded(address indexed provider);
    event DataProviderRemoved(address indexed provider);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Register a new store
     */
    function registerStore(
        string memory storeId,
        string memory name,
        string memory location,
        address storeOwner
    ) external onlyOwner {
        require(bytes(storeId).length > 0, "Store ID cannot be empty");
        require(
            stores[storeId].owner == address(0),
            "Store already registered"
        );

        stores[storeId] = Store({
            name: name,
            location: location,
            owner: storeOwner,
            isActive: true,
            totalForecasts: 0,
            averageAccuracy: 0
        });

        emit StoreRegistered(storeId, name, storeOwner);
    }

    /**
     * @dev Submit a new forecast
     */
    function submitForecast(
        string memory storeId,
        string memory city,
        uint256 predictionPeriodStart,
        uint256 predictionPeriodEnd,
        string memory dataHash,
        uint256[] memory predictedSales
    ) external whenNotPaused returns (uint256) {
        require(bytes(storeId).length > 0, "Store ID cannot be empty");
        require(stores[storeId].isActive, "Store is not active");
        require(
            predictionPeriodStart < predictionPeriodEnd,
            "Invalid prediction period"
        );
        require(predictedSales.length > 0, "Predicted sales cannot be empty");
        require(
            predictionPeriodStart > block.timestamp,
            "Prediction period must be in the future"
        );

        forecastCounter++;
        uint256 forecastId = forecastCounter;

        forecasts[forecastId] = Forecast({
            forecaster: msg.sender,
            storeId: storeId,
            city: city,
            timestamp: block.timestamp,
            predictionPeriodStart: predictionPeriodStart,
            predictionPeriodEnd: predictionPeriodEnd,
            dataHash: dataHash,
            predictedSales: predictedSales,
            actualSales: new uint256[](0),
            accuracy: 0,
            isVerified: false,
            accuracyCalculated: false
        });

        userForecasts[msg.sender].push(forecastId);
        storeForecasts[storeId].push(forecastId);
        stores[storeId].totalForecasts++;

        emit ForecastSubmitted(
            forecastId,
            msg.sender,
            storeId,
            predictionPeriodStart,
            predictionPeriodEnd
        );

        return forecastId;
    }

    /**
     * @dev Submit actual sales data (only data providers)
     */
    function submitActualData(
        uint256 forecastId,
        uint256[] memory actualSales
    ) external {
        require(
            dataProviders[msg.sender] || msg.sender == owner(),
            "Not authorized to submit actual data"
        );

        Forecast storage forecast = forecasts[forecastId];
        require(forecast.forecaster != address(0), "Forecast does not exist");
        require(!forecast.accuracyCalculated, "Accuracy already calculated");
        require(
            block.timestamp > forecast.predictionPeriodEnd,
            "Prediction period not ended"
        );
        require(
            actualSales.length == forecast.predictedSales.length,
            "Sales data length mismatch"
        );

        forecast.actualSales = actualSales;
        forecast.isVerified = true;

        // Calculate accuracy
        uint256 accuracy = _calculateAccuracy(
            forecast.predictedSales,
            actualSales
        );
        forecast.accuracy = accuracy;
        forecast.accuracyCalculated = true;

        // Update store average accuracy
        _updateStoreAccuracy(forecast.storeId);

        emit ActualDataSubmitted(forecastId, msg.sender);
        emit AccuracyCalculated(forecastId, accuracy);
    }

    /**
     * @dev Calculate forecast accuracy using Mean Absolute Percentage Error (MAPE)
     */
    function _calculateAccuracy(
        uint256[] memory predicted,
        uint256[] memory actual
    ) internal pure returns (uint256) {
        require(predicted.length == actual.length, "Array length mismatch");

        uint256 totalError = 0;
        uint256 validPairs = 0;

        for (uint256 i = 0; i < predicted.length; i++) {
            if (actual[i] > 0) {
                // Avoid division by zero
                uint256 error = actual[i] > predicted[i]
                    ? actual[i] - predicted[i]
                    : predicted[i] - actual[i];
                totalError += (error * 10000) / actual[i]; // Multiply by 10000 for precision
                validPairs++;
            }
        }

        if (validPairs == 0) return 0;

        uint256 mape = totalError / validPairs;
        uint256 accuracy = mape > 10000 ? 0 : 10000 - mape; // Convert MAPE to accuracy percentage

        return accuracy;
    }

    /**
     * @dev Update store's average accuracy
     */
    function _updateStoreAccuracy(string memory storeId) internal {
        uint256[] memory storeForcastIds = storeForecasts[storeId];
        uint256 totalAccuracy = 0;
        uint256 verifiedForecasts = 0;

        for (uint256 i = 0; i < storeForcastIds.length; i++) {
            Forecast storage forecast = forecasts[storeForcastIds[i]];
            if (forecast.accuracyCalculated) {
                totalAccuracy += forecast.accuracy;
                verifiedForecasts++;
            }
        }

        if (verifiedForecasts > 0) {
            stores[storeId].averageAccuracy = totalAccuracy / verifiedForecasts;
        }
    }

    /**
     * @dev Get forecast details
     */
    function getForecast(
        uint256 forecastId
    )
        external
        view
        returns (
            address forecaster,
            string memory storeId,
            string memory city,
            uint256 timestamp,
            uint256 predictionPeriodStart,
            uint256 predictionPeriodEnd,
            string memory dataHash,
            uint256[] memory predictedSales,
            uint256[] memory actualSales,
            uint256 accuracy,
            bool isVerified,
            bool accuracyCalculated
        )
    {
        Forecast memory forecast = forecasts[forecastId];
        return (
            forecast.forecaster,
            forecast.storeId,
            forecast.city,
            forecast.timestamp,
            forecast.predictionPeriodStart,
            forecast.predictionPeriodEnd,
            forecast.dataHash,
            forecast.predictedSales,
            forecast.actualSales,
            forecast.accuracy,
            forecast.isVerified,
            forecast.accuracyCalculated
        );
    }

    /**
     * @dev Get user's forecasts
     */
    function getUserForecasts(
        address user
    ) external view returns (uint256[] memory) {
        return userForecasts[user];
    }

    /**
     * @dev Get store's forecasts
     */
    function getStoreForecasts(
        string memory storeId
    ) external view returns (uint256[] memory) {
        return storeForecasts[storeId];
    }

    /**
     * @dev Get store information
     */
    function getStore(
        string memory storeId
    )
        external
        view
        returns (
            string memory name,
            string memory location,
            address owner,
            bool isActive,
            uint256 totalForecasts,
            uint256 averageAccuracy
        )
    {
        Store memory store = stores[storeId];
        return (
            store.name,
            store.location,
            store.owner,
            store.isActive,
            store.totalForecasts,
            store.averageAccuracy
        );
    }

    /**
     * @dev Check if forecast is eligible for reward
     */
    function isEligibleForReward(
        uint256 forecastId
    ) external view returns (bool) {
        Forecast memory forecast = forecasts[forecastId];
        return
            forecast.accuracyCalculated &&
            forecast.accuracy >= MIN_ACCURACY_FOR_REWARD;
    }

    /**
     * @dev Add data provider
     */
    function addDataProvider(address provider) external onlyOwner {
        dataProviders[provider] = true;
        emit DataProviderAdded(provider);
    }

    /**
     * @dev Remove data provider
     */
    function removeDataProvider(address provider) external onlyOwner {
        dataProviders[provider] = false;
        emit DataProviderRemoved(provider);
    }

    /**
     * @dev Deactivate a store
     */
    function deactivateStore(string memory storeId) external onlyOwner {
        stores[storeId].isActive = false;
    }

    /**
     * @dev Activate a store
     */
    function activateStore(string memory storeId) external onlyOwner {
        stores[storeId].isActive = true;
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
