import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ABI = [
  "function updatePrice(uint256 price, uint256 timestamp, bytes calldata attestation) external",
  "function getLatestPrice() external view returns (uint256 price, uint256 timestamp)",
  "function getLatestPriceData() external view returns (tuple(uint256 price, uint256 timestamp, address oracle, bytes32 dataHash))",
  "function setThresholds(uint256 upperBound, uint256 lowerBound, bool enabled) external",
  "function getThresholds() external view returns (tuple(uint256 upperBound, uint256 lowerBound, bool enabled))",
  "function isPriceWithinThresholds(uint256 price) external view returns (bool)",
  "function owner() external view returns (address)",
  "function authorizedApps(string) external view returns (bool)",
  "function authorizedOracles(address) external view returns (bool)",
  "event PriceUpdated(uint256 indexed price, uint256 indexed timestamp, address indexed oracle, string appId)",
  "event ThresholdBreached(uint256 indexed price, bool indexed isUpper, uint256 threshold)",
  "event ThresholdConfigured(uint256 upperBound, uint256 lowerBound, bool enabled)"
];

export function useContract() {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeContract = async () => {
      try {
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        const rpcUrl = process.env.REACT_APP_RPC_URL || 'https://testnet.sapphire.oasis.dev';
        
        if (!contractAddress) {
          throw new Error('Contract address not configured');
        }

        // Create provider
        const jsonRpcProvider = new ethers.JsonRpcProvider(rpcUrl);
        setProvider(jsonRpcProvider);

        // Create contract instance
        const contractInstance = new ethers.Contract(
          contractAddress,
          CONTRACT_ABI,
          jsonRpcProvider
        );

        // Test connection by calling a view function
        await contractInstance.getLatestPrice();
        
        setContract(contractInstance);
        setIsConnected(true);
        setError(null);
        
        console.log('Contract connected successfully:', contractAddress);
        
      } catch (err) {
        console.error('Failed to initialize contract:', err);
        setError(err.message);
        setIsConnected(false);
      }
    };

    initializeContract();
  }, []);

  // Function to get contract with signer (for write operations)
  const getContractWithSigner = async () => {
    if (!contract || typeof window.ethereum === 'undefined') {
      throw new Error('Contract or wallet not available');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    return new ethers.Contract(
      contract.target,
      CONTRACT_ABI,
      signer
    );
  };

  return {
    contract,
    provider,
    isConnected,
    error,
    getContractWithSigner
  };
}
