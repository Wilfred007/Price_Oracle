import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PriceDisplay from './components/PriceDisplay';
import ThresholdConfig from './components/ThresholdConfig';
import PriceChart from './components/PriceChart';
import ConnectionStatus from './components/ConnectionStatus';
import AlertSystem from './components/AlertSystem';
import { useContract } from './hooks/useContract';
import { usePriceData } from './hooks/usePriceData';
import { useNotifications } from './hooks/useNotifications';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  
  const { contract, provider, isConnected } = useContract();
  const { priceData, priceHistory, loading, error } = usePriceData(contract);
  const { notifications, addNotification, clearNotifications } = useNotifications();

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setWalletConnected(true);
        
        // Check if user is contract owner
        if (contract) {
          try {
            const owner = await contract.owner();
            setIsOwner(owner.toLowerCase() === address.toLowerCase());
          } catch (err) {
            console.error('Error checking owner:', err);
          }
        }
        
        addNotification('Wallet connected successfully', 'success');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        addNotification('Failed to connect wallet', 'error');
      }
    } else {
      addNotification('Please install MetaMask', 'error');
    }
  };

  // Handle account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWalletConnected(false);
          setAccount('');
          setIsOwner(false);
        } else {
          setAccount(accounts[0]);
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // Monitor price updates and thresholds
  useEffect(() => {
    if (!contract) return;

    const handlePriceUpdate = (price, timestamp, oracle, appId) => {
      const priceValue = ethers.formatUnits(price, 8);
      addNotification(
        `Price updated: $${parseFloat(priceValue).toFixed(2)}`,
        'info'
      );
    };

    const handleThresholdBreach = (price, isUpper, threshold) => {
      const priceValue = ethers.formatUnits(price, 8);
      const thresholdValue = ethers.formatUnits(threshold, 8);
      const direction = isUpper ? 'above' : 'below';
      
      addNotification(
        `⚠️ Price Alert: $${parseFloat(priceValue).toFixed(2)} is ${direction} threshold of $${parseFloat(thresholdValue).toFixed(2)}`,
        'warning'
      );
    };

    contract.on('PriceUpdated', handlePriceUpdate);
    contract.on('ThresholdBreached', handleThresholdBreach);

    return () => {
      contract.off('PriceUpdated', handlePriceUpdate);
      contract.off('ThresholdBreached', handleThresholdBreach);
    };
  }, [contract, addNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            🔮 Verifiable Price Oracle
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Secure ETH price data powered by Oasis ROFL
          </p>
          
          {/* Connection Status */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <ConnectionStatus 
              isConnected={isConnected}
              walletConnected={walletConnected}
              account={account}
            />
            
            {!walletConnected && (
              <button
                onClick={connectWallet}
                className="bg-oasis-blue hover:bg-oasis-purple text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Alert System */}
        <AlertSystem 
          notifications={notifications}
          onClear={clearNotifications}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Display - Main Column */}
          <div className="lg:col-span-2">
            <PriceDisplay 
              priceData={priceData}
              loading={loading}
              error={error}
            />
            
            {/* Price Chart */}
            {priceHistory.length > 0 && (
              <div className="mt-8">
                <PriceChart priceHistory={priceHistory} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Threshold Configuration */}
            {isOwner && walletConnected && (
              <ThresholdConfig 
                contract={contract}
                onUpdate={(message, type) => addNotification(message, type)}
              />
            )}

            {/* Oracle Information */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                📊 Oracle Status
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Network:</span>
                  <span className="text-white font-mono">
                    {process.env.REACT_APP_NETWORK_NAME || 'Sapphire Testnet'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Contract:</span>
                  <span className="text-white font-mono text-xs">
                    {process.env.REACT_APP_CONTRACT_ADDRESS ? 
                      `${process.env.REACT_APP_CONTRACT_ADDRESS.slice(0, 6)}...${process.env.REACT_APP_CONTRACT_ADDRESS.slice(-4)}` :
                      'Not configured'
                    }
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Data Source:</span>
                  <span className="text-white">CoinGecko API</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">TEE Provider:</span>
                  <span className="text-white">Oasis ROFL</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">
                🚀 Quick Start
              </h3>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-success-green">1.</span>
                  <span>Connect your wallet to view live prices</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-success-green">2.</span>
                  <span>Price updates are verified by TEE attestation</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-success-green">3.</span>
                  <span>Set custom thresholds for price alerts</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <span className="text-success-green">4.</span>
                  <span>Monitor real-time price movements</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-400">
          <p className="mb-2">
            Built with ❤️ using Oasis ROFL • Sapphire • React
          </p>
          <p className="text-sm">
            Secure • Verifiable • Decentralized
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
