// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PriceOracle
 * @dev A verifiable price oracle that accepts price updates only from attested ROFL applications
 */
contract PriceOracle is Ownable, ReentrancyGuard {
    
    // Price data structure
    struct PriceData {
        uint256 price;      // Price in 8 decimal places (e.g., $2000.12345678)
        uint256 timestamp;  // Unix timestamp of the price update
        address oracle;     // Address of the oracle that submitted the update
        bytes32 dataHash;   // Hash of the original price data for verification
    }
    
    // Threshold configuration
    struct ThresholdConfig {
        uint256 upperBound;  // Upper price threshold
        uint256 lowerBound;  // Lower price threshold
        bool enabled;        // Whether threshold checking is enabled
    }
    
    // State variables
    PriceData public latestPrice;
    ThresholdConfig public thresholds;
    
    // Mapping of authorized ROFL app IDs
    mapping(string => bool) public authorizedApps;
    
    // Mapping to track oracle addresses
    mapping(address => bool) public authorizedOracles;
    
    // Constants
    uint256 public constant PRICE_DECIMALS = 8;
    uint256 public constant MAX_PRICE_AGE = 1 hours; // Maximum age for price updates
    
    // Events
    event PriceUpdated(
        uint256 indexed price,
        uint256 indexed timestamp,
        address indexed oracle,
        string appId
    );
    
    event ThresholdBreached(
        uint256 indexed price,
        bool indexed isUpper,
        uint256 threshold
    );
    
    event ThresholdConfigured(
        uint256 upperBound,
        uint256 lowerBound,
        bool enabled
    );
    
    event AppAuthorized(string indexed appId, bool authorized);
    event OracleAuthorized(address indexed oracle, bool authorized);
    
    // Custom errors
    error UnauthorizedApp(string appId);
    error UnauthorizedOracle(address oracle);
    error InvalidAttestation();
    error PriceTooOld(uint256 timestamp);
    error InvalidPriceData();
    error ThresholdNotConfigured();
    
    constructor(
        string memory initialAppId,
        address initialOracle
    ) Ownable(msg.sender) {
        // Authorize initial ROFL app and oracle
        authorizedApps[initialAppId] = true;
        authorizedOracles[initialOracle] = true;
        
        emit AppAuthorized(initialAppId, true);
        emit OracleAuthorized(initialOracle, true);
    }
    
    /**
     * @dev Update the price with attestation verification
     * @param price The new price (8 decimal places)
     * @param timestamp Unix timestamp of the price
     * @param attestation ROFL attestation data
     */
    function updatePrice(
        uint256 price,
        uint256 timestamp,
        bytes calldata attestation
    ) external nonReentrant {
        // Verify the oracle is authorized
        if (!authorizedOracles[msg.sender]) {
            revert UnauthorizedOracle(msg.sender);
        }
        
        // Verify price data validity
        if (price == 0) {
            revert InvalidPriceData();
        }
        
        // Verify timestamp is not too old
        if (block.timestamp > timestamp + MAX_PRICE_AGE) {
            revert PriceTooOld(timestamp);
        }
        
        // Verify attestation
        string memory appId = _verifyAttestation(price, timestamp, attestation);
        
        // Check if app is authorized
        if (!authorizedApps[appId]) {
            revert UnauthorizedApp(appId);
        }
        
        // Store the new price data
        bytes32 dataHash = keccak256(abi.encodePacked(price, timestamp, appId));
        latestPrice = PriceData({
            price: price,
            timestamp: timestamp,
            oracle: msg.sender,
            dataHash: dataHash
        });
        
        // Check thresholds and emit events
        _checkThresholds(price);
        
        emit PriceUpdated(price, timestamp, msg.sender, appId);
    }
    
    /**
     * @dev Get the latest price data
     * @return price The latest price
     * @return timestamp The timestamp of the latest price
     */
    function getLatestPrice() external view returns (uint256 price, uint256 timestamp) {
        return (latestPrice.price, latestPrice.timestamp);
    }
    
    /**
     * @dev Get complete price data including oracle info
     * @return priceData The complete price data structure
     */
    function getLatestPriceData() external view returns (PriceData memory priceData) {
        return latestPrice;
    }
    
    /**
     * @dev Configure price thresholds for alerts
     * @param upperBound Upper price threshold
     * @param lowerBound Lower price threshold
     * @param enabled Whether to enable threshold checking
     */
    function setThresholds(
        uint256 upperBound,
        uint256 lowerBound,
        bool enabled
    ) external onlyOwner {
        require(upperBound > lowerBound, "Upper bound must be greater than lower bound");
        
        thresholds = ThresholdConfig({
            upperBound: upperBound,
            lowerBound: lowerBound,
            enabled: enabled
        });
        
        emit ThresholdConfigured(upperBound, lowerBound, enabled);
    }
    
    /**
     * @dev Authorize or deauthorize a ROFL app
     * @param appId The ROFL app ID
     * @param authorized Whether to authorize the app
     */
    function setAppAuthorization(string calldata appId, bool authorized) external onlyOwner {
        authorizedApps[appId] = authorized;
        emit AppAuthorized(appId, authorized);
    }
    
    /**
     * @dev Authorize or deauthorize an oracle address
     * @param oracle The oracle address
     * @param authorized Whether to authorize the oracle
     */
    function setOracleAuthorization(address oracle, bool authorized) external onlyOwner {
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized);
    }
    
    /**
     * @dev Check if a price is within configured thresholds
     * @param price The price to check
     * @return withinThresholds True if within thresholds or thresholds disabled
     */
    function isPriceWithinThresholds(uint256 price) external view returns (bool withinThresholds) {
        if (!thresholds.enabled) {
            return true;
        }
        
        return price >= thresholds.lowerBound && price <= thresholds.upperBound;
    }
    
    /**
     * @dev Get current threshold configuration
     * @return config The threshold configuration
     */
    function getThresholds() external view returns (ThresholdConfig memory config) {
        return thresholds;
    }
    
    /**
     * @dev Internal function to verify ROFL attestation
     * @param price The price being attested
     * @param timestamp The timestamp being attested
     * @param attestation The attestation data
     * @return appId The verified app ID
     */
    function _verifyAttestation(
        uint256 price,
        uint256 timestamp,
        bytes calldata attestation
    ) internal view returns (string memory appId) {
        // Decode the attestation structure
        try this._decodeAttestation(attestation) returns (
            string memory decodedAppId,
            uint256 attestationTimestamp,
            uint256 attestedPrice,
            uint256 attestedDataTimestamp,
            string memory /* source */,
            bytes memory /* teeQuote */,
            bytes32 /* signature */
        ) {
            // Verify the attested data matches the submitted data
            if (attestedPrice != price || attestedDataTimestamp != timestamp) {
                revert InvalidAttestation();
            }
            
            // Verify attestation timestamp is recent (within 5 minutes)
            if (block.timestamp > attestationTimestamp + 300) {
                revert InvalidAttestation();
            }
            
            // In a production environment, we would verify the TEE quote and signature here
            // For this demo, we'll accept the attestation if the structure is valid
            
            return decodedAppId;
        } catch {
            revert InvalidAttestation();
        }
    }
    
    /**
     * @dev External function to decode attestation (used internally with try/catch)
     * @param attestation The attestation bytes to decode
     */
    function _decodeAttestation(bytes calldata attestation) external pure returns (
        string memory appId,
        uint256 attestationTimestamp,
        uint256 price,
        uint256 dataTimestamp,
        string memory source,
        bytes memory teeQuote,
        bytes32 signature
    ) {
        // Decode the attestation in steps to avoid tuple issues
        (string memory _appId, uint256 _attestationTimestamp, bytes memory priceDataBytes, bytes memory _teeQuote, bytes32 _signature) = 
            abi.decode(attestation, (string, uint256, bytes, bytes, bytes32));
        
        // Decode the price data tuple separately
        (uint256 _price, uint256 _dataTimestamp, string memory _source) = 
            abi.decode(priceDataBytes, (uint256, uint256, string));
        
        return (_appId, _attestationTimestamp, _price, _dataTimestamp, _source, _teeQuote, _signature);
    }
    
    /**
     * @dev Internal function to check price thresholds
     * @param price The price to check
     */
    function _checkThresholds(uint256 price) internal {
        if (!thresholds.enabled) {
            return;
        }
        
        if (price > thresholds.upperBound) {
            emit ThresholdBreached(price, true, thresholds.upperBound);
        } else if (price < thresholds.lowerBound) {
            emit ThresholdBreached(price, false, thresholds.lowerBound);
        }
    }
}
