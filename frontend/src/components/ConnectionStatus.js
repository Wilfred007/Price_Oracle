import React from 'react';

function ConnectionStatus({ isConnected, walletConnected, account }) {
  return (
    <div className="flex items-center space-x-4">
      {/* Contract Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success-green animate-pulse' : 'bg-error-red'}`}></div>
        <span className="text-sm text-white">
          Contract: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Wallet Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${walletConnected ? 'bg-success-green animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-sm text-white">
          Wallet: {walletConnected ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not Connected'}
        </span>
      </div>

      {/* Network Indicator */}
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 rounded-full bg-oasis-blue animate-pulse"></div>
        <span className="text-sm text-white">
          {process.env.REACT_APP_NETWORK_NAME || 'Sapphire Testnet'}
        </span>
      </div>
    </div>
  );
}

export default ConnectionStatus;
